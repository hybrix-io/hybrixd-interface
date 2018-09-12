nacl_factory = require('../common/crypto/nacl.js');

var Hybridd = require('..dist/hybridd.interface.nodejs.js');
var hybridd = new Hybridd.Interface({http: require('http')});

var hostname = 'http://wallet-uat.internetofcoins.org/api/';

// command line options and init
var stdio = require('stdio');
var ops = stdio.getopt({
  'userid': {key: 'u', args: 1, description: 'Set username'},
  'passwd': {key: 'p', args: 1, description: 'Set password'},
  'newaccount': {key: 'n', description: 'Generate new wallet'},
  'sendtransaction': {key: 't', args: 3, description: 'Send transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'addasset': {key: 'a', args: 1, description: 'Add asset to wallet [argument: symbol]'},
  'addassets': {key: 'A', args: 1, description: 'Add assets to wallet [argument: symbol1,symbol2,symbol3]'},
  'getaddress': {key: 'g', args: 1, description: 'Add asset to wallet [argument: symbol]'},
  'pubkey': {key: 'P', args: 1, description: 'Get public key from wallet [argument: symbol]'},
  'privkey': {key: 'S', args: 1, description: 'Get private key from wallet [argument: symbol]'},
  'keypair': {key: 'K', args: 1, description: 'Get public and private key from wallet [argument: symbol]'},
  'rawtransaction': {key: 'r', args: 3, description: 'Create a raw transaction [argument: symbol] [argument: amount] [argument: target_address]'},
  'string': {key: 'e', args: 0, description: 'Make escaped string output for rawtransaction'},
  'quiet': {key: 'q', args: 0, description: 'No extra output'},
  'eth_forcenonce': {key: 'E', args: 1, description: 'Force nonce transaction number for Ethereum [argument: integer]'}
});
var userid;
var passwd;
if (ops.userid) { userid = ops.userid; }
if (ops.passwd) { passwd = ops.passwd; }

var symbol = ops.pubkey ? ops.pubkey
  : ops.privkey ? ops.privkey
    : ops.keypair ? ops.keypair
      : typeof ops.rawtransaction !== 'undefined' && ops.rawtransaction[0] ? ops.rawtransaction[0] : null;

/*
var base = symbol.split('.')[0];
if(base === 'xcp' || base === 'omni') {
  base = 'btc';
} */

if (ops.rawtransaction) {
  var amount = ops.rawtransaction[1];
  var target = ops.rawtransaction[2];

  hybridd.sequential([
    'init',
    {username: userid, password: passwd}, 'session',
    {host: hostname}, 'addHost',
    {symbol: symbol, amount: Number(amount), target: target }, 'rawTransaction'
  ]
    , (data) => { console.log(data + '\n'); }
    , (error) => { console.error('Error: ' + error); }
    , ops.quiet ? undefined : (progress) => { console.log(Math.floor(progress * 100) + '%'); }
  );
}