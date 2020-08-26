const proof = require('../../common/crypto/proof');
// TODO add example
/**
   * Perform Proof of Work required to extend saved data retention.
   * @category Storage
   * @param {Object} data
   * @param {Object} data.challenge - The hint that needs to be worked.
   * @param {Object} data.difficulty - The difficulty of the work
   * @param {string} [data.submit] - Whether to submit the proof of work
   * @param {Object} [data.key] - Required for submit
   * @param {String} [data.host] - The host to store the data on.
   * @param {String} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.meta=false] - Indicate whether to include meta data (process information).
   */
exports.work = () => function (data, dataCallback, errorCallback, progressCallback) {
  let redirectCallback;
  if (data.submit && data.key) { // redirect to submit proof of work
    redirectCallback = hash => {
      this.rout({query: '/e/storage/work/' + encodeURIComponent(data.key) + '/' + hash, host: data.host, channel: data.channel, meta: data.meta}, dataCallback, errorCallback, progressCallback);
    };
  } else {
    redirectCallback = solution => dataCallback({solution});
  }
  proof.solve(data.challenge, data.difficulty, redirectCallback, errorCallback, progressCallback);
};
