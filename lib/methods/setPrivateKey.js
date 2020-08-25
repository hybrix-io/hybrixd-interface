/**
   * Set the private key associated to a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @param {string} data.privateKey - The private key.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy', privateKey: '_dummyprivatekey_'}, 'setPrivateKey'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.setPrivateKey = (assets, clientModules, fail) => function (data, dataCallback, errorCallback) {
  this.addAsset(data, dataCallback, errorCallback);
};
