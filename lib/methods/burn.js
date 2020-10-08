const burnLocal = (storage, key) => ({data: {func: (_, dataCallback, errorCallback) => storage.burn({key}, dataCallback, errorCallback)}, step: 'call'});

const burnRemote = (key, data) => ({data: {host: data.host, query: '/e/storage/burn/' + key, channel: data.channel, meta: data.meta}, step: 'rout'});
/**
   * Delete a value in storage
   * @category Storage
   * @param {Object} data
   * @param {String} data.key - The key identifier for the data.
   * @param {Boolean} [data.legacy=false] - A toggle to use a legacy storage method.
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel=''] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.local=true] - Whether to use local storage if available
   * @param {Boolean} [data.remote=true] - Whether to use remote storage
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {key:'Hello', value:'World!'}, 'save',
   * {key:'Hello'}, 'burn'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.burn = (storage, fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);
  else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') return fail('Expected \'key\' property of string type.', errorCallback);
  else {
    const key = data.legacy === true ? encodeURIComponent(legacy(data.key)) : encodeURIComponent(data.key);
    const steps = {};

    // TODO fail if all/any fail?
    if (data.local !== false && storage) steps.local = burnLocal(storage, key);
    if (data.remote !== false) steps.remote = burnRemote(key, data);

    return this.parallel(steps, dataCallback, errorCallback, progressCallback);
  }
};
