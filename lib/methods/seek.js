const seekLocal = (storage, key, data) => [
  {func: (_, dataCallback, errorCallback) => storage.seek({key}, dataCallback, errorCallback)}, 'call'
];

const seekRemote = (key, data) => [
  {host: data.host, query: '/e/storage/seek/' + key, channel: data.channel}, 'rout'
];

/**
   * Check if a value is associated with key in the hybrixd node storage
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
   * {key:'Hello'}, 'seek'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.seek = (storage, fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);

  const key = data.legacy === true ? encodeURIComponent(legacy(data.key)) : encodeURIComponent(data.key);

  const handleResult = results => dataCallback(results.local === true || results.remote === true);

  const steps = {};

  if (data.local !== false && storage) steps.local = seekLocal(storage, key, data);
  if (data.remote !== false) steps.remote = seekRemote(key, data);

  return this.parallel(steps, handleResult, errorCallback, progressCallback);
};
