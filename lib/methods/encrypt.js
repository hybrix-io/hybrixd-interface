const DEFAULT_SALT = 'F4E5D5C0B3A4FC83F4E5D5C0B3A4AC83F4E5D000B9A4FC83';
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
exports.encrypt = (user_keys, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('data')) return fail('Expected data property', errorCallback);
  else if (!(user_keys.boxSk && user_keys.boxPk) && !(data.secretKey && data.publicKey)) return fail('No session available or keys provided.', errorCallback);
  else {
    let result;
    try {
      const nonce_salt = nacl.from_hex(data.salt || DEFAULT_SALT);
      const crypt_utf8 = nacl.encode_utf8(JSON.stringify(data.data));
      const publicKey = data.hasOwnProperty('publicKey') ? nacl.from_hex(data.publicKey) : user_keys.boxPk;
      const secretKey = data.hasOwnProperty('secretKey') ? nacl.from_hex(data.secretKey.substr(0, 64)) : user_keys.boxSk;
      const crypt_bin = nacl.crypto_box(crypt_utf8, nonce_salt, publicKey, secretKey);
      result = UrlBase64.safeCompress(nacl.to_hex(crypt_bin));
    } catch (e) {
      return fail('Encryption error: ' + e, errorCallback);
    }
    return dataCallback(result);
  }
};
exports.DEFAULT_SALT = DEFAULT_SALT;
