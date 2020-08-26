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
   * @param {String} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.meta=false] - Indicate whether to include meta data (process information).
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
exports.save = (fail, powQueue, legacy) => function (data, dataCallback, errorCallback, progressCallback) {
  let redirectCallback;
  if (data.work !== false) { // redirect to do and submit proof of work
    redirectCallback = key => result => {
      if (result.hasOwnProperty('challenge')) {
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
          dataCallback({result});
        } else { // do work now
          this.work({
            challenge: result.challenge,
            difficulty: result.difficulty,
            host: data.host,
            channel: data.channel,
            key,
            submit: typeof data.submit === 'undefined' ? true : data.submit
          },
          work => {
            if (data.submit === false) {
              delete result.difficulty;
              delete result.challenge;
              result.solution = work.solution;
            } else {
              delete result.difficulty;
              delete result.challenge;
              result.expire = work.expire;
            }
            dataCallback(result);
          },
          errorCallback, progressCallback);
        }
      } else {
        dataCallback(result);
      }
    };
  } else {
    redirectCallback = dataCallback;
  }

  if (typeof data !== 'object') {
    fail('Expected an object.', errorCallback);
  } else if (!data.hasOwnProperty('key') || typeof data.key !== 'string') {
    fail('Expected \'key\' property of string type.', errorCallback);
  } else if (!data.hasOwnProperty('value')) {
    fail('Expected \'value\' property.', errorCallback);
  } else if (data.encrypted === false) {
    // stringify, escape quotes, and encode
    const key = data.key;
    this.rout({host: data.host, query: '/e/storage/save/' + encodeURIComponent(key) + '/' + encodeURIComponent(JSON.stringify(data.value).replace(/"/g, '\\"')), channel: data.channel}, redirectCallback(key), errorCallback, progressCallback);
  } else if (data.legacy === true) {
    const key = legacy(data.key);
    this.sequential([
      {data: data.value}, 'encrypt',
      result => { return {host: data.host, query: '/e/storage/save/' + encodeURIComponent(key) + '/' + result, channel: data.channel, meta: data.meta}; }, 'rout'
    ], redirectCallback(key), errorCallback, progressCallback);
  } else {
    const key = data.key;
    this.sequential([
      {data: data.value}, 'encrypt',
      result => { return {host: data.host, query: '/e/storage/save/' + encodeURIComponent(key) + '/' + result, channel: data.channel, meta: data.meta}; }, 'rout'
    ], redirectCallback(key), errorCallback, progressCallback);
  }
};
