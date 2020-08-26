/**
   * Execute a function in a client module.
   * @category ClientModule
   * @param {Object} data
   * @param {string} [data.symbol] - The asset symbol . Either this or the id needs to be defined.
   * @param {string} [data.id] - id of the client module. (For assets this is the first part of the mode)
   * @param {string} data.func - The client module function to be called
   * @param {string} data.data - The data to be passed to the client module function
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy', func:'address', data:{}}, 'client'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.client = (assets, fail, clientModules) => function (data, dataCallback, errorCallback) {
  let id;
  let displayId;

  const execute = () => {
    if (clientModules[id].hasOwnProperty(data.func) && typeof clientModules[id][data.func] === 'function') {
      let result;
      try {
        result = clientModules[id][data.func](data.data, dataCallback, errorCallback);
      } catch (e) {
        fail(e, errorCallback);
        return;
      }
      if (typeof result !== 'undefined') { // when nothing is returned, expect it to be async
        dataCallback(result);
      }
    } else {
      fail('Client module function ' + data.func + ' for ' + displayId + ' not defined or not a function.', errorCallback);
    }
  };

  /* const load = () => {
    if (clientModules.hasOwnProperty(id)) {
      execute();
    } else { // if blob not yet available, get it.
      this.rout({host: data.host, query: '/s/deterministic/code/' + id, channel: data.channel}, (blob) => {
        try {
          let code = LZString.decompressFromEncodedURIComponent(blob);
          clientModules[id] = CommonUtils.activate(code);
          clientModuleBlobs[id] = blob;
        } catch (e) {
          fail(e, errorCallback);
          return;
        }
        execute();
      }, errorCallback);
    }
  }; */

  if (data.hasOwnProperty('id')) {
    id = data.id;
    displayId = id;
    execute();
  } else if (data.hasOwnProperty('symbol')) {
    if (assets.hasOwnProperty(data.symbol) && typeof dataCallback === 'function') {
      id = assets[data.symbol]['mode'].split('.')[0];
      displayId = id + '(' + data.symbol + ')';
      execute();
    } else {
      this.addAsset({symbol: data.symbol, channel: data.channel, host: data.host}, () => {
        id = assets[data.symbol]['mode'].split('.')[0];
        displayId = id + '(' + data.symbol + ')';
        execute();
      }, errorCallback);
    }
  } else {
    fail('Either data.id or data.symbol needs to be defined.', errorCallback);
  }
};
