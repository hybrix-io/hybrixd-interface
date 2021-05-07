// TODO add parameter descriptions
/**
   * Format a number according to its factor
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.amount - the amount to format
   * @param {string} data.factor - the number of decimals
   * @example
   * hybrix.sequential([
   *   {data:'123.0', factor: 4}, 'form' // returns '123.0000'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.form = fail => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  if (!data.hasOwnProperty('amount')) return fail('Missing amount', errorCallback);

  if (!data.hasOwnProperty('factor')) return fail('Missing factor', errorCallback);

  const factor = Number(data.factor);

  if (isNaN(factor)) return fail('Expected factor to be a number, got:' + data.factor, errorCallback);

  const amount = String(data.amount); // 123.456 -> "123.456"
  const frac = amount.split('.')[1]; //  "123.456" -> "123","456"
  let formedAmount;
  if (typeof frac === 'undefined') {
    formedAmount = amount + '.' + '0'.repeat(factor); // "123" -> ["123",undefined] ->  "123"+"."+"0000"
  } else if (frac.length >= factor) {
    formedAmount = amount.substr(0, amount.length - (frac.length - factor)); // "123.4567" -> ["123","4567"] ->  "123.45"
  } else {
    formedAmount = amount + '0'.repeat(factor - frac.length); // "123.4" -> ["123","4"] ->  "123.4"+"000"
  }

  if (typeof dataCallback !== 'function') return formedAmount; // direct return used by other methods
  else return dataCallback(formedAmount);
};
