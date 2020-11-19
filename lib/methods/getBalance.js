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
  this.refreshAsset(data, asset => {
    const symbol = data.symbol;
    if (typeof assets !== 'object' || asset === null || !asset.hasOwnProperty(symbol)) return errorCallback('Failed to retrieve balance');
    const balance = asset[symbol].balance;
    return dataCallback(balance);
  }, errorCallback);
};
