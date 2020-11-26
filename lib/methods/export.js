/**
   * Export a client module code blob.
   * @category ClientModule
   * @param {Object} data - if empty, exports all blobs
   * @param {string} [data.id] - id of the client code blob.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'addAsset',
   * {id: 'dummycoin'},'export'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.export = (fail, clientModuleBlobs) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('id')) return dataCallback(clientModuleBlobs);
  else if (!clientModuleBlobs.hasOwnProperty(data.id)) return fail('No client module ' + data.id + ' not found.', errorCallback);
  else return dataCallback(clientModuleBlobs[data.id]);
};
