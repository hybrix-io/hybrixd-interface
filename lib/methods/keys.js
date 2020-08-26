/**
   * Create signing keys
   * @category Encryption
   * @param {Object} data
   * @param {String} [data.secret] - The secret key to recreate a public key from.
   * @example
   * hybrix.sequential([
   * 'keys'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.keys = fail => function (data, dataCallback, errorCallback) {
  if (!data.hasOwnProperty('secret')) {
    const keys = nacl.crypto_sign_keypair();
    const publicKey = nacl.to_hex(keys.signPk);
    const secret = nacl.to_hex(keys.signSk);
    dataCallback({public: publicKey, secret}); // create keypair
  } else if (typeof data.secret === 'string' && data.secret.length === 128) {
    const secret = nacl.from_hex(data.secret);
    const keys = nacl.sign.keyPair.fromSecretKey(secret).publicKey;
    const publicKey = nacl.to_hex(keys.signPk);
    const secretKey = nacl.to_hex(keys.signSk);
    dataCallback({public: publicKey, secret: secretKey}); //  public key from secret key
  } else {
    fail('Expected \'secret\' property of string type with length 128.', errorCallback);
  }
};
