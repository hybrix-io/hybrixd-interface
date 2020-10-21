const UrlBase64 = require('../../common/crypto/urlbase64');
/**
   * Stringify and encrypt data with user keys.
   * @category Encryption
   * @param {Object} data
   * @param {Object} data.data - A string, array or object.
   * @param {Object} [data.salt] - Use an alternative encryption salt.
   * @param {Object} [data.publicKey] - Use an alternative public key.
   * @param {Object} [data.secretKey] - Use an alternative secret key.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {data:'Hello World!'}, 'encrypt'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.encrypt = (userKeys, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('data')) return fail('encrypt: Expected \'data\' property.', errorCallback);
  if (!((userKeys.boxSk && userKeys.boxPk) || (data.publicKey && data.secretKey))) return fail('Exptected session or a publicKey secretKey pair.', errorCallback);
  else {
    let result;
    try {
      const salt = data.salt || 'F4E5D5C0B3A4FC83F4E5D5C0B3A4AC83F4E5D000B9A4FC83';
      const publicKey = data.hasOwnProperty('publicKey') ? nacl.from_hex(data.publicKey) : userKeys.boxPk;
      const secretKey = data.hasOwnProperty('secretKey') ? nacl.from_hex(data.secretKey) : userKeys.boxSk;

      const nonceSalt = nacl.from_hex(salt);
      const cryptUtf8 = nacl.encode_utf8(JSON.stringify(data.data));
      const cryptBin = nacl.crypto_box(cryptUtf8, nonceSalt, publicKey, secretKey);
      result = UrlBase64.safeCompress(nacl.to_hex(cryptBin));
    } catch (e) {
      return fail('encrypt: ' + e, errorCallback);
    }
    return dataCallback(result);
  }
};
