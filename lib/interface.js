// THIS IS PREPENDED BY COMPILER: var nacl_factory = require('../common/crypto/nacl.js');

DEBUG = false;

const requireContext = require.context('./methods/', false, /.js$/, 'sync');
const {initializeStorageConnector} = require('./storage');

const sha256 = require('../common/crypto/sha256'); // Used for legacy storage key generation

// emulate window for browser code executed in nodejs environment
if (typeof window === 'undefined') window = {};

if (typeof window.crypto === 'undefined') window.crypto = require('crypto');

// In browser implementations a window.crypto.getRandomValues is expected
// this is not in nodjes crypto library so we define it here in case
// we want to use browser code in a nodejes environment
if (typeof window.crypto.getRandomValues === 'undefined') {
  window.crypto.getRandomValues = function getRandomValues (arr) {
    const bytes = window.crypto.randomBytes(arr.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes[i];
  };
}
// Likewise in a nodejs implementation crypto.randomBytes is expected
// this is not available in a browser envrioment so we define it here in case
// we want to use nodejs code in a browser environment
if (typeof window.crypto.randomBytes === 'undefined') {
  window.crypto.randomBytes = function (size, callback) {
    const bytes = [];
    for (let i = 0; i < bytes.length; i++) bytes.push(0);

    window.crypto.getRandomValues(bytes); // overwrite the zero values with random values
    if (typeof callback === 'function') callback(null, bytes);
    else return bytes;
  };
}

if (typeof crypto === 'undefined') crypto = window.crypto; // Needed to make ethereum work

if (typeof crypto.getRandomValues === 'undefined') crypto.getRandomValues = window.crypto.getRandomValues;

// emulate self for browser code executed in nodejs environment
if (typeof self === 'undefined') self = {};

if (typeof self.crypto === 'undefined') self.crypto = window.crypto;

if (typeof FormData === 'undefined') FormData = {};

const checkNodeJS = new Function('try {return this===global;}catch(e){return false;}');

const Interface = function (data) {
  const storage = initializeStorageConnector(data);

  const isNodeJS = checkNodeJS();

  if (isNodeJS) {
    if (typeof data === 'undefined') data = {http: require('http'), https: require('https')};
    else {
      if (!data.hasOwnProperty('http')) data.http = require('http');
      if (!data.hasOwnProperty('https')) data.https = require('https');
    }
  } else {
    if (typeof data === 'undefined') data = {XMLHttpRequest: window.XMLHttpRequest};
    else if (window.XMLHttpRequest && !data.hasOwnProperty('XMLHttpRequest')) data.XMLHttpRequest = window.XMLHttpRequest;
  }
  const connector = data;
  const user_keys = {};
  /*
    boxPk
    boxSk
  */
  const assets = {};
  /* per symbol:
     {$SYMBOL:
      { ..details,
        data :
         {
           seed,
           keys,
           publickey,
           privatekey,
           address,
           balance,
         }
     }
  */
  const clientModules = {};
  /*  per id/mode:
      {$ID/MODE :
      {
      keys()
      sign()
      ..TODO
      }
      }
  */
  const clientModuleBlobs = {};
  //  per id/mode: a string containing the code

  const hybrixdNodes = {};

  const fail = function (message, errorCallback) {
    if (DEBUG) console.error(message);
    if (typeof errorCallback === 'function') errorCallback(message);
  };

  const hasSession = () => user_keys.hasOwnProperty('boxPk') && user_keys.hasOwnProperty('boxSk');

  const hasHost = () => Object.keys(hybrixdNodes).length > 0;

  const legacy = key => {
    if (!hasSession()) return null; // legacy mode requires a session
    else return nacl.to_hex(sha256(user_keys.boxPk)) + '-' + String(key); // Used to create earlier type Internet of Coins wallet storage keys
  };

  const powQueue = [];

  const pendingTransactions = {};
  /*
  pendingTransactions = {
    'ref=symbol:id' : { type:'regular',ref, status, timestamp, meta:{id,symbol,amount,target,source}}
  }
  */

  let initializing = false; // busy with nacl initalization
  let initialized = false; // finished with nacl initialization
  const callbacksWaitingForInitialization = []; // callbacks to execute when initialization is done

  const finalizeInitialization = () => {
    initializing = false;
    initialized = true;
    callbacksWaitingForInitialization.forEach(callback => callback());
  };

  const initialize = dataCallback => {
    initializing = true;
    if (typeof nacl === 'undefined') {
      nacl_factory.instantiate(naclinstance => {
        nacl = naclinstance; // nacl is a global that is initialized here.
        window.nacl = nacl;
        finalizeInitialization();
      });
    } else {
      window.nacl = nacl; // nacl is a global that has been initialized somewhere else.
      finalizeInitialization();
    }
  };

  const method = name => function (...compileArguments) {
    this[name] = function (...runTimeArguments) {
      const callback = () => requireContext('./' + name + '.js')[name].apply(this, compileArguments).apply(this, runTimeArguments);
      if (!initialized) {
        callbacksWaitingForInitialization.push(callback);
        if (!initializing) initialize();
      } else return callback(); // used for direct returns (such as form)
    };
  }.bind(this);

  method('init')(); // TODO: deprecated to be removed
  method('logout')(assets, user_keys, pendingTransactions, hybrixdNodes);
  method('session')(user_keys, fail);
  method('getLoginKeyPair')(user_keys, fail);
  method('asset')(assets, fail);
  method('initAsset')(user_keys, fail, assets, clientModules, hasSession);
  method('import')(fail, clientModules, clientModuleBlobs, hybrixdNodes);
  method('export')(fail, clientModuleBlobs);
  method('modules')(clientModules);
  method('addAsset')(assets, fail, clientModules, storage);
  method('addUnifiedAsset')(assets);
  method('removeAsset')(assets, fail);
  method('client')(assets, fail, clientModules);

  method('getKeys')(assets, fail, hasSession);
  method('getAddress')(assets, fail, hasSession);
  method('getBalance')(assets, fail, hasSession);
  method('getFee')(assets, fail, hasSession);
  method('getPrivateKey')(assets, fail, hasSession);
  method('getPublicKey')(assets, fail, hasSession);
  method('setPrivateKey')(assets, clientModules, fail);
  method('refreshAsset')(assets, fail, hasSession);

  method('atom')(fail, assets);
  method('form')(fail);

  method('signTransaction')(fail, assets, clientModules);
  method('rawTransaction')(assets, fail, hasSession);
  method('transaction')();

  method('assert')(fail);
  method('addHost')(fail, hybrixdNodes);
  method('login')(user_keys, hybrixdNodes, connector, fail, hasSession);
  method('rout')(fail, user_keys, hybrixdNodes, connector, hasSession);
  method('save')(storage, fail, powQueue, legacy, hasHost);
  method('work')();
  method('queue')(powQueue);
  method('load')(storage, fail, legacy, hasHost);
  method('seek')(storage, fail, legacy, hasHost);
  method('list')(storage, fail, legacy, hasHost);
  method('burn')(storage, fail, legacy, hasHost);
  method('meta')(storage, fail, legacy, hasHost);

  method('hash')(fail);
  method('code')(fail);
  method('keys')(fail);
  method('sign')(fail);
  method('encrypt')(user_keys, fail, hasSession);
  method('decrypt')(user_keys, fail, hasSession);
  method('createAccount')(fail);
  method('id')();
  method('sequential')(fail);
  method('parallel')(fail);
  method('promise')();
  method('call')(fail);
  //
  method('getPending')(pendingTransactions, fail, hasSession);
  method('addPending')(pendingTransactions, fail, hasSession);
};

module.exports = {Interface};
