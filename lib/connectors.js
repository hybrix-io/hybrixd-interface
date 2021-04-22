function fail (error, errorCallback) {
  if (DEBUG) { console.error(error); }
  if (typeof errorCallback === 'function') errorCallback(error);
}

function createUri (host, query) {
  if (host.endsWith('/') && query.startsWith('/')) return host + query.substr(1);
  if (!host.endsWith('/') && !query.startsWith('/')) return host + '/' + query;
  return host + query;
}

exports.xhrSocket = (data, host, query, dataCallback, errorCallback) => {
  const xhr = new data.connector.XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const data = xhr.responseText;
      if (xhr.status === 200) {
        if (xhr.getResponseHeader('content-type') !== 'application/json') dataCallback(JSON.stringify({error: 0, data}));
        else dataCallback(data);
      } else {
        if (xhr.status === 0) fail('Failed to connect to ' + host, errorCallback);
        else fail(data, errorCallback);
      }
    }
  };
  xhr.timeout = 15000; // TODO parameterize
  xhr.ontimeout = error => fail('Timeout' + error, errorCallback);
  const method = data.data ? 'POST' : 'GET';
  xhr.open(method, createUri(host, query), true); // TODO make method an option
  xhr.send(data.data);
};

const handleResponse = (dataCallback, errorCallback) => res => {
  // TODO make method an option  (POST,PUT,GET)
  res.setEncoding('utf8');
  const rawData = [];
  res
    .on('data', chunk => rawData.push(chunk))
    .on('timeout', () => {
      res.resume();
      fail('Request timed out.', errorCallback);
    })
    .on('error', error => {
      res.resume();
      fail(`Got error: ${error.message}`, errorCallback);
    })
    .on('end', () => {
      res.resume();
      const data = rawData.join('');
      if (res.statusCode < 200 || res.statusCode > 299) return errorCallback(data);
      else {
        if (res.headers['content-type'] !== 'application/json') return dataCallback(JSON.stringify({error: 0, data}));
        else return dataCallback(data);
      }
    });
};

const getResponse = (connector, host, query, data, dataCallback, errorCallback) => {
  const uri = createUri(host, query);
  if (data) { // POST
    const options = new URL(uri);
    options.method = 'POST';
    const request = connector.request(options, handleResponse(dataCallback, errorCallback))
      .on('error', errorCallback);
    request.write(data);
    request.end();
  } else { // GET
    connector.get(uri, handleResponse(dataCallback, errorCallback))
      .on('error', (e) => fail(`Got error: ${e.message}`, errorCallback));
  }
};

exports.httpSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.http, host, query, data.data, dataCallback, errorCallback);

exports.httpsSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.https, host, query, data.data, dataCallback, errorCallback);

exports.localSocket = (data, host, query, dataCallback, errorCallback) => dataCallback(data.connector.local.rout(query, data.data));
