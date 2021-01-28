/**
   * Create an encrypted session with a host.
   * @category Session
   * @param {Object} data
   * @param {string} data.host - The hostname for the hybrixd node.
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {host: 'http://localhost:1111/'}, 'login'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.login = (user_keys, hybrixdNodes, connector, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (!hasSession()) return fail('login: No session available.', errorCallback);
  else if (typeof data !== 'object' || data == null) return fail('login: Expected data to be an object.', errorCallback);
  else if (!data.hasOwnProperty('host')) return fail('login: No host provided.', errorCallback);
  else if (hybrixdNodes.hasOwnProperty(data.host)) {
    if (!hybrixdNodes[data.host].initialized()) {
      return hybrixdNodes[data.host].init({userKeys: user_keys, connector: connector}, dataCallback, errorCallback);
    } else {
      return dataCallback(data.host);
    }
  } else { // host still  needs to be added
    return this.addHost({host: data.host}, () => {
      hybrixdNodes[data.host].init({userKeys: user_keys, connector: connector}, dataCallback, errorCallback);
    }, errorCallback);
  }
};
