const Decimal = require('../../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });
const LZString = require('../../../common/crypto/lz-string');
const compressUnifiedAddress = require('../../../common/compress-unified-address.js');

const regular = require('./regular.js');

function parseTargetAdresses (target) {
  const targetSubAddressPairs = target.split(',').map(x => x.split(':')); // 'btc:123,eth:456' -> ['btc:123','eth:456'] -> [['btc','123'],['eth','456']]
  const targetSubAddresses = {};
  for (let targetSubAddressPair of targetSubAddressPairs) { // [['btc','123'],['eth','456']] -> {btc:'123',eth:'456'}
    const [subSymbol, targetSubAddress] = targetSubAddressPair;
    targetSubAddresses[subSymbol] = targetSubAddress;
  }
  return targetSubAddresses;
}

function checkAvailableBalance (subSymbol, subResult, assets) {
  const subAsset = assets[subSymbol];
  if (!regular.hasDifferentFeeSymbol(subAsset)) {
    const availableBalance = new Decimal(subResult.balance).minus(subAsset.fee);
    if (availableBalance.isPositive()) {
      return {balance: availableBalance.toString()};
    } else {
      const feeSymbol = subSymbol.toUpperCase();
      return {error: `Insufficient fee balance for ${subSymbol}. Available: ${subResult.balance} ${feeSymbol}. Required: ${subAsset.fee} ${feeSymbol}`};
    }
  } else {
    const availableBalance = new Decimal(subResult.feeBalance).minus(subAsset.fee);
    if (availableBalance.isPositive()) {
      return {balance: availableBalance.toString()};
    } else {
      const feeSymbol = subAsset['fee-symbol'].toUpperCase();
      return {error: `Insufficient fee balance for ${subSymbol}. Available: ${subResult.feeBalance} ${feeSymbol}. Required: ${subAsset.fee} ${feeSymbol}`};
    }
  }
}

function createSubTransactionStep (subSymbol, targetSubAddress, amount, data) {
  return {data: {
    symbol: subSymbol,
    target: targetSubAddress,
    amount,
    validate: false,
    // TODO     message:
    time: data.time,
    host: data.host,
    channel: data.channel
  },
  step: 'rawTransaction'};
}

const combineSubTransactions = dataCallback => subTransactions => { // subTransactions = {eth:'tx',btc:'tx1'} => 'eth:tx,btc:tx2'
  const combinedCompressedSubTransactions = Object.keys(subTransactions).reduce((transactionString, subSymbol) => {
    const compressedSubTransaction = LZString.compressToEncodedURIComponent(subTransactions[subSymbol]);
    return transactionString + (transactionString ? ',' : '') + subSymbol + ':' + compressedSubTransaction;
  }, '');
  dataCallback(combinedCompressedSubTransactions);
};

function preparationSteps (subAsset, subSymbol, targetSubAddress, data) {
  const subSteps = {
    // Query balance for sub symbol
    balance: {data: {query: '/asset/' + subSymbol + '/balance/' + subAsset.data.address, host: data.host, channel: data.channel}, step: 'rout'}
  };
  if (data.validate) {
    // Validate target sub address
    subSteps.validate = {data: {query: '/asset/' + subSymbol + '/validate/' + targetSubAddress, host: data.host, channel: data.channel}, step: 'rout'};
  }
  if (regular.hasDifferentFeeSymbol(subAsset)) {
    // Query Fee balance for sub base symbol if the fee symbol is different from the subsymbol
    subSteps.feeBalance = {data: {query: '/asset/' + subAsset['fee-symbol'] + '/balance/' + subAsset.data.address, host: data.host, channel: data.channel}, step: 'rout'};
  }
  return subSteps;
}

const sortByValuation = ([subSymbolA, valuationA], [subSymbolB, valuationB]) => valuationA - valuationB;

const createTransaction = (assets, targetSubAddresses, availableBalances, data) => function (valuations, dataCallback, errorCallback, progressCallback) {
  // valuations = subSymbol =>
  const subSymbolsSortedByValuation = Object.entries(valuations) // {[subSymbol]:valuation,...} -> [[subSymbol,valuations],...]
    .sort(sortByValuation)
    .map(([subSymbol, valuation]) => subSymbol); // [subSymbol,...]

  let remainingAmount = new Decimal(data.amount);
  const subTransactionSteps = {};
  for (let subSymbol of subSymbolsSortedByValuation) {
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

const checkAvailableBalances = (assets, targetSubAddresses, data) => function (subResults, dataCallback, errorCallback, progressCallback) {
  let totalAvailableBalance = new Decimal(0);
  const errors = [];
  const availableBalances = {};
  for (let subSymbol in subResults) {
    const subResult = subResults[subSymbol];
    if (!subResult.validate && data.validate) {
      errors.push(`Invalid address for ${subSymbol} : ${targetSubAddresses[subSymbol]}`);
    } else {
      const availableBalance = checkAvailableBalance(subSymbol, subResult, assets);
      if (availableBalance.error) {
        errors.push(availableBalance.error);
      } else {
        availableBalances[subSymbol] = availableBalance.balance;
        totalAvailableBalance = totalAvailableBalance.plus(availableBalance.balance);
      }
    }
  }

  if (totalAvailableBalance.gte(data.amount)) {
    const feeValuationSteps = {_options: {failIfAnyFails: true}};

    const valuationSymbol = data.comparisionSymbol || 'hy';
    for (let subSymbol in availableBalances) {
      const subAsset = assets[subSymbol];
      const fee = subAsset.fee;
      const feeSymbol = subSymbol === 'tomo.hy' ? 'hy' : subAsset['fee-symbol']; // TODO fix hardcoded override
      feeValuationSteps[subSymbol] = {data: {query: `/e/valuations/rate/${feeSymbol}/${valuationSymbol}/${fee}`, host: data.host, channel: data.channel}, step: 'rout'};
    }

    this.parallel(feeValuationSteps, createTransaction(assets, targetSubAddresses, availableBalances, data).bind(this), errorCallback, progressCallback);
  } else {
    const symbol = data.symbol.toUpperCase();
    errors.push(`Insufficient total balance for ${symbol}. Available: ${totalAvailableBalance.toString()} ${symbol}. Requested: ${data.amount} ${symbol}`);
    errorCallback(errors.join('\n'));
  }
};

function validateConstructAndSignRawTransaction (asset, assets, data, dataCallback, errorCallback, progressCallback) {
  // check unified symbol prefix if available (i.e. hy:...), and decompress, or assume expanded unified address
  const targetArray = data.target.split(':');
  if ((targetArray.length === 2 && targetArray[0] === asset.symbol) || targetArray.length === 1) {
    const decompressedAddress = compressUnifiedAddress.decode(targetArray.splice(targetArray.length - 1, targetArray.length)[0]);
    if (data.target === null) {
      errorCallback(`Could not decode packed unified address '${data.target}'`);
      return;
    }
    data.target = decompressedAddress;
  }
  const targetSubAddresses = parseTargetAdresses(data.target);
  const targetSubSymbols = Object.keys(targetSubAddresses);
  const sourceSubSymbols = data.hasOwnProperty('source') // 'subSymbol1:subAddress1,...' -> ['subSymbol1',...]
    ? Object.keys(parseTargetAdresses(data.source)).filter(symbol => asset.symbols.hasOwnProperty(symbol))
    : asset.symbols;

  targetSubSymbols.filter(symbol => sourceSubSymbols.hasOwnProperty(symbol)); // only use target addresses for symbols that are unified by this asset and included in source address
  // TODO provide option to sort on cheapest fee:  targetSubSymbols.sort((a, b) => { return assets[a].fee - assets[b].fee ; }); TODO times weight

  const steps = {};
  for (let subSymbol of targetSubSymbols) {
    const subAsset = assets[subSymbol];
    const targetSubAddress = targetSubAddresses[subSymbol];
    steps[subSymbol] = {data: preparationSteps(subAsset, subSymbol, targetSubAddress, data), step: 'parallel'};
  }

  this.sequential([
    steps, 'parallel',
    subResults => { return {func: checkAvailableBalances(assets, targetSubAddresses, data).bind(this), data: subResults}; }, 'call'
  ],
  dataCallback, errorCallback, progressCallback
  );
}

const isUnifiedAsset = asset => asset.hasOwnProperty('symbols');

exports.combineSubTransactions = combineSubTransactions;
exports.validateConstructAndSignRawTransaction = validateConstructAndSignRawTransaction;
exports.parseTargetAdresses = parseTargetAdresses;
exports.isUnifiedAsset = isUnifiedAsset;
