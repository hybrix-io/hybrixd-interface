// TODO add example
// TODO check returns
// TODO add parameter descriptions
/**
   * Format a number according to its factor
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.amount -
   * @param {string} data.factor -
   */
exports.form = fail => function (data, dataCallback, errorCallback) {
  if (!data.hasOwnProperty('amount')) {
    fail('Missing amount', errorCallback);
    return;
  }

  if (!data.hasOwnProperty('factor')) {
    fail('Missing factor', errorCallback);
    return;
  }

  const factor = Number(data.factor);

  if (isNaN(factor)) {
    fail('Expected factor to be a number, got:' + data.factor, errorCallback);
    return;
  }

  const amount = String(data.amount);
  const frac = amount.split('.')[1]; //  "123.456" -> "123","456"
  let formedAmount;
  if (typeof frac === 'undefined') { //  "123" -> ["123",undefined] ->  "123"+"."+"0000"
    formedAmount = amount + '.' + '0'.repeat(factor);
  } else {
    formedAmount = amount + '0'.repeat(factor - frac.length);
  }

  if (typeof dataCallback === 'undefined') {
    return formedAmount;
  } else {
    dataCallback(formedAmount);
  }
};
