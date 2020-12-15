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
    if (typeof data === 'undefined' || (!data.hasOwnProperty('http') && !data.hasOwnProperty('https'))) {
      data = {http: require('http'), https: require('https')};
    }
  } else if (typeof data === 'undefined' || !data.hasOwnProperty('XMLHttpRequest')) {
    if (window.XMLHttpRequest) {
      data = {XMLHttpRequest: window.XMLHttpRequest};
    }
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

  const legacy = key => nacl.to_hex(sha256(user_keys.boxPk)) + '-' + String(key); // Used to create earlier type Internet of Coins wallet storage keys

  const powQueue = [];

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
  method('logout')(assets, user_keys);
  method('session')(user_keys, fail);
  method('getLoginKeyPair')(user_keys, fail);
  method('asset')(assets, fail);
  method('initAsset')(user_keys, fail, assets, clientModules);
  method('import')(fail, clientModules, clientModuleBlobs, hybrixdNodes);
  method('export')(fail, clientModuleBlobs);
  method('modules')(clientModules);
  method('addAsset')(assets, fail, clientModules, storage);
  method('addUnifiedAsset')(assets);
  method('removeAsset')(assets, fail);
  method('client')(assets, fail, clientModules);

  method('getKeys')(assets, fail);
  method('getAddress')(assets, fail);
  method('getBalance')(assets, fail);
  method('getPrivateKey')(assets, fail);
  method('getPublicKey')(assets, fail);
  method('setPrivateKey')(assets, clientModules, fail);

  method('atom')(fail, assets);
  method('form')(fail);

  method('signTransaction')(fail, assets, clientModules);
  method('rawTransaction')(assets, fail);
  method('transaction')();

  method('assert')(fail);
  method('refreshAsset')(assets, fail);
  method('addHost')(fail, hybrixdNodes);
  method('login')(user_keys, hybrixdNodes, connector, fail);
  method('rout')(fail, user_keys, hybrixdNodes, connector);
  method('save')(storage, fail, powQueue, legacy);
  method('work')();
  method('queue')(powQueue);
  method('load')(storage, fail, legacy);
  method('seek')(storage, fail, legacy);
  method('list')(storage, fail, legacy);
  method('burn')(storage, fail, legacy);
  method('meta')(storage, fail, legacy);
  method('hash')(fail);
  method('code')(fail);
  method('keys')(fail);
  method('sign')(fail);
  method('encrypt')(user_keys, fail);
  method('decrypt')(user_keys, fail);
  method('createAccount')(fail);
  method('id')();
  method('sequential')(fail);
  method('parallel')(fail);
  method('promise')();
  method('call')(fail);
};

module.exports = {Interface};
