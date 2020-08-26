/**
   * Get the keys associated to a specific asset for current session. Important: handle your private keys confidentially.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'getKeys'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getKeys = assets => function (data, dataCallback, errorCallback) {
  // TODO check for symbol
  // TODO check datacallback
  this.addAsset(data, () => {
    const keys = JSON.parse(JSON.stringify(assets[data.symbol].data.keys));
    delete keys.mode;
    dataCallback(keys);
  }, errorCallback);
};
