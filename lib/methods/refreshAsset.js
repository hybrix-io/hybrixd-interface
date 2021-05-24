const Decimal = require('../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });

let isHyAsset;
try {
  isHyAsset = require('./rawTransaction/hyProtocol/hyProtocol.js').isHyAsset;
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') isHyAsset = () => false;
  else throw e;
}

function updateFuelSufficiency (symbol, baseSymbol, baseBalance, assets) {
  const asset = assets[symbol];
  if (asset.hasOwnProperty('symbols') && !isHyAsset(symbol)) { // unified
    for (const subSymbol in asset.symbols) { // first pass to set fuelSufficiency to subAssets
      updateFuelSufficiency(subSymbol, baseSymbol, baseBalance, assets);
    }
    let sufficientFuel = false;
    for (const subSymbol in asset.symbols) { // second pass to determine overall fuelSufficiency
      const subSufficientFuel = assets[subSymbol].data.sufficientFuel;
      asset.data.subSufficientFuels[subSymbol] = subSufficientFuel;
      if (subSufficientFuel) sufficientFuel = true;
    }
    asset.data.sufficientFuel = sufficientFuel;
  } else if (asset['fee-symbol'] === baseSymbol) { // regular or hy asset that pays fees in baseSymbol
    const fee = new Decimal(asset.fee); // TODO multi fee
    asset.data.sufficientFuel = fee.gt(baseBalance);
  }
}

// check with other assets have symbol as fee-symbol and update fuel sufficiency accordingly
function updateFuelSufficiencies (baseSymbol, baseBalance, assets) {
  for (const symbol in assets) {
    updateFuelSufficiency(symbol, baseSymbol, baseBalance, assets);
  }
}

function updateHyBalancesSteps (data, symbol, asset, assets) {
  return [
    {query: '/a/' + symbol + '/subbalances/' + asset.data.address, fallback: undefined, channel: data.channel}, 'rout', // get all subBalances
    subBalances => {
      if (subBalances instanceof Array) {
        let balance = new Decimal(0);
        asset.data.subBalances = resetObject(asset.data.subBalances);
        for (const subBalance of subBalances) {
          asset.data.subBalances[subBalance.symbol + ':' + subBalance.address] = subBalance.balance;
          asset.data.lastRefreshTime = Date.now();
          balance = balance.add(new Decimal(subBalance.balance));
        }
        const formedBalance = this.form({amount: balance.toString(), factor: asset.factor});
        asset.data.balance = formedBalance;
        updateFuelSufficiencies(symbol, formedBalance, assets);
      }
      return asset.data.balance;
    }
  ];
}

// if not object return {} else delete all values, keeping the reference intact
function resetObject (object) {
  if (typeof object !== 'object' || object === null) return {};
  for (const key in object) delete object[key];
  return object;
}

function updateRegularBalanceSteps (data, symbol, asset, assets) {
  return [
    {query: '/a/' + symbol + '/balance/' + asset.data.address, fallback: undefined, channel: data.channel}, 'rout',
    balance => {
      if (typeof balance !== 'undefined') {
        asset.data.balance = balance;
        asset.data.lastRefreshTime = Date.now();
        asset.data.subBalances = resetObject(asset.data.subBalances);
        asset.data.subBalances[symbol + ':' + asset.data.address] = balance;
        updateFuelSufficiencies(symbol, balance, assets);
      }
      return asset.data.balance;
    }
  ];
}

const updateBalance = (data, symbol, assets) => function (xdata, dataCallback, errorCallback, progressCallback) {
  return assets.hasOwnProperty(symbol)
    ? this.sequential(getUpdateBalanceSteps(data, symbol, assets), dataCallback, errorCallback, progressCallback)
    : errorCallback(`Asset ${symbol} could not be added.`);
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
    if (isHyAsset(asset)) return updateHyBalancesSteps.bind(this)(data, symbol, asset, assets);
    else if (!asset.hasOwnProperty('symbols')) return updateRegularBalanceSteps(data, symbol, asset, assets);
    else return []; // unified assets are skipped as they are build using their sub balances
  } else return addAssetAndUpdateBalanceSteps.bind(this)(data, symbol, assets);
}

function updateUnifiedAsset (asset, assets) {
  let balance = new Decimal(0);
  asset.data.subBalances = resetObject(asset.data.subBalances);

  for (const subSymbol in asset.symbols) {
    const subAsset = assets[subSymbol];
    const subBalance = subAsset.data.balance;
    asset.data.subBalances[subSymbol + ':' + subAsset.data.address] = subBalance;
    if (typeof subBalance !== 'undefined' && subBalance !== 'n/a') {
      const weight = asset.symbols[subSymbol];
      const weightedSubBalance = new Decimal(subBalance).times(weight);
      balance = balance.plus(weightedSubBalance);
    }
  }
  const formedBalance = this.form({amount: balance.toString(), factor: asset.factor});
  updateFuelSufficiencies(asset.symbol, formedBalance, assets);
  asset.data.balance = formedBalance;
}

// add the required sub assets to the list of assets to refresh
function determineWhichAssetsToGet (assets, symbols) {
  const assetList = {};
  for (const symbol of symbols) {
    assetList[symbol] = true;
    if (assets[symbol] && assets[symbol].hasOwnProperty('symbols')) {
      for (const subSymbol in assets[symbol].symbols) {
        if (!assetList.hasOwnProperty(subSymbol)) assetList[subSymbol] = false; // add the subSymbols but set visibility to false
      }
    }
  }
  return assetList;
}

// Update the unified balances
const handleUndefinedAndUnifiedBalances = (assets, assetList, dataCallback, errorCallback, progressCallback) => function (data) {
  for (const symbol in assetList) {
    if (assets.hasOwnProperty(symbol)) {
      const asset = assets[symbol];
      if (asset.hasOwnProperty('symbols') && !isHyAsset(asset)) updateUnifiedAsset.bind(this)(asset, assets); // Unified Assets
    }
  }

  // replace undefineds with 'n/a' and determine which assets to return (only non sub assets)
  const returnList = [];
  for (const symbol in assetList) {
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
  for (const symbol of symbols) addAssetSteps[symbol] = {data: {symbol}, step: 'addAsset'};
  return this.parallel(addAssetSteps, () => dataCallback(symbols), errorCallback);
};

// refrest all requested assets
const refreshAssets = (assets, data) => function (symbols, dataCallback, errorCallback, progressCallback) {
  const assetList = determineWhichAssetsToGet(assets, symbols);
  const cache = data.cache || 5000;
  const threshold = Date.now() - cache;
  const steps = {};
  for (const symbol in assetList) {
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
 * @param {string} [includeBaseAssets=false] - Include the base assets. (The main chain for tokens)
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
  const symbols = [];
  if (!data.hasOwnProperty('symbol')) return followUp(Object.keys(assets)); // refresh all assets
  else if (data.symbol instanceof Array) symbols.push(...data.symbol);
  else if (typeof data.symbol === 'string') symbols.push(data.symbol);
  else return fail('refreshAsset: Expected string or array symbol property', errorCallback);
  for (const symbol of symbols) {
    if (assets.hasOwnProperty(symbol)) {
      const feeSymbol = assets[symbol]['fee-symbol'];
      if (feeSymbol !== symbol && !symbols.includes(feeSymbol)) symbols.push(feeSymbol); // add base asset
    }
  }
  return addAssets(assets).bind(this)(symbols, followUp, errorCallback, progressCallback);
};
