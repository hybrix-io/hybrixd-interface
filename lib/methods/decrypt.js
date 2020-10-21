const UrlBase64 = require('../../common/crypto/urlbase64');

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
exports.decrypt = (userKeys, fail) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('data')) return fail('encrypt: Expected \'data\' property.', errorCallback);
  if (!((userKeys.boxSk && userKeys.boxPk) || (data.publicKey && data.secretKey))) return fail('Exptected session or a publicKey secretKey pair.', errorCallback);
  else if (typeof data.data !== 'string') fail('Expected \'data\' to be a string.', errorCallback);
  else {
    let result;
    try {
      const salt = data.salt || 'F4E5D5C0B3A4FC83F4E5D5C0B3A4AC83F4E5D000B9A4FC83';
      const publicKey = data.hasOwnProperty('publicKey') ? nacl.from_hex(data.publicKey) : userKeys.boxPk;
      const secretKey = data.hasOwnProperty('secretKey') ? nacl.from_hex(data.secretKey) : userKeys.boxSk;

      const nonceSalt = nacl.from_hex(salt);
      const cryptHex = nacl.from_hex(UrlBase64.safeDecompress(data.data));
      // use nacl to create a crypto box containing the data
      const cryptBin = nacl.crypto_box_open(cryptHex, nonceSalt, publicKey, secretKey);
      const json = nacl.decode_utf8(cryptBin);
      result = json === 'undefined' ? undefined : JSON.parse(json);
    } catch (e) {
      return fail('Decryption error: ' + e, errorCallback);
    }
    dataCallback(result);
  }
};
