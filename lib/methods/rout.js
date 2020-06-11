/**
   * Make a routing call to hybrixd node
   * @category Host
   * @param {Object} data
   * @param {string} data.query - The query path. For reference: <a href="/api/help">REST API help</a>.
   * @param {string} [data.fallback] - Provide a fallback value in case of errors.
   * @param {string} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.meta=false] - Indicate whether to include meta data (process information).
   * @param {string} [data.host] - Select a specific host, if omitted one will be chosen at random.
   * @param {Boolean} [data.retries=3] - Nr of retries for a call
   * @example
   * hybrix.sequential([
   * 'init',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {query: '/asset/dummy/details'}, 'rout'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.rout = (fail, user_keys, hybrixdNodes, connector) => function (data, dataCallback, errorCallback, progressCall) {
  const errorCallbackWithFallback = error => {
    if (data.hasOwnProperty('fallback')) dataCallback(data.fallback);
    else errorCallback(error);
  };

  let encrypted = data.channel === 'y' || data.channel === 'z';
  if (encrypted && typeof user_keys === 'undefined') {
    fail('No session available.', errorCallback);
    return;
  }

  let host;
  if (typeof data.host === 'undefined') {
    if (Object.keys(hybrixdNodes).length === 0) {
      fail('No hosts added.', errorCallback);
      return;
    }
    let hosts = Object.keys(hybrixdNodes);
    host = hosts[Math.floor(Math.random() * hosts.length)]; // TODO loadbalancing, round robin or something
  } else {
    host = data.host;
  }

  const makeCall = () => {
    switch (data.channel) {
      case 'y' : hybrixdNodes[host].yCall({query: data.query, channel: data.channel, userKeys: user_keys, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
      case 'z' : hybrixdNodes[host].zCall({query: data.query, channel: data.channel, userKeys: user_keys, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
      default : hybrixdNodes[host].call({query: data.query, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
    }
  };

  const doLogin = () => {
    if (!encrypted || hybrixdNodes[host].initialized()) { // if the host is already initialized, make the call
      makeCall();
    } else { // first login then make the call
      this.login({host}, makeCall, errorCallback, progressCall);
    }
  };
  if (hybrixdNodes.hasOwnProperty(host)) {
    doLogin();
  } else {
    // first add host then login
    this.addHost({host: data.host}, doLogin, errorCallback, progressCall);
  }
};
