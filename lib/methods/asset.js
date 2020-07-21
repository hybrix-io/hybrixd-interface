/**
   * Get detailed information about assets
   * @category AssetManagement
   * @param {Object} data - An array of symbols. For example: ['eth','btc','nxt']
   * @param {Object} [data.symbol] - An array of symbols. For example: ['eth','btc','nxt']
   * @example
   * hybrix.sequential([
   * 'init',
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'addAsset',
   * {symbol: 'dummy'}, 'asset'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   **/
exports.asset = (assets, fail) => function (data, dataCallback, errorCallback) {
  let assetList;
  if (typeof data === 'undefined') {
    assetList = Object.keys(assets);
  } else if (typeof data === 'string') {
    assetList = [data];
  } else if (data instanceof Array) {
    assetList = data;
  } else if (typeof data === 'object' && data !== null && typeof data.symbol === 'string') {
    data = [data.symbol];
  } else if (typeof data === 'object' && data !== null && data.symbol instanceof Array) {
    data = data.symbol;
  } else {
    fail('Expected string symbol, array of symbols or undefined, got:' + data, errorCallback);
    return;
  }

  const result = {};
  assetList.forEach(symbol => {
    if (assets.hasOwnProperty(symbol)) {
      const asset = assets[symbol];
      result[symbol] = {};

      for (let key in asset) {
        if (key !== 'data') result[symbol][key] = asset[key];
      }

      result[symbol].address = asset.data.address;
      result[symbol].balance = asset.data.balance;
      result[symbol].subBalances = asset.data.subBalances || {};
      // result[symbol]['publickey']=asset['data']['publickey'];
      // result[symbol]['privatekey']=asset['data']['privatekey'];
    }
  });

  dataCallback(result);
};
