/**
   * Retrieve value associated with key from the hybrixd node storage
   * @category Storage
   * @param {Object} data
   * @param {String} data.key - The key identifier for the data.
   * @param {Boolean} [data.encrypted=true] - whether to encrypt the data with the user key, true by default.
   * @param {Boolean} [data.legacy=false] - A toggle to use a legacy storage method.
   * @param {String} [data.fallback] - Provide a fallback value, if call fails this value is used
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
  const useFallback = error => {
    if (data.hasOwnProperty('fallback')) return dataCallback(data.fallback);
    else return fail(error, errorCallback);
  };

  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);
  else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') return fail('Expected \'key\' property of string type.', errorCallback);
  else if (data.encrypted === false) {
    const decodeData = data => dataCallback(decodeURIComponent(data));
    return this.rout(
      {host: data.host, query: '/e/storage/load/' + encodeURIComponent(data.key), channel: data.channel, meta: data.meta},
      decodeData, useFallback, progressCallback
    );
  } else if (data.legacy === true) {
    return this.sequential(
      [
        {host: data.host, query: '/e/storage/load/' + encodeURIComponent(legacy(data.key)), channel: data.channel}, 'rout',
        result => { return {data: result}; }, 'decrypt'
      ], dataCallback, useFallback, progressCallback
    );
  } else {
    return this.sequential(
      [
        {host: data.host, query: '/e/storage/load/' + encodeURIComponent(data.key), channel: data.channel}, 'rout',
        result => { return {data: result}; }, 'decrypt'
      ], dataCallback, useFallback, progressCallback
    );
  }
};
