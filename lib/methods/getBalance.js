const Decimal = require('../../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });

/**
   * Get the balance of a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The asset symbol.
   * @param {string} [data.available=false] - Only return available balance (minus the required fees)
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy'}, 'getBalance'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getBalance = (assets, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (!hasSession()) return fail('No session available.', errorCallback);
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('symbol')) return fail('Expected symbol property', errorCallback);

  this.refreshAsset(data, asset => {
    const symbol = data.symbol;
    if (typeof asset !== 'object' || asset === null || !asset.hasOwnProperty(symbol)) return fail('Failed to retrieve balance', errorCallback);
    const balance = asset[symbol].balance;
    if (data.available === true) { // TODO upgrade to unified asset transction details method
      const fee = assets[symbol].fee || 0;
      const availableBalance = (new Decimal(balance)).minus(fee).toString();
      return dataCallback(availableBalance);
    } else return dataCallback(balance);
  }, errorCallback);
};
