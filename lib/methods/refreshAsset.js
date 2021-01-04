const Decimal = require('../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });

let isHyAsset;
try {
  isHyAsset = require('./rawTransaction/hyProtocol/hyProtocol.js').isHyAsset;
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
    isHyAsset = () => false;
  } else {
    throw e;
  }
}

function updateHyBalancesSteps (data, symbol, asset) {
  return [
    {query: '/a/' + symbol + '/subbalances/' + asset.data.address, fallback: undefined, channel: data.channel}, 'rout', // get all subBalances
    subBalances => {
      if (subBalances instanceof Array) {
        let balance = new Decimal(0);
        asset.data.subBalances = {};
        for (let subBalance of subBalances) {
          asset.data.subBalances[subBalance.symbol + ':' + subBalance.address] = subBalance.balance;
          asset.data.lastRefreshTime = Date.now();
          balance = balance.add(new Decimal(subBalance.balance));
        }
        asset.data.balance = this.form({amount: balance.toString(), factor: asset.factor});
      }
      return asset.data.balance;
    }
  ];
}

function updateRegularBalanceSteps (data, symbol, asset) {
  return [
    {query: '/a/' + symbol + '/balance/' + asset.data.address, fallback: undefined, channel: data.channel}, 'rout',
    balance => {
      if (typeof balance !== 'undefined') {
        asset.data.balance = balance;
        asset.data.lastRefreshTime = Date.now();
        asset.data.subBalances = {[symbol + ':' + asset.data.address]: balance};
      }
      return asset.data.balance;
    }
  ];
}

const updateBalance = (data, symbol, assets) => function (xdata, dataCallback, errorCallback, progressCallback) {
  if (!assets.hasOwnProperty(symbol)) {
    errorCallback(`Asset ${symbol} could not be added.`);
    return;
  }
  this.sequential(getUpdateBalanceSteps(data, symbol, assets), dataCallback, errorCallback, progressCallback);
};

function addAssetAndUpdateBalanceSteps (data, symbol, assets) {
  return [
    {symbol}, 'addAsset',
    {func: updateBalance(data, symbol, assets).bind(this)}, 'call'
  ];
}

function getUpdateBalanceSteps (data, symbol, assets) {
  if (assets.hasOwnProperty(symbol)) {
    const asset = assets[symbol];
    if (isHyAsset(asset)) return updateHyBalancesSteps.bind(this)(data, symbol, asset);
    else if (!asset.hasOwnProperty('symbols')) return updateRegularBalanceSteps(data, symbol, asset);
    else return []; // unified assets are skipped as they are build using their sub balances
  } else return addAssetAndUpdateBalanceSteps.bind(this)(data, symbol, assets);
}

function updateUnifiedAsset (asset, assets) {
  let balance = new Decimal(0);
  asset.data.subBalances = {};
  for (let subSymbol in asset.symbols) {
    const subBalance = assets[subSymbol].data.balance;
    asset.data.subBalances[subSymbol + ':' + assets[subSymbol].data.address] = subBalance;
    if (typeof subBalance !== 'undefined' && subBalance !== 'n/a') {
      const weight = asset.symbols[subSymbol];
      const weightedSubBalance = new Decimal(subBalance).times(weight);
      balance = balance.plus(weightedSubBalance);
    }
  }
  asset.data.balance = this.form({amount: balance.toString(), factor: asset.factor});
}

// add the required sub assets to the list of assets to refresh
function determineWhichAssetsToGet (assets, symbols) {
  const assetList = {};
  for (let symbol of symbols) {
    assetList[symbol] = true;
    if (assets[symbol] && assets[symbol].hasOwnProperty('symbols')) {
      for (let subSymbol in assets[symbol].symbols) {
        if (!assetList.hasOwnProperty(subSymbol)) assetList[subSymbol] = false; // add the subSymbols but set visibility to false
      }
    }
  }
  return assetList;
}

const handleUndefinedAndUnifiedBalances = (assets, assetList, dataCallback, errorCallback, progressCallback) => function (data) {
  // Update the unified balances
  for (let symbol in assetList) {
    if (assets.hasOwnProperty(symbol)) {
      const asset = assets[symbol];
      if (asset.hasOwnProperty('symbols') && !isHyAsset(asset)) updateUnifiedAsset.bind(this)(asset, assets); // Unified Assets
    }
  }

  // replace undefineds with 'n/a' and determine which assets to return (only non sub assets)
  const returnList = [];
  for (let symbol in assetList) {
    if (assets.hasOwnProperty(symbol)) {
      if (assetList[symbol]) returnList.push(symbol); // only add visible assets to return list
      if (typeof assets[symbol].data.balance === 'undefined') assets[symbol].data.balance = 'n/a'; // if no balance is available set to n/a
    }
  }
  this.asset(returnList, dataCallback, errorCallback, progressCallback);
};

// ensure that all requested assets are added, including their subassets
const addAssets = assets => function (symbols, dataCallback, errorCallback) {
  const addAssetSteps = {};
  for (let symbol of symbols) addAssetSteps[symbol] = {data: {symbol}, step: 'addAsset'};
  return this.parallel(addAssetSteps, () => dataCallback(symbols), errorCallback);
};

// refrest all requested assets
const refreshAssets = (assets, data) => function (symbols, dataCallback, errorCallback, progressCallback) {
  const assetList = determineWhichAssetsToGet(assets, symbols);
  const cache = data.cache || 5000;
  const threshold = Date.now() - cache;
  const steps = {};
  for (let symbol in assetList) {
    const lastRefreshTime = assets.hasOwnProperty(symbol) ? assets[symbol].lastRefreshTime : null;
    if (lastRefreshTime > threshold) continue; // skip update, balance data is still fresh enough
    steps[symbol] = {data: getUpdateBalanceSteps.bind(this)(data, symbol, assets), step: 'sequential'};
  }

  return this.parallel(steps, handleUndefinedAndUnifiedBalances(assets, assetList, dataCallback, errorCallback, progressCallback).bind(this), errorCallback, progressCallback);
};
/**
 * Update the balance of a given asset (or all assets if no symbol is defined)
 * @category AssetManagement
 * @param {Object} data
 * @param {string} [data.symbol] - The symbol of the asset to be refreshed, leave undefined to refresh all assets.
 * @param {string} [data.cache=5000] - Asset will only be refreshed if data is older than this many milliseconds.
 * @example
 * hybrix.sequential([
 * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
 * {host: 'http://localhost:1111/'}, 'addHost',
 * {symbol: 'dummy'}, 'refreshAsset',
 * ]
 *   , onSuccess
 *   , onError
 *   , onProgress
 * );
 */
exports.refreshAsset = (assets, fail, hasSession) => function (data, dataCallback, errorCallback, progressCallback) {
  if (!hasSession()) return fail('No session available.', errorCallback);
  if (typeof data !== 'object' || data === null) return fail('refreshAsset: Expected data to be an object', errorCallback);

  const followUp = symbols => refreshAssets(assets, data).bind(this)(symbols, dataCallback, errorCallback, progressCallback);
  let symbols;
  if (!data.hasOwnProperty('symbol')) return followUp(Object.keys(assets));
  else if (data.symbol instanceof Array) symbols = data.symbol;
  else if (typeof data.symbol === 'string') symbols = [data.symbol];
  else return fail('refreshAsset: Expected string or array symbol property', errorCallback);

  return addAssets(assets).bind(this)(symbols, followUp, errorCallback, progressCallback);
};
