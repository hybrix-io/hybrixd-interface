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

function addAsset (symbol, asset) {
  return {data: {symbol}, step: 'addAsset'};
}

function addHyAssetAndUpdateBalances (symbol, asset) {
  return {data: [
    {symbol}, 'addAsset',
    {query: '/a/' + symbol + '/balance/' + asset.data.address + '/full', fallback: undefined}, 'rout', // get all subBalances
    subBalances => {
      let balance = new Decimal(0);
      if (subBalances instanceof Array) {
        asset.data.subBalances = {};
        for (let subBalance of subBalances) {
          asset.data.subBalances[subBalance.symbol + ':' + subBalance.address] = subBalance.balance;
          balance.add(new Decimal(subBalance.balance));
        }
        asset.data.balance = balance.toString(); // TODO form
      }

      return asset.data.balance;
    }
  ],
  step: 'sequential'};
}

function addAssetAndUpdateBalance (symbol, asset) {
  return {data: [
    {symbol}, 'addAsset',
    {query: '/a/' + symbol + '/balance/' + asset.data.address, fallback: undefined}, 'rout',
    balance => {
      if (typeof balance !== 'undefined') asset.data.balance = balance;
      return asset.data.balance;
    }
  ],
  step: 'sequential'};
}

function updateUnifiedAsset (asset, assets) {
  let balance = new Decimal(0);
  for (let subSymbol in asset.symbols) {
    const subBalance = assets[subSymbol].data.balance;
    if (typeof subBalance !== 'undefined' && subBalance !== 'n/a') {
      const weight = asset.symbols[subSymbol];
      const weightedSubBalance = new Decimal(subBalance).times(weight);
      balance = balance.plus(weightedSubBalance);
    }
  }
  asset.data.balance = this.form({amount: balance.toString(), factor: asset.factor});
}

/**
 * Update the balance of a given asset (or all assets if no symbol is defined)
 * @category AssetManagement
 * @param {Object} data
 * @param {string} [data.symbol] - The symbol of the asset to be refreshed, leave undefined to refresh all assets.
 * @example
 * hybrix.sequential([
 * 'init',
 * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
 * {host: 'http://localhost:1111/'}, 'addHost',
 * {symbol: 'dummy'}, 'addAsset',
 * {symbol: 'dummy'}, 'refreshAsset',
 * ]
 *   , onSuccess
 *   , onError
 *   , onProgress
 * );
 */

exports.refreshAsset = assets => function (data, dataCallback, errorCallback, progressCallback) {
  // TODO handle data = string
  const steps = {};
  const assetList = {};
  if (data.hasOwnProperty('symbol')) { // use given assets
    if (data.symbol instanceof Array) {
      for (let symbol of data.symbol) {
        assetList[symbol] = true;
        if (assets[symbol] && assets[symbol].hasOwnProperty('symbols')) {
          for (let subSymbol in assets[symbol].symbols) {
            if (!assetList.hasOwnProperty(subSymbol)) {
              assetList[subSymbol] = false; // add the subSymbols but set visibility to false
            }
          }
        }
      }
    } else if (assets[data.symbol] && assets[data.symbol].hasOwnProperty('symbols')) {
      assetList[data.symbol] = true; // add the unified symbol
      for (let subSymbol in assets[data.symbol].symbols) {
        if (!assetList.hasOwnProperty(subSymbol)) {
          assetList[subSymbol] = false; // add the subSymbols but set visibility to false
        }
      }
    } else if (typeof data.symbol === 'string') {
      assetList[data.symbol] = true; // use the provided symbol
    } else {
      // TODO error
    }
  } else { // use all assets
    for (let symbol in assets) assetList[symbol] = true;
  }

  // Update the regular balances
  for (let symbol in assetList) {
    if (assets.hasOwnProperty(symbol)) {
      const asset = assets[symbol];
      if (isHyAsset(asset)) {
        steps[symbol] = addHyAssetAndUpdateBalances(symbol, asset);
      } else if (!asset.hasOwnProperty('symbols')) {
        steps[symbol] = addAssetAndUpdateBalance(symbol, asset);
      } else if (!assets.hasOwnProperty(symbol)) {
        steps[symbol] = addAsset(symbol);
      }
    }
  }

  const handleUndefineds = data => {
    // Update the unified balances
    for (let symbol in assetList) {
      if (assets.hasOwnProperty(symbol)) {
        const asset = assets[symbol];
        if (asset.hasOwnProperty('symbols') && !isHyAsset(asset)) {
          updateUnifiedAsset.bind(this)(asset, assets);
        }
      }
    }

    const returnList = [];
    for (let symbol in assetList) {
      if (assets.hasOwnProperty(symbol)) {
        if (assetList[symbol]) { returnList.push(symbol); } // only add visible assets to return list
        if (typeof assets[symbol].data.balance === 'undefined') { // if no balance is available set to n/a
          assets[symbol].data.balance = 'n/a';
        }
      }
    }
    this.asset(returnList, dataCallback, errorCallback, progressCallback);
  };
  this.parallel(steps, handleUndefineds, errorCallback, progressCallback);
};
