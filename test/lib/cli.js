const main = require('./main.js');
const stdio = require('stdio');
const fs = require('fs');
const progress = require('./../util/progressbar');
const render = require('./../util/render');

let host = 'http://localhost:1111/';
let path = '../../dist/';

// command line options and init
const ops = stdio.getopt({
  'symbol': {key: 's', args: 1, description: 'Select a symbol or comma separated symbols to run test'},
  'debug': {key: 'd', args: 0, description: 'Output debug messages.'},
  'host': {key: 'h', args: 1, description: 'Set host Defaults to :' + host},
  'path': {key: 'p', args: 1, description: 'Set path for interface files Defaults to :' + path},
  'verbose': {key: 'v', args: 0, description: 'Output verbose progress'},
  'quiet': {key: 'q', args: 0, description: 'No extra output other than raw data'},
  'xml': {key: 'x', args: 1, description: 'Write xml test results to file'},
  'json': {key: 'j', args: 1, description: 'Write json test results to file'},
  'testhost': {key: 't', args: 0, description: 'Switch between asset and host test. Defaults to asset'}
});

if (typeof ops.host !== 'undefined') { host = ops.host; }
const symbolsToTest = ops.symbol;
if (ops.path) { path = ops.path; }

const Hybrix = require(path + '/hybrix-lib.nodejs.js');
const hybrix = new Hybrix.Interface({http: require('http'), https: require('https')});

DEBUG = ops.debug;

const test = main;

const renderTable = data => {
  if (ops.xml) {
    fs.writeFileSync(ops.xml, render.xml(test.renderSymbol)(data));
  }
  if (ops.json) {
    fs.writeFileSync(ops.json, render.json(data));
  }
  console.log(test.cli(data));
};

const errorCallback = error => {
  console.error(`[!] Error:`, error);
};

test.runTests(symbolsToTest, hybrix, host, renderTable, errorCallback, progress.progressCallback(ops.quiet, ops.verbose));
