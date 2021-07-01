const Decimal = require('../../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });
const LZString = require('../../../common/crypto/lz-string');
const compressUnifiedAddress = require('../../../common/compress-unified-address.js');

const regular = require('./regular.js');

function parseTargetAdresses (target) {
  const targetSubAddressPairs = target.split(',').map(x => x.split(':')); // 'btc:123,eth:456' -> ['btc:123','eth:456'] -> [['btc','123'],['eth','456']]
  const targetSubAddresses = {};
  for (const targetSubAddressPair of targetSubAddressPairs) { // [['btc','123'],['eth','456']] -> {btc:'123',eth:'456'}
    const [subSymbol, targetSubAddress] = targetSubAddressPair;
    targetSubAddresses[subSymbol] = targetSubAddress;
  }
  return targetSubAddresses;
}

function createSubTransactionStep (subSymbol, targetSubAddress, amount, data) {
  return {
    data: {
      symbol: subSymbol,
      target: targetSubAddress,
      amount,
      validate: false,
      // TODO     message:
      time: data.time,
      host: data.host,
      channel: data.channel
    },
    step: 'rawTransaction'
  };
}

const combineSubTransactions = dataCallback => subTransactions => { // subTransactions = {eth:'tx',btc:'tx1'} => 'eth:tx,btc:tx2'
  const combinedCompressedSubTransactions = Object.keys(subTransactions).reduce((transactionString, subSymbol) => {
    const compressedSubTransaction = LZString.compressToEncodedURIComponent(subTransactions[subSymbol]);
    return transactionString + (transactionString ? ',' : '') + subSymbol + ':' + compressedSubTransaction;
  }, '');
  dataCallback(combinedCompressedSubTransactions);
};

const sortByValuation = ([subSymbolA, valuationA], [subSymbolB, valuationB]) => valuationA - valuationB;

const createTransaction = (assets, targetSubAddresses, availableBalances, data, dataCallback, errorCallback, progressCallback) => function (subSymbolsSortedByValuation) {
  let remainingAmount = new Decimal(data.amount);
  const subTransactionSteps = {_options: {failIfAnyFails: true}};
  for (const subSymbol of subSymbolsSortedByValuation) {
    const subBalance = availableBalances[subSymbol];
    const subAsset = assets[subSymbol];
    const delta = new Decimal(subBalance).minus(remainingAmount); // a+b+c+d-amount
    if (delta.isZero()) { // including the balance of this sub asset the cummulative amount is exactly the requested amount
      subTransactionSteps[subSymbol] = createSubTransactionStep(subSymbol, targetSubAddresses[subSymbol], subBalance, data);
      break;
    } else if (delta.isNegative()) { // including the balance of this sub asset the cummulative amount is not yet enough
      subTransactionSteps[subSymbol] = createSubTransactionStep(subSymbol, targetSubAddresses[subSymbol], subBalance, data);
      remainingAmount = remainingAmount.minus(subBalance);
    } else { // including the balance of this sub asset the cummulative amount is more than enough
      const factor = Number(subAsset.factor);
      subTransactionSteps[subSymbol] = createSubTransactionStep(subSymbol, targetSubAddresses[subSymbol], remainingAmount.toFixed(factor), data);
      break;
    }
  }
  this.parallel(subTransactionSteps, combineSubTransactions(dataCallback), errorCallback, progressCallback);
};

function determineAvailableBalance (assets, subSymbols) {
  let totalAvailableBalance = new Decimal(0);
  const errors = [];
  const availableBalances = {};

  for (const subSymbol of subSymbols) {
    const subAsset = assets[subSymbol];
    const hasDifferentFeeSymbol = regular.hasDifferentFeeSymbol(subAsset);
    if (!subAsset.data.sufficientFuel) {
      const feeSymbol = subAsset['fee-symbol'].toUpperCase();
      if (!hasDifferentFeeSymbol) {
        errors.push(`Insufficient fee balance for ${subSymbol}.
          Available: ${subAsset.data.balance} ${feeSymbol}.
          Required fee: ${subAsset.fee} ${feeSymbol}`
        );
      } else {
        const feeBalance = subAsset.data.baseBalances[subAsset['fee-symbol']];
        errors.push(`Insufficient fee balance for ${subSymbol}.
          Available: ${feeBalance} ${feeSymbol}.
          Required fee: ${subAsset.fee} ${feeSymbol}`
        );
      }
    } else if (subAsset.data.balance === 'n/a') {
      errors.push(`Balance for ${subSymbol} not (yet) available.`);
    } else {
      const availableBalance = hasDifferentFeeSymbol
        ? new Decimal(subAsset.data.balance)
        : new Decimal(subAsset.data.balance).minus(subAsset.fee);
      availableBalances[subSymbol] = availableBalance;
      totalAvailableBalance = totalAvailableBalance.plus(availableBalance);

      errors.push(`Sufficient fee balance for ${subSymbol}.
        Available: ${availableBalance} ${subSymbol.toUpperCase()}.`
      );
    }
  }
  return {errors, totalAvailableBalance, availableBalances};
}

function getSubSymbolsSortedByFeeValuation (data, subSymbols, assets, dataCallback, errorCallback, progressCallback) {
  if (subSymbols.length === 1) {
    return dataCallback(subSymbols); // use availableBalances as stub for valuations. As this does not matter for singular assets.
  } else { // get valations for the fee to compare them
    const feeValuationSteps = {_options: {failIfAnyFails: true}};

    const valuationSymbol = data.comparisonSymbol || 'hy';
    for (const subSymbol of subSymbols) {
      const subAsset = assets[subSymbol];
      const fee = subAsset.fee;
      const feeSymbol = subAsset['fee-symbol'];

      feeValuationSteps[subSymbol] = feeSymbol === valuationSymbol || (valuationSymbol === 'hy' && feeSymbol.endsWith('.hy'))
        ? { // short cut if feeSymbol matches valuation symbol
            data: fee,
            step: 'id'
          }
        : {
            data: {
              fromSymbo: feeSymbol,
              toSymbol: valuationSymbol,
              amount: fee,
              host: data.host,
              channel: data.channel
            },
            step: 'getValuation'
          };
    }
    return this.parallel(feeValuationSteps, valuations => { // sort fees by valuation
      const subSymbolsSortedByValuation = Object.entries(valuations) // {[subSymbol]:valuation,...} -> [[subSymbol,valuations],...]
        .sort(sortByValuation)
        .map(([subSymbol/*, valuation */]) => subSymbol); // [subSymbol,...]
      dataCallback(subSymbolsSortedByValuation);
    },
    error => {
      errorCallback(`Failed to retrieve fee valuations. Could not compare to choose best option. ${error}`);
    }, progressCallback);
  }
}

function validateConstructAndSignRawTransaction (asset, assets, data, dataCallback, errorCallback, progressCallback) {
  // check unified symbol prefix if available (i.e. hy:...), and decompress, or assume expanded unified address
  const targetArray = data.target.split(':');
  let target;
  if ((targetArray.length === 2 && targetArray[0] === asset.symbol) || targetArray.length === 1) { // 'symbol:compressed' -> 'subSymbol1:subAddress1,...'
    const decompressedAddress = compressUnifiedAddress.decode(targetArray.splice(targetArray.length - 1, targetArray.length)[0]);
    if (decompressedAddress === null) {
      return errorCallback(`Could not decode packed unified address '${data.target}'`);
    }
    target = decompressedAddress;
  } else target = data.target; // 'subSymbol1:subAddress1,...'

  const targetSubAddresses = parseTargetAdresses(target);
  const targetSubSymbols = Object.keys(targetSubAddresses);
  const sourceSubSymbols = data.hasOwnProperty('source') // 'subSymbol1:subAddress1,...' -> ['subSymbol1',...]
    ? Object.keys(parseTargetAdresses(data.source)).filter(symbol => asset.symbols.hasOwnProperty(symbol))
    : asset.symbols;

  targetSubSymbols.filter(symbol => sourceSubSymbols.hasOwnProperty(symbol)); // only use target addresses for symbols that are unified by this asset and included in source address

  const {errors, totalAvailableBalance, availableBalances} = determineAvailableBalance(assets, targetSubSymbols);

  if (totalAvailableBalance.gte(data.amount)) {
    const subSymbols = Object.keys(availableBalances);
    getSubSymbolsSortedByFeeValuation.bind(this)(data, subSymbols, assets,
      createTransaction(assets, targetSubAddresses, availableBalances, data, dataCallback, errorCallback, progressCallback).bind(this),
      errorCallback,
      progressCallback);
  } else {
    const symbol = data.symbol.toUpperCase();
    errors.push(`Insufficient available balance for ${symbol}. Available to send: ${totalAvailableBalance.toString()} ${symbol}. Requested: ${data.amount} ${symbol}`);
    return errorCallback(errors.join('\n'));
  }
}

const isUnifiedAsset = asset => asset.hasOwnProperty('symbols');

function mergeFeeObjects (a, b) {
  for (const feeSymbol in b) {
    if (a.hasOwnProperty(feeSymbol)) {
      a[feeSymbol] = new Decimal(a[feeSymbol]).add(b[feeSymbol]).toString();
    } else a[feeSymbol] = b[feeSymbol];
  }
}

function getFeeObjects (remainingAmount, availableBalances, remainingSubSymbols, feeObject, dataCallback, errorCallback) {
  const subSymbol = remainingSubSymbols[0];
  const subBalance = availableBalances[subSymbol];
  const delta = new Decimal(subBalance).minus(remainingAmount); // a+b+c+d-amount
  if (delta.isNegative()) { // including the balance of this sub asset the cummulative amount is not yet enough
    remainingAmount = remainingAmount.minus(subBalance);
    const amount = subBalance.toString();
    this.getFee({symbol: subSymbol, amount}, subFeeObject => {
      mergeFeeObjects(feeObject, subFeeObject); // not yet done, need more balance and thus fee
      getFeeObjects.bind(this)(remainingAmount, availableBalances, remainingSubSymbols.slice(1), feeObject, dataCallback, errorCallback);
    }, errorCallback);
  } else { // including the balance of this sub asset the cummulative amount is more than enough
    const amount = remainingAmount.toString();
    this.getFee({symbol: subSymbol, amount}, subFeeObject => {
      mergeFeeObjects(feeObject, subFeeObject);
      dataCallback(feeObject); // done, return the fee object
    }, errorCallback);
  }
}

function getFee (assets, data, dataCallback, errorCallback, progressCallback) {
  const {target, source, symbol, amount} = data;
  const asset = assets[symbol];

  const allSubSymbols = Object.keys(asset.symbols);
  const targetSubSymbols = typeof target === 'string'
    ? Object.keys(parseTargetAdresses(target))
    : allSubSymbols;

  const sourceSubSymbols = typeof source === 'string'
    ? Object.keys(parseTargetAdresses(source))
    : allSubSymbols;

  const subSymbols = allSubSymbols.filter(symbol => sourceSubSymbols.includes(symbol) && targetSubSymbols.includes(symbol));

  const {errors, totalAvailableBalance, availableBalances} = determineAvailableBalance(assets, subSymbols);

  if (totalAvailableBalance.gte(amount)) {
    const subSymbols = Object.keys(availableBalances);
    getSubSymbolsSortedByFeeValuation.bind(this)(data, subSymbols, assets,
      subSymbolsSortedByValuation => {
        const remainingAmount = new Decimal(data.amount);
        const feeObject = {};
        getFeeObjects.bind(this)(remainingAmount, availableBalances, subSymbolsSortedByValuation, feeObject, dataCallback, errorCallback);
      },
      errorCallback,
      progressCallback);
  } else {
    const symbol = data.symbol.toUpperCase();
    errors.push(`Insufficient available balance for ${symbol}. Available to send: ${totalAvailableBalance.toString()} ${symbol}. Requested: ${data.amount} ${symbol}`);
    return errorCallback(errors.join('\n'));
  }
}

exports.combineSubTransactions = combineSubTransactions;
exports.validateConstructAndSignRawTransaction = validateConstructAndSignRawTransaction;
exports.parseTargetAdresses = parseTargetAdresses;
exports.isUnifiedAsset = isUnifiedAsset;
exports.getFee = getFee;
