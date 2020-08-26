const baseCode = require('../../common/basecode');

/**
   * Sign a message with a secret key or verify the signature for a public key.
   * @category Encryption
   * @param {Object} data
   * @param {String} data.message - The message to sign or open.
   * @param {String} [data.public] - The public key to verify.
   * @param {String} [data.secret] - The secret key to sign with.
   * @param {Boolean|String} [data.signature] - Indication to create a detached signature or a detached signature to verify.
   * @example
   * var myKeys;
   * hybrix.sequential([
   * 'keys',  // Create key pair
   * keys => { myKeys = keys;}, // Store key pair
   * result => {return {message:'Hello World',secret:myKeys.secret}},'sign', // Sign message with secret
   * result => {return {message: result, public: myKeys.public}}, 'sign'  // Open message with public
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.sign = fail => function (data, dataCallback, errorCallback) {
  if (!data.hasOwnProperty('message') || typeof data.message !== 'string') {
    fail('Expected \'message\' property of string type.', errorCallback);
  } else if (data.hasOwnProperty('secret') && typeof data.secret === 'string' && data.secret.length === 128) {
    let secret = nacl.from_hex(data.secret);
    let message = baseCode.recode('utf-8', 'hex', data.message);
    message = nacl.from_hex(message);
    if (data.signature) {
      message = nacl.crypto_sign_detached(message, secret);
    } else {
      message = nacl.crypto_sign(message, secret);
    }
    message = nacl.to_hex(message);
    dataCallback(message);
  } else if (data.hasOwnProperty('public') && typeof data.public === 'string' && data.public.length === 64) {
    let publicKey = nacl.from_hex(data.public);
    let message = nacl.from_hex(data.message);
    if (typeof data.signature === 'string') {
      let verified = nacl.crypto_sign_verify_detached(message, data.signature, publicKey);
      dataCallback(verified);
    } else {
      let unpackedMessage = nacl.crypto_sign_open(message, publicKey);
      if (unpackedMessage === null) {
        fail('Failed to open message using provided public key.', errorCallback);
      } else {
        unpackedMessage = nacl.to_hex(unpackedMessage);
        unpackedMessage = baseCode.recode('hex', 'utf-8', unpackedMessage);
        dataCallback(unpackedMessage);
      }
    }
  } else {
    fail('Expected \'secret\' property of string type with length 128 or \'public\' of length 64.', errorCallback);
  }
};
