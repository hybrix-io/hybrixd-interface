const returnResults = (symbols, assets, dataCallback) => () => {
  const result = {};
  symbols.forEach(symbol => {
    if (assets.hasOwnProperty(symbol)) {
      const asset = assets[symbol];
      result[symbol] = {};

      for (let key in asset) {
        if (key !== 'data') result[symbol][key] = asset[key];
      }

      result[symbol].address = asset.data.address;
      result[symbol].balance = asset.data.balance;
      result[symbol].subBalances = asset.data.subBalances || {};
      // DISABLED result[symbol]['publickey']=asset['data']['publickey'];
      // DISABLED result[symbol]['privatekey']=asset['data']['privatekey'];
    }
  });

  dataCallback(result);
};

/**
   * Get detailed information about assets
   * @category AssetManagement
   * @param {Object} data - An array of symbols. For example: ['eth','btc','nxt']
   * @param {Object} [data.symbol] - An array of symbols. For example: ['eth','btc','nxt']
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'asset'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   **/
exports.asset = (assets, fail) => function (data, dataCallback, errorCallback) {
  let symbols;
  if (typeof data === 'undefined') symbols = Object.keys(assets);
  else if (typeof data === 'string') symbols = [data];
  else if (data instanceof Array) symbols = data;
  else if (typeof data === 'object' && data !== null && typeof data.symbol === 'string') symbols = [data.symbol];
  else if (typeof data === 'object' && data !== null && data.symbol instanceof Array) symbols = data.symbol;
  else return fail('Expected string symbol, array of symbols or undefined, got:' + data, errorCallback);

  const addAssetSteps = {_options: {failIfAnyFails: true}};

  for (let symbol of symbols) { // check if there are assets that need to be added
    if (!assets.hasOwnProperty(symbol)) {
      addAssetSteps[symbol] = {data: {symbol, host: data.host, channel: data.channel}, step: 'addAsset'};
    }
  }

  return Object.keys(addAssetSteps).length > 1 // if there are assets to be added, add them first
    ? this.parallel(addAssetSteps, returnResults(symbols, assets, dataCallback), errorCallback)
    : returnResults(symbols, assets, dataCallback)();
};
