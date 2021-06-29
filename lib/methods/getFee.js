const unified = require('./rawTransaction/unified.js');

/**
   * Get the fee object of a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @param {string} [data.source] - The source address
   * @param {string} [data.target] - The target address
   * @param {string} [data.amount] - The amount to be transferred
   */
exports.getFee = (assets, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (!hasSession()) return fail('No session available.', errorCallback);
  if (typeof data === 'string') data = {symbol: data};
  if (typeof data !== 'object' || data === null) return fail('Expected data to be a string or an object', errorCallback);
  if (!data.hasOwnProperty('symbol')) return fail('Expected symbol property', errorCallback);

  this.addAsset(data, assets_ => {
    const symbol = data.symbol;
    if (typeof assets_ !== 'object' || assets_ === null || !assets_.hasOwnProperty(symbol)) return fail('Failed to retrieve balance', errorCallback);
    const asset = assets_[symbol];
    if (unified.isUnifiedAsset(asset)) return unified.getFee.bind(this)(assets, data, dataCallback, errorCallback);
    else {
      const feeObject = typeof asset.fee === 'object' && asset.fee !== null
        ? asset.fee
        : {[asset['fee-symbol'] || symbol]: asset.fee};
      dataCallback(feeObject);
    }
  }, errorCallback);
};
