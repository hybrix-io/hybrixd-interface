function hasProperties (object) {
  if (typeof object !== 'object' || object === null) return false;
  const propertyNames = [].slice.call(arguments);
  propertyNames.shift(); // drop object parameter
  return propertyNames.reduce((hasAllProperties, propertyName) => object.hasOwnProperty(propertyName) && hasAllProperties, true);
}

function test (test) {
  return hasProperties(test);
}

function fee (details) {
  return details.fee &&
    (typeof details.fee === 'string' || typeof details.fee === 'number' || // FIXME remove after multi asset fees have been implemented
    (typeof details.fee === 'object' && details.fee !== null) // TODO extend with more checks. All properties should be string number values
    );
}

function details (details) {
  return hasProperties(details, 'symbol', 'name', 'factor', 'contract', 'mode', 'keygen-base') && fee(details);
}

function valid (valid) {
  return typeof valid === 'string' && valid.startsWith('valid');
}

function balance (balance, details, test) {
  if (details.hasOwnProperty('factor')) {
    const factor = Number(details.factor);
    // TODO /\d+.\d{factor}
    return typeof balance === 'string' &&
      ((balance.toString().indexOf('.') !== -1 && balance.split('.')[1].length === factor) ||
       (factor === 0 && balance.length === factor))
    ;
  } else {
    return false;
  }
}

function unspent (unspent) {
  return typeof unspent !== 'undefined' && unspent !== null && !(typeof unspent === 'string' && unspent.startsWith('ERROR'));
}

function history (history) {
  return history instanceof Array;// TODO array of strings
}

function sample (sample) {
  return hasProperties(sample, 'address', 'transaction');
}

function transaction (transaction) {
  return hasProperties(transaction, 'id', 'timestamp', 'amount', 'symbol', 'source', 'target') && fee(transaction);
}

function sign (sign) {
  return typeof sign === 'string' && !sign.startsWith('ERROR');
}

function signHash (signHash, details, test, symbolResult) {
  if (typeof symbolResult.seedSign !== 'string' || symbolResult.seedSign.startsWith('ERROR')) return false;
  if (test.hasOwnProperty('hash')) {
    const testHash = test.hash;
    return signHash === testHash || (testHash === 'dynamic' && signHash !== '00000000');
  } else {
    return false;
  }
}

exports.test = test;
exports.sample = sample;
exports.details = details;

exports.sampleValid = valid;
exports.sampleBalance = balance;
exports.sampleUnspent = unspent;
exports.sampleHistory = history;
exports.sampleTransaction = transaction;
exports.seedValid = valid;
exports.seedBalance = balance;
exports.seedUnspent = unspent;
exports.seedSign = sign;
exports.seedSignHash = signHash;
