const crypto = require('crypto');
const djb2 = require('../../common/crypto/hashDJB2');
const sha256 = require('js-sha256');

/**
   * Stringify and create a hash.
   * @category Encryption
   * @param {Object} data
   * @param {Object} data.data - A string, array or object.
   * @param {String} [data.salt=''] - A string to salt the hash with.
   * @param {String} [data.method=sha256] - Method to use for hashing. Available: md5, djb2, sha244, sha256
   * @example
   * hybrix.sequential([
   *   {data:'hello world'}, 'hash'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */

exports.hash = fail => function (data, dataCallback, errorCallback) {
  if ((typeof data === 'object' && data !== null && typeof data.data === 'string') || typeof data === 'string') {
    const hdata = typeof data === 'string'
      ? data
      : (typeof data.salt === 'undefined' ? data.data : data.data + String(data.salt));

    const method = typeof data === 'object' && data !== null && data.hasOwnProperty('method') ? data.method : 'sha256';
    let hash;
    switch (method) {
      case 'md5':
        hash = crypto.createHash('md5').update(hdata).digest('hex');
        break;
      case 'djb2':
        hash = djb2.hash(hdata);
        break;
      case 'sha244':
        hash = sha256.sha224(hdata);
        break;
      case 'sha256':
        hash = sha256.sha256(hdata);
        break;
      default:
        return fail('Unknown hash method ', errorCallback);
    }
    return dataCallback(hash);
  } else return fail('Expected string input to create hash!', errorCallback);
};
