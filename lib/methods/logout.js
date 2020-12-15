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
exports.logout = (assets, user_keys, pendingTransactions) => function (data, dataCallback, errorCallback) {
  for (let symbol in assets) delete assets[symbol];
  delete user_keys.boxPk;
  delete user_keys.boxSk;
  for (let id in pendingTransactions) {
    delete pendingTransactions[id];
  }
  if (typeof dataCallback === 'function') dataCallback();
};
