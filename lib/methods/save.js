const stringifyAndEscapeQuotes = value => { // stringify, escape quotes, and encode
  if (typeof value === 'string') return value.replace(/"/g, '\\"');
  else return JSON.stringify(value).replace(/"/g, '\\"');
};

const saveLocal = (storage, key) => ({data: {func: (value, dataCallback, errorCallback) => storage.save({key, value}, dataCallback, errorCallback)}, step: 'call'});

const handleWork = (key, data, powQueue) => function (result, dataCallback, errorCallback, progressCallback) {
  if (data.work === false || !result.hasOwnProperty('challenge')) return dataCallback(result);
  if (data.queue) { // save work for later
    powQueue.push({
      action: result.action,
      hash: result.hash,
      challenge: result.challenge,
      difficulty: result.difficulty,
      submit: data.submit,
      host: data.host,
      channel: data.channel,
      key
    });
    return dataCallback(result);
  } else { // do work now
    return this.work({
      challenge: result.challenge,
      difficulty: result.difficulty,
      host: data.host,
      channel: data.channel,
      key,
      submit: typeof data.submit === 'undefined' ? true : data.submit
    },
    work => {
      delete result.difficulty;
      delete result.challenge;
      if (data.submit === false) result.solution = work.solution;
      else result.expire = work.expire;
      return dataCallback(result);
    }, errorCallback, progressCallback);
  }
};

function saveRemote (storage, key, data, powQueue) {
  return [
    value => ({host: data.host, query: '/e/storage/save/' + key + '/' + value, channel: data.channel, meta: data.meta}), 'rout',
    {func: handleWork(key, data, powQueue).bind(this)}, 'call'
  ];
}

/**
   * Stringify and encrypt data with user keys.
   * @category Storage
   * @param {Object} data
   * @param {String} data.key - The key identifier for the data.
   * @param {Object} data.value - A string, array or object.
   * @param {Boolean} [data.legacy=false] - A toggle to use a legacy storage method.
   * @param {Boolean} [data.encrypted=true] - whether to encrypt the data with the user key.
   * @param {String} [data.work=true] - whether to perform proof of work.
   * @param {String} [data.queue=false] - whether to queue proof of work. Execute later with queue method
   * @param {String} [data.submit=true] - whether to submit proof of work.
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel=''] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.local=true] - Whether to use local storage if available
   * @param {Boolean} [data.remote=true] - Whether to use remote storage
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
exports.save = (storage, fail, powQueue, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object') return fail('Expected an object.', errorCallback);
  else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') return fail('Expected \'key\' property of string type.', errorCallback);
  else if (!data.hasOwnProperty('value')) return fail('Expected \'value\' property.', errorCallback);
  else {
    const key = data.legacy === true ? encodeURIComponent(legacy(data.key)) : encodeURIComponent(data.key);

    const encryptionSteps = data.encrypted === false
      ? [() => encodeURIComponent(stringifyAndEscapeQuotes(data.value))]
      : [{data: data.value}, 'encrypt'];

    const saveSteps = {};

    // TODO fail if all/any fail?

    if (data.local !== false && storage) saveSteps.local = saveLocal(storage, key);

    if (data.remote !== false) saveSteps.remote = saveRemote.bind(this)(storage, key, data, powQueue);

    return this.sequential([
      ...encryptionSteps,
      saveSteps, 'parallel'
    ], dataCallback, errorCallback, progressCallback);
  }
};
