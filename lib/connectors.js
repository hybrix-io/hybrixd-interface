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
  xhr.open('GET', createUri(host, query), true); // TODO make method an option
  xhr.send();
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

const getResponse = (connector, host, query, dataCallback, errorCallback) => {
  connector.get(createUri(host, query), handleResponse(dataCallback, errorCallback))
    .on('error', (e) => fail(`Got error: ${e.message}`, errorCallback));
};

exports.httpSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.http, host, query, dataCallback, errorCallback);

exports.httpsSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.https, host, query, dataCallback, errorCallback);

exports.localSocket = (data, host, query, dataCallback, errorCallback) => dataCallback(data.connector.local.rout(query));
