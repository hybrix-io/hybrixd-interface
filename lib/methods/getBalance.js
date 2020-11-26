/**
   * Get the balance of a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'getBalance'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getBalance = (assets, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('symbol')) return fail('Expected symbol property', errorCallback);

  this.refreshAsset(data, asset => {
    const symbol = data.symbol;
    if (typeof asset !== 'object' || asset === null || !asset.hasOwnProperty(symbol)) return fail('Failed to retrieve balance', errorCallback);
    const balance = asset[symbol].balance;
    return dataCallback(balance);
  }, errorCallback);
};
