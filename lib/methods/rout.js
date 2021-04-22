/**
   * Make an api call to hybrixd node
   * @category Host
   * @param {Object} data
   * @param {string} data.query - The query path. For reference: <a href="/api/help">REST API help</a>.
   * @param {string} [data.fallback] - Provide a fallback value in case of errors.
   * @param {string} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {Boolean} [data.meta=false] - Indicate whether to include meta data (process information).
   * @param {Boolean} [data.retries=3] - Nr of retries for a call
   * @param {string} [data.host] - Select a specific host, if omitted one will be chosen at random.
   * @param {string} [data.regular=true] - If defining a new host, indicate whether it's a regular host.
   * @param {string} [data.encryptByDefault=false] -  If defining a new host, indicate whether to use y chan by default
   * @param {string} [data.data] - POST data
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
exports.rout = (fail, user_keys, hybrixdNodes, connector, hasSession) => function (data, dataCallback, errorCallback, progressCall) {
  if (typeof data === 'string') data = {query: data};
  if (typeof data !== 'object' || data === null || typeof data.query !== 'string') return fail('rout: no query provided.', errorCallback);
  if (!data.query.startsWith('/')) return fail('rout: expected query to start with a /', errorCallback);

  if (typeof data.channel !== 'undefined' && data.channel !== 'z' && data.channel !== 'y') return fail(`rout: illegal '${data.channel}' provided`, errorCallback);

  const errorCallbackWithFallback = error => {
    if (data.hasOwnProperty('fallback')) dataCallback(data.fallback);
    else errorCallback(error);
  };

  let host;
  if (typeof data.host === 'undefined') {
    if (Object.keys(hybrixdNodes).length === 0) return fail('rout: No hosts added.', errorCallback);
    const hosts = Object.keys(hybrixdNodes).filter(host => hybrixdNodes[host].isRegular); // skip non regular hosts
    if (hosts.length === 0) return fail('rout: No hosts available.', errorCallback);
    host = hosts[Math.floor(Math.random() * hosts.length)]; // TODO loadbalancing, round robin or something
  } else host = data.host;

  const encryptByDefault = data.encryptByDefault || (hybrixdNodes.hasOwnProperty(host) && hybrixdNodes[host].encryptByDefault);

  const channel = data.hasOwnProperty('channel')
    ? data.channel
    : ((encryptByDefault && hasSession()) ? 'y' : undefined); // if keys are available then encrypt by default

  const encrypted = channel === 'y' || channel === 'z';

  if (encrypted && !hasSession()) return fail('rout: No session available.', errorCallback);

  const makeCall = () => {
    const hybrixdNode = hybrixdNodes[host];
    const callData = {query: data.query, data: data.data, channel: channel, userKeys: user_keys, connector: connector, retries: data.retries};
    switch (channel) {
      case 'y' : return hybrixdNode.yCall(callData, dataCallback, errorCallbackWithFallback);
      case 'z' : return hybrixdNode.zCall(callData, dataCallback, errorCallbackWithFallback);
      default: return hybrixdNode.call(callData, dataCallback, errorCallbackWithFallback);
    }
  };

  const doLogin = host_ => {
    host = host_; // use sanitizd host
    if (!encrypted || hybrixdNodes[host].initialized()) makeCall(); // if the host is already initialized, make the call
    else this.login({host}, makeCall, errorCallback, progressCall); // first login then make the call
  };

  if (hybrixdNodes.hasOwnProperty(host)) return doLogin(host);
  else return this.addHost({host: data.host, regular: data.regular !== false, encryptByDefault: data.encryptByDefault === true}, doLogin, errorCallback, progressCall); // first add host then login
};
