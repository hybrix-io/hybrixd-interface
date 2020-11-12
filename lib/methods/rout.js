/**
   * Make an api call to hybrixd node
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
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {query: '/asset/dummy/details'}, 'rout'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.rout = (fail, user_keys, hybrixdNodes, connector) => function (data, dataCallback, errorCallback, progressCall) {
  if (typeof data === 'string') data = {query: data};
  if (typeof data !== 'object' || data === null || typeof data.query !== 'string') return fail('rout: no query provided.', errorCallback);
  if (!data.query.startsWith('/')) return fail('rout: expected query to start with a /', errorCallback);

  if (typeof data.channel !== 'undefined' && data.channel !== 'z' && data.channel !== 'y') return fail(`rout: illegal '${data.channel}' provided`, errorCallback);

  const errorCallbackWithFallback = error => {
    if (data.hasOwnProperty('fallback')) dataCallback(data.fallback);
    else errorCallback(error);
  };

  const encrypted = data.channel === 'y' || data.channel === 'z';
  if (encrypted && typeof user_keys === 'undefined') return fail('rout: No session available.', errorCallback);

  let host;
  if (typeof data.host === 'undefined') {
    if (Object.keys(hybrixdNodes).length === 0) return fail('rout: No hosts added.', errorCallback);
    const hosts = Object.keys(hybrixdNodes);
    host = hosts[Math.floor(Math.random() * hosts.length)]; // TODO loadbalancing, round robin or something
  } else host = data.host;

  const makeCall = () => {
    switch (data.channel) {
      case 'y' : hybrixdNodes[host].yCall({query: data.query, channel: data.channel, userKeys: user_keys, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
      case 'z' : hybrixdNodes[host].zCall({query: data.query, channel: data.channel, userKeys: user_keys, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
      default : hybrixdNodes[host].call({query: data.query, connector: connector, retries: data.retries}, dataCallback, errorCallbackWithFallback); break;
    }
  };

  const doLogin = () => {
    if (!encrypted || hybrixdNodes[host].initialized()) makeCall(); // if the host is already initialized, make the call
    else this.login({host}, makeCall, errorCallback, progressCall); // first login then make the call
  };
  if (hybrixdNodes.hasOwnProperty(host)) return doLogin();
  else return this.addHost({host: data.host}, doLogin, errorCallback, progressCall); // first add host then login
};
