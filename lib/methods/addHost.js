const HybrixdNode = require('../hybrixdNode');

function isValidHostName (host) {
  return !/^([-a-z\d%@_.~+&:]*\/)?$/i.test(host) && // relative path "api/"
  !/^(http|https):\/\/[a-z\d]([a-z\d-]{0,61}[a-z\d])?(\.[a-z\d]([a-z\d-]{0,61}[a-z\d])?)*(:\d*)?\/([-a-z\d%@_.~+&:]*\/)?$/i.test(host) && // hostnames  "http://localhost:8080/api"
  !/^(http|https):\/\/((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:\d*)?\/([-a-z\d%@_.~+&:]*\/)?$/i.test(host); // ipv4 address "http://127.0.0.1:8080/api"
  // TODO ipv6
}

/**
   * Add a hybrixd node as host.
   * @category Host
   * @param {Object} data
   * @param {string} data.host - The hostname for the hybrixd node
   * @param {string} [data.regular=true] - Indicate whether this is a regular of specialized host. specialized hosts are skipped as default host
   * @example
   * hybrix.sequential([
   * {host: 'http://localhost:1111/'}, 'addHost'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.addHost = (fail, hybrixdNodes) => function (data, dataCallback, errorCallback) {
  // TODO  multiple in array?
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object.', errorCallback);
  if (!data.host.endsWith('/')) data.host += '/';

  if (isValidHostName(data.host)) return fail('Host not valid hostname, IPv4, or relative path : "' + data.host + '"  expected: "[protocol://hostnameOrIPv4Address[:portnumber]][/path]/"', errorCallback);
  else {
    const hybrixdNode = new HybrixdNode.hybrixdNode(data.host, data.regular !== false);
    hybrixdNodes[data.host] = hybrixdNode;
    if (typeof dataCallback === 'function') return dataCallback(data.host);
  }
};
