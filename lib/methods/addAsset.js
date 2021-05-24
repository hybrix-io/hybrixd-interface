const initAsset = (initData, dataCallback, errorCallback) => function (blob) {
  this.initAsset({...initData, clientModuleCodeBlob: blob, check: false}, dataCallback, errorCallback); // no need to re-check the hash
};

const loadBlobFromRemote = (mode, hostData, initData, dataCallback, errorCallback, storage, hash) => function () {
  this.rout({query: '/s/deterministic/code/' + mode, ...hostData}, blob => {
    if (storage && hash) {
      storage.save({key: 'deterministic_blob_' + mode, value: blob}, () => { // only if the blob was saved succesfull update the hash
        storage.save({key: 'deterministic_hash_' + mode, value: hash}, () => {}, error => console.error(error));
      }, error => console.error(error));
    }
    initAsset(initData, dataCallback, errorCallback).bind(this)(blob);
  }, errorCallback);
};

const compareHashes = (mode, hostData, initData, dataCallback, errorCallback, storage) => function (hashes) {
  const localHash = hashes.local;
  const remoteHash = typeof hashes.remote === 'object' && hashes.remote !== null && hashes.remote.hasOwnProperty('hash') ? hashes.remote.hash : 'error1';

  const fallbackCallback = loadBlobFromRemote(mode, hostData, initData, dataCallback, errorCallback, storage, remoteHash).bind(this);
  if (typeof hashes === 'object' && hashes !== null && remoteHash === localHash) {
    return storage.load({key: 'deterministic_blob_' + mode},
      initAsset(initData, dataCallback, fallbackCallback).bind(this),
      fallbackCallback // if local load fails, fallback to remote
    );
  } else return fallbackCallback();
};

const addBaseAsset = (data, details, dataCallback, errorCallback) => function () {
  if (details['fee-symbol'] === details.symbol || data.includeBaseAssets === false) dataCallback();
  else this.addAsset(details['fee-symbol'], dataCallback, errorCallback);
};

const handleDetails = (data, fail, storage, clientModules, hostData, dataCallback, errorCallback) => function (details) {
  if (typeof details.mode !== 'string') {
    return fail('Expected \'mode\' property of string type in asset details.', errorCallback);
  } else if (details.hasOwnProperty('unified-symbols') && details['unified-symbols'] !== 'null' && details['unified-symbols'] !== null) {
    return this.addUnifiedAsset({
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
    // also add base asset if fee symbol is different
    const followUp = addBaseAsset(
      data,
      details,
      () => this.asset({symbol: data.symbol}, dataCallback, errorCallback), // pass original asset data (instead of base data)
      errorCallback
    ).bind(this);

    if (clientModules.hasOwnProperty(mode)) { // Client Module was already retrieved
      return this.initAsset(initData, followUp, errorCallback);
    } else if (data.hasOwnProperty('clientModuleCodeBlob')) { // Use provided  clientModuleBlob
      return this.initAsset({...initData, clientModuleCodeBlob: data.clientModuleCodeBlob, check: data.check}, followUp, errorCallback);
    } else if (storage) { // retrieve blob from local storage and compare the remote hash
      return this.parallel(
        {
          local: {data: {func: (data, dataCallback, errorCallback) => storage.load({key: 'deterministic_hash_' + mode}, dataCallback, dataCallback)}, step: 'call'},
          remote: {data: {query: '/s/deterministic/hash/' + mode, ...hostData}, step: 'rout'}
        },
        compareHashes(mode, hostData, initData, followUp, errorCallback, storage).bind(this),
        errorCallback
      );
    } else { // fetch clientModule blob from host
      return loadBlobFromRemote(mode, hostData, initData, followUp, errorCallback, null, null).bind(this)();
    }
  }
};

/**
   * Add an asset (crypto currency or token) to the session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The symbol of the asset
   * @param {string} [data.seed] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a custom seed to generate the asset keys
   * @param {string} [data.keys] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a keypair
   * @param {string} [data.privateKey] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a privateKey
   * @param {string} [data.clientModuleCodeBlob] - A string containing the client module code blob.
   * @param {Boolean} [data.check=true] - Whether to check if the provided clientModuleCodeBlob matches the remote version
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   * @param {string} [data.includeBaseAssets=true] - Add the base asset too. (Main chain for token)
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
exports.addAsset = (assets, fail, clientModules, storage) => function (data, dataCallback, errorCallback) {
  if (typeof data === 'string') data = {symbol: data};
  else if (typeof data !== 'object' || data === null) return fail('Expected data to be an object.', errorCallback);

  if (!data.hasOwnProperty('symbol')) return fail('Missing symbol property.', errorCallback);
  if (typeof data.symbol !== 'string') return fail('Expected symbol to be a string.', errorCallback);

  const hostData = {channel: data.channel, host: data.host};
  const followUp = handleDetails(data, fail, storage, clientModules, hostData, dataCallback, errorCallback).bind(this);

  if (!assets.hasOwnProperty(data.symbol)) { // if assets has not been iniated, retrieve and initialize
    return this.rout({query: '/a/' + data.symbol + '/details', ...hostData}, followUp, errorCallback);
  } else if (data.hasOwnProperty('privateKey') || data.hasOwnProperty('keys')) { // overwrite asset with keys or privateKey
    return followUp(assets[data.symbol]);
  } else if (typeof dataCallback === 'function') { // nothing to do, asset already initialized
    return this.asset(data.symbol, dataCallback, errorCallback);
  } else return undefined;
};
