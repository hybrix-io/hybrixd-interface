const Decimal = require('../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });

/**
   * Convert decimal numbers to atomic numbers
   * @param {Object} data
   * @param {string} data.amount - amount to be formatted
   * @param {string} [data.factor] - number of decimals
   * @param {string} [data.symbol] - symbol of asset, can be used to retrieve the factor
   * @example
   * hybrix.sequential([
   *   {amount:10, factor: 8}, 'attom'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );

   */
exports.atom = (fail, assets) => function (data, dataCallback, errorCallback) {
  if (!data.hasOwnProperty('amount')) {
    fail('Missing amount', errorCallback);
    return;
  }
  if (!data.hasOwnProperty('factor') && !data.hasOwnProperty('symbol')) {
    fail('Missing factor or symbol', errorCallback);
    return;
  }
  const format = factor => {
    factor = Number(factor);
    let atomicAmount;
    try {
      const amount = new Decimal(String(data.amount));
      // important: toFixed(0) rids of scientific notation, e.g. 4.41e+22
      atomicAmount = amount.times('1' + (factor > 1 ? '0'.repeat(factor) : '')).toFixed(0).toString();
    } catch (e) {
      fail(e, errorCallback);
      return;
    }
    dataCallback(atomicAmount);
  };

  if (data.hasOwnProperty('symbol')) {
    this.addAsset({symbol: data.symbol}, symbol => format(assets[symbol].factor), errorCallback);
  } else {
    format(data.factor);
  }
};
