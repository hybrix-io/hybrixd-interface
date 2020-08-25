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
exports.login = (user_keys, hybrixdNodes, connector, fail) => function (data, dataCallback, errorCallback) {
  if (!user_keys.boxSk) {
    fail('No session available.', errorCallback);
  } else if (!data.hasOwnProperty('host')) {
    fail('No host provided.', errorCallback);
  } else if (hybrixdNodes.hasOwnProperty(data.host)) {
    if (!hybrixdNodes[data.host].initialized()) {
      hybrixdNodes[data.host].init({userKeys: user_keys, connector: connector}, dataCallback, errorCallback);
    } else {
      dataCallback(data.host);
    }
  } else { // host still  needs to be added
    this.addHost({host: data.host}, () => {
      hybrixdNodes[data.host].init({userKeys: user_keys, connector: connector}, dataCallback, errorCallback);
    }, errorCallback);
  }
};
