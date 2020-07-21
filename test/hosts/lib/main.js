const render = require('./render.js');
const renderLib = require('./render.js');
const DEFAULT_AMOUNT = 0.00001;
const NON_HOST_ASSETS = ["dummy", "mock.btc"];
const DEFAULT_TEST_SYMBOLS = require('./../../util/defaultSymbols')
  .DEFAULT_TEST_SYMBOLS
  .filter(x => !NON_HOST_ASSETS.includes(x));

function sanitizeResult (result) {
  const props = ['sample', 'details', 'test'];
  result = typeof result === 'undefined' ? {} : result;

  props.forEach(prop => { if (typeof result[prop] === 'undefined') result[prop] = {}; });

  return result;
}

function testAsset (symbol) {
  return { data: [
    {symbol: symbol}, 'addAsset',
    {
      _options: {passErrors: true},
      hosts: {data: {query: '/asset/' + symbol + '/test-hosts'}, step: 'rout'}
    },
    'parallel',
    result => {
      const tests = Object.keys(result.hosts).map(host => ({[host]: result.hosts[host]}));

      return {
        ...tests
      };
    }
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

        for (let type_ in result) {
          const isValid = result[type_] === "Success"

          let known;

          if (!isValid) {
            known = knownIssues ? knownIssues[symbol + '_' + testId] : undefined;
            if (!known) ++failures;
          }

          assets[symbol][testId] = {valid: isValid, known, result, messages: ['TODO']};

          ++total;
        }
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

const testCases = result => {
  result = sanitizeResult(result);
  return {
    testHosts: {data: result.testHosts, step: 'id'}
  };
};

const testIds = Object.keys(testCases({}));

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
      'init',
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
