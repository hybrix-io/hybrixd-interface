const render = require('./render.js');
const renderLib = require('./render.js');

const DEFAULT_TEST_SYMBOLS = require('./../../util/defaultSymbols').DEFAULT_TEST_SYMBOLS;

function sanitizeResult (result) {
  const props = ['sample', 'details', 'test'];
  result = typeof result === 'undefined' ? {} : result;

  props.forEach(prop => { if (typeof result[prop] === 'undefined') result[prop] = {}; });

  return result;
}

function testAsset (symbol) {
  return { data: [
    {query: '/asset/' + symbol + '/test-hosts'}, 'rout'
  ],
  step: 'sequential'
  };
}

const validate = symbols => resultsPerSymbol => {
  const assets = {};
  let total = 0;
  let failures = 0;

  for (let symbol in resultsPerSymbol) {
    assets[symbol] = {};
    const resultsPerHost = resultsPerSymbol[symbol];

    if (symbols.includes(symbol) && typeof resultsPerHost === 'object' && resultsPerHost !== null) {
      for (let host in resultsPerHost) {
        const result = resultsPerHost[host];

        const isValid = result === 'Success';

        if (!isValid) ++failures;
        assets[symbol][host] = {valid: isValid, result, messages: ['TODO']};
        ++total;
      }
    } else {
      assets[symbol]['unknown'] = {valid: false, result: null, messages: ['Asset not available']};
      ++total;
      ++failures;
    }
  }

  const data = {assets: {}, total, failures};
  Object.keys(assets).sort().forEach((key) => {
    data.assets[key] = assets[key];
  });
  return data;
};

function runTests (symbols, hybrix, host, dataCallback, progressCallback) {
  if (symbols && symbols !== '*') symbols = symbols.split(',');
  else symbols = DEFAULT_TEST_SYMBOLS;

  const tests = {};
  for (let symbol of symbols) tests[symbol] = testAsset(symbol);

  hybrix.sequential(
    [
      'init',
      {host}, 'addHost',
      tests,
      'parallel',
      validate(symbols)
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
