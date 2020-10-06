const CommonUtils = require('../../common/index');
const baseCode = require('../../common/basecode');

/**
   * Create a local deterministic session and - if required - log out of current session.
   * @category Session
   * @param {Object} data
   * @param {string} data.username  - The username for the deterministic session
   * @param {string} data.password  - The password for the deterministic session
   * @param {string} data.publicKey - The public key to use for the deterministic session (can not be used in combination with username/password!)
   * @param {string} data.secretKey - The secret key to use for the deterministic session (can not be used in combination with username/password!)
   * @param {string} [data.offset]  - The offset to create alternative accounts
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   **/
exports.session = (user_keys, fail) => function (data, dataCallback, errorCallback) {
  if (!(data.publicKey && data.secretKey) && (data.username !== 'DUMMYDUMMYDUMMY0' || data.password !== 'DUMMYDUMMYDUMMY0')) {
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

  return this.logout({}, () => { // first logout clear current data
    if (data.username && data.password) {
      const keys = CommonUtils.generateKeys(data.password, data.username, data.offset || 0);
      user_keys.boxPk = keys.boxPk;
      user_keys.boxSk = keys.boxSk;
    } else {
      user_keys.boxPk = hexToKey(data.publicKey);
      user_keys.boxSk = hexToKey(data.secretKey);
    }
    if (typeof dataCallback === 'function') {
      dataCallback(data.username);
    }
  });
};

function hexToKey (input) {
  const string = baseCode.recode('hex', 'ascii', input);
  const ordered = {};
  for (let i = 0; i < string.length; i++) {
    ordered[i] = string.charCodeAt(i);
  }
  return ordered;
}
