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
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('symbol')) return fail('Expected symbol property.', errorCallback);

  const symbol = data.symbol;
  if (!assets.hasOwnProperty(symbol)) return fail('Asset ' + symbol + ' not added.', errorCallback);

  const asset = assets[symbol];
  if (!clientModules.hasOwnProperty(asset['mode'].split('.')[0])) return fail('Asset ' + symbol + ' not initialized.', errorCallback);
  if (!asset.hasOwnProperty('factor')) return fail('Asset ' + symbol + ' missing factor.', errorCallback);
  if (!data.hasOwnProperty('amount')) return fail('Missing \'amount\' property.', errorCallback);

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
      return fail('Transaction failed: ' + e, errorCallback);
    }
    if (typeof checkTransaction !== 'undefined' && typeof dataCallback === 'function') return dataCallback(checkTransaction);
  };

  const atomizeAmount = fee => this.atom({amount: data.amount, factor: asset.factor}, amount => createTransaction(amount, fee), errorCallback);

  const fee = typeof data.fee === 'undefined' ? asset.fee : data.fee;

  // atomize fee
  const atomData = {};
  if (typeof fee === 'string' || typeof fee === 'number') {
    atomData.amount = fee;
    if (asset.hasOwnProperty('fee-factor')) {
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
    } else return atomizeAmount(fee); // skip atomizing fee
  } else return fail('Expected fee to be a string, number or object.', errorCallback); // FIXME: update after multi asset fees have been implemented

  return this.atom(atomData, atomizeAmount, errorCallback);
};
