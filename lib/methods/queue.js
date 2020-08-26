/*
   * Performed queued Proof of Work required to extend saved data retention.
   * @category Storage
   * @param {Object} data
   * @param {string} [data.submit=true] - Whether to submit the proof of work
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {key:'Hello', value:'World!',queue:true}, 'save',
   * 'queue'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.queue = powQueue => function (data, dataCallback, errorCallback, progressCallback) {
  const steps = {};
  const submit = typeof data === 'object' && data !== null && data.submit !== false;
  for (let i = 0; i < powQueue.length; ++i) {
    const pow = powQueue[i];

    const powCopy = Object.assign({submit}, pow);

    const sequence = [
      powCopy, 'work',
      result => {
        result.key = pow.key;
        result.action = pow.action;
        result.hash = pow.hash;
        if (!submit) {
          result.challenge = pow.challenge;
          result.difficulty = pow.difficulty;
        }

        return result;
      }

    ];
    steps[i] = {data: sequence, step: 'sequential'};
  }
  powQueue = [];
  this.parallel(steps, dataCallback, errorCallback, progressCallback);
};
