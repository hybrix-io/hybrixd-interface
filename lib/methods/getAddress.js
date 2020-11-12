/**
   * Get the address associated to a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'getAddress'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getAddress = (assets, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data === 'string') data = {symbol: data};
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('symbol')) return fail('Expected symbol', errorCallback);
  return this.addAsset(data, () => dataCallback(assets[data.symbol].data.address), errorCallback);
};
