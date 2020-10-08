const handleMerge = data => function (results, dataCallback, errorCallback) {
  const saveOptions = {key: data.key, channel: data.channel, host: data.host, legacy: data.legacy, encrypted: data.encrypted};
  if (results.hasOwnProperty('local') && results.hasOwnProperty('remote') && data.hasOwnProperty('mergeStrategy')) {
    const localValue = results.local;
    const remoteValue = results.remote;
    if (localValue === remoteValue) return dataCallback(remoteValue);
    const value = data.mergeStrategy(localValue, remoteValue);
    if (value !== remoteValue && data.sync !== false) this.save({value, local: false, ...saveOptions}, () => {}, () => {}); // sync merged value
    if (value !== localValue && data.sync !== false) this.save({value, remote: false, ...saveOptions}, () => {}, () => {});// sync merged value
    return dataCallback(value);
  } else if (results.hasOwnProperty('local')) {
    const value = results.local;
    if (data.remote !== false && data.sync !== false) this.save({value, local: false, ...saveOptions}, () => {}, () => {}); // sync
    return dataCallback(value);
  } else if (results.hasOwnProperty('remote')) {
    const value = results.remote;
    if (data.local !== false && data.sync !== false) this.save({value, remote: false, ...saveOptions}, () => {}, () => {}); // sync
    return dataCallback(value);
  } else return errorCallback('Could not retrieve file');
};

const decryptionSteps = data => (data.encrypted === false
  ? [value => decodeURIComponent(value)]
  : [encryptedValue => { return {data: encryptedValue}; }, 'decrypt']
);

const loadLocal = (storage, key, data) => [
  {func: (_, dataCallback, errorCallback) => storage.load({key}, dataCallback, errorCallback)}, 'call',
  ...decryptionSteps(data)
];

const loadRemote = (key, data) => [
  {host: data.host, query: '/e/storage/load/' + key, channel: data.channel}, 'rout',
  ...decryptionSteps(data)
];

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
   * @param {Boolean} [data.local=true] - Whether to use local storage if available
   * @param {Boolean} [data.remote=true] - Whether to use remote storage
   * @param {Boolean} [data.mergeStrategy=(local,remote)=>local] - What to do if results from local and remote storage differs
   * @param {Boolean} [data.sync=true] - If only available on either remote or storage, save it to the other as well
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
exports.load = (storage, fail, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);
  else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') return fail('Expected \'key\' property of string type.', errorCallback);
  else {
    const useFallbackCallback = error => {
      if (data.hasOwnProperty('fallback')) return dataCallback(data.fallback);
      else return fail(error, errorCallback);
    };

    const key = data.legacy === true ? encodeURIComponent(legacy(data.key)) : encodeURIComponent(data.key);

    const loadSteps = {};

    if (data.local !== false && storage) loadSteps.local = loadLocal(storage, key, data);
    if (data.remote !== false) loadSteps.remote = loadRemote(key, data);

    return this.sequential([
      loadSteps, 'parallel',
      {func: handleMerge(data).bind(this)}, 'call'
    ], dataCallback, useFallbackCallback, progressCallback);
  }
};
