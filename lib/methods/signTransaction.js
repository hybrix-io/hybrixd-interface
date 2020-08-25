/**
 * Create a signed transaction using all inputs.
 *
 * @category Transaction
 * @param {object} data
 * @param {string} data.symbol - The symbol of the asset.
 * @param {string} data.target - The target address.
 * @param {number} data.amount - The amount.
 * @param {number} [data.message] -  Option to add data (message, attachment, op return) to a transaction.
 * @param {number} [data.fee] - The fee.
 * @param {number} [data.time] - Provide an explicit timestamp.
 * @param {object} data.unspent - Pretransaction data.
 * @example
 * hybrix.sequential([
 * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
 * {host: 'http://localhost:1111/'}, 'addHost',
 * {symbol: 'dummy'}, 'addAsset',
 * {symbol: 'dummy', target: '_dummyaddress_', amount:1, unspent: [{"amount":"1","txid":"TXIDTXIDTXIDTXIDTXIDTXIDTXID","txn":1}]}, 'rawTransaction',
 * ]
 * , onSuccess
 * , onError
 * , onProgress
 * );
 */
exports.signTransaction = (fail, assets, clientModules) => function (data, dataCallback, errorCallback) {
  const symbol = data.symbol;
  if (!assets.hasOwnProperty(symbol)) {
    fail('Asset ' + symbol + ' not added.', errorCallback);
    return;
  }
  const asset = assets[symbol];
  if (!clientModules.hasOwnProperty(asset['mode'].split('.')[0])) {
    fail('Asset ' + symbol + ' not initialized.', errorCallback);
    return;
  }

  if (!asset.hasOwnProperty('factor')) {
    fail('Asset ' + symbol + ' missing factor.', errorCallback);
    return;
  }

  if (!data.hasOwnProperty('amount')) {
    fail('Missing \'amount\' property.', errorCallback);
    return;
  }

  const createTransaction = (amount, fee) => {
    const transactionData = {
      mode: asset.data.keys.mode,
      symbol,
      source: asset.data.address,
      target: data.target,
      amount: amount,
      fee: fee,
      factor: asset.factor,
      contract: asset.contract,
      keys: asset.data.keys,
      seed: asset.data.seed,
      unspent: data.unspent,
      message: data.message,
      time: data.time
    };
    let checkTransaction;
    try {
      const base = asset['mode'].split('.')[0];
      checkTransaction = clientModules[base].transaction(transactionData, dataCallback, errorCallback);
    } catch (e) {
      fail('Transaction failed: ' + e, errorCallback);
      return;
    }
    if (typeof checkTransaction !== 'undefined' && typeof dataCallback === 'function') {
      dataCallback(checkTransaction);
    }
  };

  const atomizeAmount = fee => {
    this.atom({amount: data.amount, factor: asset.factor}, amount => createTransaction(amount, fee), errorCallback);
  };

  const fee = typeof data.fee === 'undefined' ? asset.fee : data.fee;

  // atomize fee
  const atomData = {};
  if (typeof fee === 'string' || typeof fee === 'number') {
    atomData.amount = fee;
    if (asset.hasOwnProperty('fee-factor')) { // FIXME: depricated, kept for backwards compatibility. update after multi asset fees have been implemented
      atomData.factor = asset['fee-factor'];
    } else if (typeof asset.fee === 'object' && asset.fee !== null) { // use asset fee to determine fee symbol
      atomData.symbol = Object.keys(asset.fee)[0];
    }
  } else if (typeof fee === 'object' && fee !== null) {
    const feeSymbols = Object.keys(fee);
    if (feeSymbols.length === 0) {
      atomData.amount = 0;
      atomData.factor = 0;
    } else if (feeSymbols.length === 1) {
      atomData.amount = fee[feeSymbols[0]];
      atomData.symbol = feeSymbols[0];
    } else {
      atomizeAmount(fee); // skip atomizing fee
      //      fail('Multi asset fee not supported by signTransaction.', errorCallback);
      return;
    }
  } else {
    fail('Expected fee to be a string, number or object.', errorCallback); // FIXME: update after multi asset fees have been implemented
    return;
  }
  this.atom(atomData, atomizeAmount, errorCallback);
};
