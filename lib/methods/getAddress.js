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
exports.getAddress = assets => function (data, dataCallback, errorCallback) {
  if (data.symbol) {
    // TODO check datacallback?
    this.addAsset(data, () => dataCallback(assets[data.symbol].data.address), errorCallback);
  } else {
    fail('Symbol needed to retrieve public key.', errorCallback);
  }
};
