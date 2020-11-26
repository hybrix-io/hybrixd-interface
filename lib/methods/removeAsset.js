/**
   * Remove an asset (crypto currency or token) from the session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The symbol of the asset
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'addAsset',
   * {symbol: 'dummy'}, 'removeAsset'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.removeAsset = (assets, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);
  if (assets.hasOwnProperty(data.symbol)) { // if assets has not been iniated, retrieve and initialize
    delete assets[data.symbol];
    // TODO check if the determistic client code blob is still used, if not remove it.
    dataCallback(data.symbol);
  } else if (typeof dataCallback === 'function') {
    dataCallback(data.symbol);
  }
};
