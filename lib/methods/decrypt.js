const UrlBase64 = require('../../common/crypto/urlbase64');

/**
   * Decrypt and parse data with user keys.
   * @category Encryption
   * @param {Object} data
   * @param {String} data.data - An encrypted and stringified string, array or object.
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
exports.decrypt = (user_keys, fail) => function (data, dataCallback, errorCallback) {
  if (!user_keys.boxSk) fail('No session available.', errorCallback);
  else if (typeof data.data !== 'string') fail('Expected \'data\' to be a string.', errorCallback);
  else {
    let result;
    try {
      const nonce_salt = nacl.from_hex('F4E5D5C0B3A4FC83F4E5D5C0B3A4AC83F4E5D000B9A4FC83');
      const crypt_hex = nacl.from_hex(UrlBase64.safeDecompress(data.data));
      // use nacl to create a crypto box containing the data
      const crypt_bin = nacl.crypto_box_open(crypt_hex, nonce_salt, user_keys.boxPk, user_keys.boxSk);
      result = JSON.parse(nacl.decode_utf8(crypt_bin));
    } catch (err) {
      fail(err, errorCallback); // TODO better error message
    }
    dataCallback(result);
  }
};
