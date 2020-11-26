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
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);

  if (!data.hasOwnProperty('amount')) return fail('Missing amount', errorCallback);
  if (!data.hasOwnProperty('factor') && !data.hasOwnProperty('symbol')) return fail('Missing factor or symbol', errorCallback);

  const format = factor => {
    factor = Number(factor);
    let atomicAmount;
    try {
      const amount = new Decimal(String(data.amount));
      // important: toFixed(0) rids of scientific notation, e.g. 4.41e+22
      atomicAmount = amount.times('1' + (factor > 1 ? '0'.repeat(factor) : '')).toFixed(0).toString();
    } catch (e) {
      return fail(e, errorCallback);
    }
    return dataCallback(atomicAmount);
  };

  if (data.hasOwnProperty('symbol')) {
    return this.addAsset({symbol: data.symbol}, symbol => format(assets[symbol].factor), errorCallback);
  } else {
    return format(data.factor);
  }
};
