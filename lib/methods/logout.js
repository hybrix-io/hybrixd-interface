/**
   * Log out of current session.
   * @category Session
   * @param {Object} data - Not used
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * 'logout'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   **/
exports.logout = (assets, user_keys) => function (data, dataCallback, errorCallback) {
  for (let symbol in assets) {
    delete assets[symbol];
  }
  delete user_keys.boxPk;
  delete user_keys.boxSk;
  if (typeof dataCallback === 'function') { dataCallback(); }
};
