const UrlBase64 = require('../../common/crypto/urlbase64');
// TODO pass salt
/**
   * Stringify and encrypt data with user keys.
   * @category Encryption
   * @param {Object} data
   * @param {Object} data.data - A string, array or object.
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
  if (!user_keys.boxSk) fail('No session available.', errorCallback);
  else {
    let result;
    try {
      const nonce_salt = nacl.from_hex('F4E5D5C0B3A4FC83F4E5D5C0B3A4AC83F4E5D000B9A4FC83');
      const crypt_utf8 = nacl.encode_utf8(JSON.stringify(data.data));
      const crypt_bin = nacl.crypto_box(crypt_utf8, nonce_salt, user_keys.boxPk, user_keys.boxSk);
      result = UrlBase64.safeCompress(nacl.to_hex(crypt_bin));
    } catch (e) {
      fail(e, errorCallback);// TODO improve error
      return;
    }
    dataCallback(result);
  }
};
