const regular = require('./rawTransaction/regular.js');
const unified = require('./rawTransaction/unified.js');

let hyProtocol;
try {
  hyProtocol = require('./rawTransaction/hyProtocol/hyProtocol.js');
} catch (e) {
  if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
    hyProtocol = null;
  } else {
    throw e;
  }
}

const assetHasBeenAdded = (assets, data, dataCallback, errorCallback, progressCallback) => function () {
  const asset = assets[data.symbol];
  if (hyProtocol && hyProtocol.isHyAsset(asset)) {
    hyProtocol.validateConstructAndSignRawTransaction.call(this, asset, assets, data, dataCallback, errorCallback, progressCallback);
  } else if (unified.isUnifiedAsset(asset)) {
    unified.validateConstructAndSignRawTransaction.call(this, asset, assets, data, dataCallback, errorCallback, progressCallback);
  } else {
    regular.validateConstructAndSignRawTransaction.call(this, asset, data, dataCallback, errorCallback, progressCallback);
  }
};

/**
   * Creates a raw transaction that is signed but not yet pushed to the network. Required assets and inputs are collected accordingly.
   * @category Transaction
   * @param {Object} data
   * @param {String} data.symbol - The symbol of the asset
   * @param {String} data.target - The target address
   * @param {Number} data.amount - The amount that should be transferred
   * @param {Boolean} [data.validate=true] - Validate target address and available funds.
   * @param {String} [data.message] - Option to add data (message, attachment, op return) to a transaction.
   * @param {Object} [data.unspent] - Manually set the unspent data
   * @param {String} [data.source=address] - Provide optional (partial) source address.
   * @param {String} [data.comparisonSymbol=hy] - Provide symbol to compare fees for multi transactions
   * @param {Number} [data.fee] - The fee.
   * @param {Number} [data.time] - Provide an explicit time timestamp.
   * @param {String} [data.host] - The host that should be used.
   * @param {String} [data.channel]  - Indicate the channel 'y' for encryption, 'z' for both encryption and compression
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy', target: '_dummyaddress_', amount:1}, 'rawTransaction',
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.rawTransaction = (assets, fail) => function (data, dataCallback, errorCallback, progressCallback) {
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('target')) return fail('Expected \'target\' property.', errorCallback);
  if (!data.hasOwnProperty('symbol')) return fail('Expected \'symbol\' property.', errorCallback);
  if (!data.hasOwnProperty('amount')) return fail('Expected \'amount\' property.', errorCallback);
  if (isNaN(data.amount) || data.amount < 0) return fail('Expected \'amount\' to be non negative number.', errorCallback);

  const followUpCallback = assetHasBeenAdded(assets, data, dataCallback, errorCallback, progressCallback).bind(this);
  return this.addAsset({symbol: data.symbol, channel: data.channel, host: data.host}, followUpCallback, errorCallback);
};
