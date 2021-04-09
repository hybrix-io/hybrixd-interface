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
exports.logout = (assets, user_keys, pendingTransactions, hybrixdNodes) => function (data, dataCallback, errorCallback) {
  if (typeof dataCallback === 'undefined') dataCallback = () => {};

  for (const symbol in assets) delete assets[symbol];
  for (const key in user_keys) delete user_keys[key];

  for (const id in pendingTransactions) delete pendingTransactions[id];

  const resetHostsSteps = {};
  for (const hostName in hybrixdNodes) resetHostsSteps[hostName] = hybrixdNodes[hostName].reset;

  return this.parallel(resetHostsSteps, dataCallback, errorCallback);
};
