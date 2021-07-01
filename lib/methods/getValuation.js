const Decimal = require('../../common/crypto/decimal-light');
Decimal.set({ precision: 64 });
const DEFAULT_VALUATION_CACHETIME = 5 * 60 * 1000;
const rates = {}; // {[fromSymbol] : {[toSymbol]:{rate,timestamp}}
/**
   * Get the balance of a specific asset for current session.
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.fromSymbol - The asset symbol.
   * @param {string} data.toSymbol - The asset symbol.
   * @param {string} [data.amount=balance] - Get valuation for amount
   * @param {string} [data.cacheTime] - Cachetime in ms
   * @param {string} [data.channel] - Indicate the channel 'y' for encryption, 'z' for both encryption and compression.
   * @param {string} [data.host] - Select a specific host, if omitted one will be chosen at random.
   * @example
   * hybrix.getValuation({fromSymbol: 'btc', toSymbol:'eth', amount:12}
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getValuation = (assets, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('fromSymbol')) return fail('Expected fromSymbol property', errorCallback);
  if (!data.hasOwnProperty('toSymbol')) return fail('Expected toSymbol property', errorCallback);
  const fromSymbol = data.fromSymbol;
  const toSymbol = data.toSymbol;
  if (!data.hasOwnProperty('amount')) {
    if (!hasSession()) return fail('No session available.', errorCallback);
    return this.getBalance({symbol: fromSymbol},
      balance => this.getValuation({fromSymbol, toSymbol, amount: balance}, dataCallback, errorCallback),
      errorCallback
    );
  } else if (rates.hasOwnProperty(fromSymbol) &&
    rates[fromSymbol].hasOwnProperty(toSymbol) &&
    rates[fromSymbol][toSymbol].timestamp < Date.now() + (data.hasOwnProperty('cacheTime') ? data.cacheTime : DEFAULT_VALUATION_CACHETIME)
  ) {
    return dataCallback(rates[fromSymbol][toSymbol].rate * data.amount);
  } else { // retrieve valuation
    return this.rout({query: `/e/valuations/rate/${fromSymbol}/${toSymbol}`, host: data.host, channel: data.channel},
      rate => {
        const timestamp = Date.now();
        if (!rates.hasOwnProperty('fromSymbol')) rates[fromSymbol] = {};
        if (!rates.hasOwnProperty('toSymbol')) rates[toSymbol] = {};
        rates[fromSymbol][toSymbol] = {rate, timestamp};
        rates[toSymbol][fromSymbol] = {rate: 1 / rate, timestamp};
        return dataCallback(rate * data.amount);
      },
      errorCallback);
  }
};
