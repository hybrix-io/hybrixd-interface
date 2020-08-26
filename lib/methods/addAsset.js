/**
   * Add an asset (crypto currency or token) to the session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The symbol of the asset
   * @param {string} [data.seed] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a custom seed to generate the asset keys
   * @param {string} [data.keys] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a keypair
   * @param {string} [data.privateKey] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a privateKey
   * @param {string} [data.clientModuleCodeBlob] - A string containing the client module code blob.
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'addAsset'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.addAsset = (assets, fail, clientModules) => function (data, dataCallback, errorCallback) {
  // TODO symbol as array of strings to load multiple?
  if (typeof data !== 'object' || data === null) { fail('Expected data to be an object.', errorCallback); return; }
  if (!data.hasOwnProperty('symbol')) { fail('Missing symbol property.', errorCallback); return; }

  const hostData = {channel: data.channel, host: data.host};

  const handleDetails = details => {
    if (typeof details.mode !== 'string') {
      fail('Expected \'mode\' property of string type in asset details.', errorCallback);
    } else if (details.hasOwnProperty('unified-symbols') && details['unified-symbols'] !== 'null' && details['unified-symbols'] !== null) {
      this.addUnifiedAsset({
        symbol: details.symbol,
        symbols: details['unified-symbols'],
        name: details.name,
        info: details.info,
        contract: details.contract,
        factor: details.factor,
        mode: details.mode,
        ...hostData
        // TODO , keys: data.keys, privateKey: data.privateKey
      }, dataCallback, errorCallback);
    } else {
      const mode = details.mode.split('.')[0];
      const initData = {assetDetails: details, seed: data.seed, keys: data.keys, privateKey: data.privateKey, ...hostData};

      if (clientModules.hasOwnProperty(mode)) { // Client Module was already retrieved
        this.initAsset(initData, dataCallback, errorCallback);
      } else if (data.hasOwnProperty('clientModuleCodeBlob')) { // Use provided  clientModuleBlob
        this.initAsset({...initData, clientModuleCodeBlob: data.clientModuleCodeBlob}, dataCallback, errorCallback);
      } else { // fetch clientModule blob from host
        this.rout({query: '/s/deterministic/code/' + mode, ...hostData}, (blob) => {
          this.initAsset({...initData, clientModuleCodeBlob: blob}, dataCallback, errorCallback);
        }, errorCallback);
      }
    }
  };

  if (!assets.hasOwnProperty(data.symbol)) { // if assets has not been iniated, retrieve and initialize
    this.rout({query: '/a/' + data.symbol + '/details', ...hostData}, handleDetails, errorCallback);
  } else if (data.hasOwnProperty('privateKey') || data.hasOwnProperty('keys')) { // overwrite asset with keys or privateKey
    handleDetails(assets[data.symbol]);
  } else if (typeof dataCallback === 'function') { // nothing to do, asset already initialized
    dataCallback(data.symbol);
  }
};
