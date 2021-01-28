const UrlBase64 = require('../../common/crypto/urlbase64');
const {DEFAULT_SALT} = require('./encrypt');
/**
   * Decrypt and parse data with user keys.
   * @category Encryption
   * @param {Object} data
   * @param {String} data.data - An encrypted and stringified string, array or object.
   * @param {Object} [data.salt] - Use an alternative encryption salt.
   * @param {Object} [data.publicKey] - Use an alternative public key.
   * @param {Object} [data.secretKey] - Use an alternative secret key.
   * @example
   * hybrix.sequential([
   *   {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   *   {data:'Hello World!'}, 'encrypt',
   *   data=>{return {data:data}}, 'decrypt'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.decrypt = (user_keys, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('data')) return fail('Expected data property', errorCallback);
  else if (!hasSession() && !(data.secretKey && data.publicKey)) return fail('No session available or keys provided.', errorCallback);
  else if (typeof data.data !== 'string') return fail('Expected \'data\' to be a string.', errorCallback);
  else {
    let result;
    try {
      const nonce_salt = nacl.from_hex(data.salt || DEFAULT_SALT);
      const crypt_hex = nacl.from_hex(UrlBase64.safeDecompress(data.data));
      const publicKey = data.hasOwnProperty('publicKey') ? nacl.from_hex(data.publicKey) : user_keys.boxPk;
      const secretKey = data.hasOwnProperty('secretKey') ? nacl.from_hex(data.secretKey.substr(0, 64)) : user_keys.boxSk;
      const crypt_bin = nacl.crypto_box_open(crypt_hex, nonce_salt, publicKey, secretKey);
      const json = nacl.decode_utf8(crypt_bin);
      result = json === 'undefined' ? undefined : JSON.parse(json);
    } catch (e) {
      return fail('Decryption error: ' + e, errorCallback);
    }
    return dataCallback(result);
  }
};
