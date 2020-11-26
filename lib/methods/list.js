/**
   * Check which keys matching a given pattern exist in hybrixd node storage
   * @category Storage
   * @param {Object} data
   * @param {String} data.pattern - The pattern identifier for the data.
   * @param {Boolean} [data.legacy=false] - A toggle to use a legacy storage method.
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel=''] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.local=true] - Whether to use local storage if available
   * @param {Boolean} [data.remote=true] - Whether to use remote storage
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {pattern:'HelloWorld', value:'World!'}, 'save',
   * {pattern:'HelloUniverse', value:'Universe!'}, 'save',
   * {pattern:'Hello*'}, 'list'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.list = (storage, fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object' || data === null) return fail('Expected an object.', errorCallback);
  else if (!data.hasOwnProperty('pattern') || typeof data.pattern !== 'string') return fail('Expected \'pattern\' property of string type.', errorCallback);
  else if (data.legacy === true) { // TODO strip away legacy prefix?
    return this.rout({host: data.host, query: '/e/storage/list/' + encodeURIComponent(legacy(data.pattern)), channel: data.channel, meta: data.meta}, dataCallback, errorCallback, progressCallback);
  } else {
    return this.rout({host: data.host, query: '/e/storage/list/' + encodeURIComponent(data.pattern), channel: data.channel, meta: data.meta}, dataCallback, errorCallback, progressCallback);
  }
};
