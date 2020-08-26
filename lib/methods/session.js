const CommonUtils = require('../../common/index');

/**
   * Create a local deterministic session and - if required - log out of current session.
   * @category Session
   * @param {Object} data
   * @param {string} data.username - The username for the deterministic session
   * @param {string} data.password - The password for the deterministic session
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
  if (data.username !== 'DUMMYDUMMYDUMMY0' || data.password !== 'DUMMYDUMMYDUMMY0') {
    if (!CommonUtils.validateUserIDLength(data.username) || !CommonUtils.validateUseridForLegacyWallets(data.username)) {
      fail('Invalid username: ' + JSON.stringify(data.username), errorCallback);
      return;
    }
    if (!CommonUtils.validatePasswordLength(data.password)) {
      fail('Invalid password: [not shown for privacy reasons]', errorCallback);
      return;
    }
    if (!CommonUtils.validateUserIDLength(data.username) || !CommonUtils.validatePassForLegacyWallets(data.username, data.password)) {
      fail('Incorrect username password combination for: ' + data.username, errorCallback);
      return;
    }
  }

  this.logout({}, () => { // first logout clear current data
    const keys = CommonUtils.generateKeys(data.password, data.username, 0);
    user_keys.boxPk = keys.boxPk;
    user_keys.boxSk = keys.boxSk;
    if (typeof dataCallback === 'function') {
      dataCallback(data.username);
    }
  });
};
