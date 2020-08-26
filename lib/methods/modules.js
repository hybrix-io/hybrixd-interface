/**
   * List locally available client modules.
   * @category ClientModule
   * @param {Object} data - ignored
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'addAsset',
   * 'modules'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.modules = clientModules => function (data, dataCallback, errorCallback) {
  dataCallback(Object.keys(clientModules));
};
