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
  xhr.onreadystatechange = e => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) dataCallback(xhr.responseText);
      else fail(xhr.responseText, errorCallback);
    }
  };
  xhr.timeout = 15000; // TODO parameterize
  xhr.ontimeout = error => fail('Timeout' + error, errorCallback);
  xhr.open('GET', createUri(host, query), true); // TODO make method an option
  xhr.send();
};

const handleResponse = (dataCallback, errorCallback) => res => {
  // TODO make method an option
  // const contentType = res.headers['content-type']
  if (res.statusCode < 200 || res.statusCode > 299) {
    const error = ('Request error: Status Code: ' + res.statusCode);
    res.resume(); // consume response data to free up memory
    fail(error, errorCallback); // TODO error.message
    return;
  }

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
      dataCallback(rawData.join(''));
    });
};

const getResponse = (connector, host, query, dataCallback, errorCallback) => {
  connector.get(createUri(host, query), handleResponse(dataCallback, errorCallback))
    .on('error', (e) => fail(`Got error: ${e.message}`, errorCallback));
};

exports.httpSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.http, host, query, dataCallback, errorCallback);

exports.httpsSocket = (data, host, query, dataCallback, errorCallback) => getResponse(data.connector.https, host, query, dataCallback, errorCallback);

exports.localSocket = (data, host, query, dataCallback, errorCallback) => dataCallback(data.connector.local.rout(query));
