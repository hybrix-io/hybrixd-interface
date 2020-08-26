/**
   * Retrieve the meta data for a storage key in the hybrixd node storage
   * @category Storage
   * @param {Object} data
   * @param {String} data.key - The key identifier for the data.
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.meta=false] - Indicate whether to include meta data (process information).
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {key:'Hello', value:'World!'}, 'save',
   * {key:'Hello'}, 'meta'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.meta = (fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') {
    fail('Expected an object.', errorCallback);
  } else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') {
    fail('Expected \'key\' property of string type.', errorCallback);
  } else {
    // TODO use legacy
    this.rout({host: data.host, query: '/e/storage/meta/' + encodeURIComponent(data.key), channel: data.channel, meta: data.meta}, dataCallback, errorCallback, progressCallback);
  }
};
