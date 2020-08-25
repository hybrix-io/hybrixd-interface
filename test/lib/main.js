const Decimal = require('../../common/crypto/decimal-light');

const render = require('./render.js');
const renderLib = require('../util/render');
const valid = require('./valid.js');
const DEFAULT_ATOMIC_AMOUNT = 1000;
const DEFAULT_TEST_SYMBOLS = require('./../util/defaultSymbols').DEFAULT_TEST_SYMBOLS;

function fromAtomic (x, factor) {
  const decX = new Decimal(x);
  return decX.div(new Decimal(10).pow(factor)).toFixed();
}

function sanitizeResult (result) {
  const props = ['sample', 'details', 'test'];
  result = typeof result === 'undefined' ? {} : result;

  props.forEach(prop => { if (typeof result[prop] === 'undefined') result[prop] = {}; });

  return result;
}

const testCases = result => {
  result = sanitizeResult(result);
  return {
    test: {data: result.test, step: 'id'},
    sample: {data: result.sample, step: 'id'},
    details: {data: result.details, step: 'id'},
    sampleValid: {data: result.sampleValid, step: 'id'},
    sampleBalance: {data: result.sampleBalance, step: 'id'},
    sampleUnspent: {data: result.sampleUnspent, step: 'id'},
    sampleHistory: {data: result.sampleHistory, step: 'id'},
    sampleTransaction: {data: result.sampleTransaction, step: 'id'},

    seedValid: {data: result.seedValid, step: 'id'},
    seedBalance: {data: result.seedBalance, step: 'id'},
    seedUnspent: {data: result.seedUnspent, step: 'id'},
    seedSign: {data: result.seedSign, step: 'id'},
    seedSignHash: {data: {data: result.seedSign}, step: 'hash'}
    // seedHistory: {data: result.seedHistory, step: 'id'},
  };
};

const testIds = Object.keys(testCases({}));

function getFeeForUnspents (nonAtomicAmount, feeAmount, details) {
  if (typeof nonAtomicAmount !== 'string' && typeof nonAtomicAmount !== 'number') return NaN;
  if ((typeof feeAmount === 'string' && /^(\d|\.)+$/.test(feeAmount)) || typeof feeAmount === 'number') {
    return details['fee-symbol'] === details.symbol
      ? new Decimal(nonAtomicAmount).add(new Decimal(feeAmount)).toFixed()
      : nonAtomicAmount;
  } else if (typeof feeAmount === 'object' && feeAmount !== null) {
    return feeAmount.hasOwnProperty(details.symbol)
      ? new Decimal(nonAtomicAmount).add(new Decimal(feeAmount[details.symbol])).toFixed()
      : nonAtomicAmount;
  } else {
    return NaN;
  }
}
function testAsset (symbol) {
  return { data: [
    {symbol: symbol}, 'addAsset',
    {
      _options: {passErrors: true},
      sample: {data: {query: '/asset/' + symbol + '/sample'}, step: 'rout'},
      test: {data: {query: '/asset/' + symbol + '/test'}, step: 'rout'},
      details: {data: {query: '/asset/' + symbol + '/details'}, step: 'rout'},
      address: {data: {symbol: symbol}, step: 'getAddress'},
      publicKey: {data: {symbol: symbol}, step: 'getPublicKey'}
    },
    'parallel',
    result => {
      result = sanitizeResult(result);
      const amount = result.test.amount || fromAtomic(DEFAULT_ATOMIC_AMOUNT, result.details.factor);
      return {
        _options: {passErrors: true},
        sample: {data: result.sample, step: 'id'},
        test: {data: result.test, step: 'id'},
        details: {data: result.details, step: 'id'},
        address: {data: result.address, step: 'id'},

        sampleValid: {data: {query: '/asset/' + symbol + '/validate/' + result.sample.address}, step: 'rout'},
        sampleBalance: {data: {query: '/asset/' + symbol + '/balance/' + result.sample.address}, step: 'rout'},
        sampleUnspent: {data: {query: '/asset/' + symbol + '/unspent/' + result.sample.address + '/' + (getFeeForUnspents(amount, result.details.fee, result.details)) + '/' + result.address + '/' + result.sample.publicKey}, step: 'rout'},
        sampleHistory: {data: {query: '/asset/' + symbol + '/history/' + result.sample.address}, step: 'rout'},
        sampleTransaction: {data: {query: '/asset/' + symbol + '/transaction/' + result.sample.transaction}, step: 'rout'},

        seedValid: {data: {query: '/asset/' + symbol + '/validate/' + result.address}, step: 'rout'},
        seedBalance: {data: {query: '/asset/' + symbol + '/balance/' + result.address}, step: 'rout'},
        seedUnspent: {data: {query: '/asset/' + symbol + '/unspent/' + result.address + '/' + (getFeeForUnspents(amount, result.details.fee, result.details)) + '/' + result.sample.address + '/' + result.publicKey}, step: 'rout'}
        // seedHistory: {data: {query: '/asset/' + symbol + '/history/' + result.address}, step: 'rout'}
      };
    },
    'parallel',
    result => {
      result = sanitizeResult(result);
      const amount = result.test.amount || fromAtomic(DEFAULT_ATOMIC_AMOUNT, result.details.factor);
      return {
        _options: {passErrors: true},
        test: {data: result.test, step: 'id'},
        sample: {data: result.sample, step: 'id'},
        details: {data: result.details, step: 'id'},
        sampleValid: {data: result.sampleValid + ' ' + result.sample.address, step: 'id'},
        sampleBalance: {data: result.sampleBalance, step: 'id'},
        sampleUnspent: {data: result.sampleUnspent, step: 'id'},
        sampleHistory: {data: result.sampleHistory, step: 'id'},
        sampleTransaction: {data: result.sampleTransaction, step: 'id'},

        seedValid: {data: result.seedValid + ' ' + result.address, step: 'id'},
        seedBalance: {data: result.seedBalance, step: 'id'},
        seedUnspent: {data: result.seedUnspent, step: 'id'},
        seedSign: {data: {symbol: symbol, amount: amount, target: result.sample.address, validate: false, unspent: result.test.hasOwnProperty('unspent') ? result.test.unspent : result.seedUnspent, time: result.test.time}, step: 'rawTransaction'}
        // seedHistory: {data: result.seedHistory, step: 'id'},
      };
    },
    'parallel',
    testCases,
    'parallel'
  ],
  step: 'sequential'
  };
}

const validate = (symbols, knownIssues) => results => {
  const assets = {};
  let total = 0;
  let failures = 0;
  for (let symbol in results) {
    assets[symbol] = {};
    const symbolResult = results[symbol];
    if (symbols.includes(symbol) && typeof symbolResult !== 'undefined') {
      const details = symbolResult.details || {};
      const test = symbolResult.test || {};

      for (let testId in symbolResult) {
        const result = symbolResult[testId];
        if (valid.hasOwnProperty(testId)) {
          const isValid = valid[testId](result, details, test);
          let known;
          if (!isValid) {
            if (!known) ++failures;
          }
          assets[symbol][testId] = {valid: isValid, known, result, messages: ['TODO']};
        } else {
          const known = knownIssues ? knownIssues[symbol + '_' + testId] : undefined;
          assets[symbol][testId] = {valid: false, known, result, messages: ['No validation available']};
          ++failures;
        }
        ++total;
      }
    } else {
      for (let testId of testIds) {
        const known = knownIssues ? knownIssues[symbol + '_' + testId] : undefined;
        assets[symbol][testId] = {valid: false, known, result: null, messages: ['Asset not available']};
        ++total;
        ++failures;
      }
    }
  }

  const data = {assets: {}, total, failures};
  Object.keys(assets).sort().forEach((key) => {
    data.assets[key] = assets[key];
  });
  return data;
};

function runTests (symbols, hybrix, host, dataCallback, progressCallback, knownIssues) {
  const tests = {};
  if (symbols && symbols !== '*') {
    symbols = symbols.split(',');
  } else {
    symbols = DEFAULT_TEST_SYMBOLS;
  }
  for (let symbol of symbols) {
    tests[symbol] = testAsset(symbol);
  }

  hybrix.sequential(
    [
      {username: 'POMEW4B5XACN3ZCX', password: 'TVZS7LODA5CSGP6U'}, 'session',
      {host: host}, 'addHost',
      tests,
      'parallel',
      validate(symbols, knownIssues)
    ]
    , dataCallback
    , error => { console.error(error); }
    , progressCallback
  );
}

exports.runTests = runTests;
exports.web = render.web;
exports.cli = render.cli;
exports.xml = renderLib.xml;
exports.renderSymbol = render.renderSymbol;
