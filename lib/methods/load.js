/**
   * Retrieve value associated with key from the hybrixd node storage
   * @category Storage
   * @param {Object} data
   * @param {String} data.key - The key identifier for the data.
   * @param {Boolean} [data.encrypted=true] - whether to encrypt the data with the user key, true by default.
   * @param {Boolean} [data.legacy=false] - A toggle to use a legacy storage method.
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel=''] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {key:'Hello', value:'World!'}, 'save',
   * {key:'Hello'}, 'load'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.load = (fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') {
    fail('Expected an object.', errorCallback);
  } else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') {
    fail('Expected \'key\' property of string type.', errorCallback);
  } else if (data.encrypted === false) {
    this.rout({host: data.host, query: '/e/storage/get/' + encodeURIComponent(data.key), channel: data.channel, meta: data.meta}, (data) => {
      dataCallback(decodeURIComponent(data));
    }, errorCallback, progressCallback);
  } else if (data.legacy === true) {
    this.sequential([
      {host: data.host, query: '/e/storage/get/' + encodeURIComponent(legacy(data.key)), channel: data.channel}, 'rout',
      result => { return {data: result}; }, 'decrypt'
    ], dataCallback, errorCallback, progressCallback);
  } else {
    this.sequential([
      {host: data.host, query: '/e/storage/get/' + encodeURIComponent(data.key), channel: data.channel}, 'rout',
      result => { return {data: result}; }, 'decrypt'
    ], dataCallback, errorCallback, progressCallback);
  }
};
