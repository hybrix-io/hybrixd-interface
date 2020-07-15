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
   * @param {string} data.symbol - The symbol of the asset
   * @param {string} data.target - The target address
   * @param {Number} data.amount - The amount that should be transferred
   * @param {Number} [data.validate=true] - Validate target address and available funds.
   * @param {Number} [data.message] - Option to add data (message, attachment, op return) to a transaction.
   * @param {Number} [data.unspent] - Manually set the unspent data
   * @param {Number} [data.fee]  - The fee.
   * @param {Number} [data.time]  - Provide an explicit time timestamp.
   * @param {string} [data.host] - The host that should be used.
   * @param {string} [data.channel]  - Indicate the channel 'y' for encryption, 'z' for both encryption and compression
   * @example
   * hybrix.sequential([
   * 'init',
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy', target: '_dummyaddress_', amount:1}, 'rawTransaction',
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.rawTransaction = assets => function (data, dataCallback, errorCallback, progressCallback) {
  const followUpCallback = assetHasBeenAdded(assets, data, dataCallback, errorCallback, progressCallback).bind(this);
  this.addAsset({symbol: data.symbol, channel: data.channel, host: data.host}, followUpCallback, errorCallback);
};
