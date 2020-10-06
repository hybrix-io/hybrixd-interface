const CommonUtils = require('../../common/index');
const baseCode = require('../../common/basecode');

/**
   * Get the keys associated with a login username/password. Important: handle your private keys confidentially.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.username - The login username.
   * @param {string} data.password - The login password.
   * @param {string} data.offset   - Offset to use.
   * @example
   * hybrix.sequential([
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0', offset: 1}, 'getLoginKeyPair'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getLoginKeyPair = (user_keys, fail) => function (data, dataCallback, errorCallback) {
  if (data.username !== 'DUMMYDUMMYDUMMY0' || data.password !== 'DUMMYDUMMYDUMMY0') {
    if (!CommonUtils.validateUserIDLength(data.username) || !CommonUtils.validateUseridForLegacyWallets(data.username)) {
      return fail('Invalid username: ' + JSON.stringify(data.username), errorCallback);
    }
    if (!CommonUtils.validatePasswordLength(data.password)) {
      return fail('Invalid password: [not shown for privacy reasons]', errorCallback);
    }
    if (!CommonUtils.validateUserIDLength(data.username) || !CommonUtils.validatePassForLegacyWallets(data.username, data.password)) {
      return fail('Incorrect username password combination for: ' + data.username, errorCallback);
    }
  }

  const keys = CommonUtils.generateKeys(data.password, data.username, data.offset || 0);
  const keypair = {publicKey: keyToHex(keys.boxPk), secretKey: keyToHex(keys.boxSk)};
  return dataCallback(keypair);
}

function keyToHex (input) {
  let charString = '';
  for (let i = 0; i < Object.keys(input).length; i++) {
    charString = charString + String.fromCharCode(input[i]);
  }
  return baseCode.recode('ascii', 'hex', charString);
}
