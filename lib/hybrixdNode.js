const connectors = require('./connectors');
const ychan = require('../common/ychan');
const zchan = require('../common/zchan');
const CommonUtils = require('../common/index');

const DEFAULT_FOLLOWUP_INTERVAL = 500;
const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_INTERVAL = 100;

function fail (error, errorCallback) {
  if (DEBUG) console.error(error);
  if (typeof errorCallback === 'function') errorCallback(error);
}

const hybrixdNode = function (host_) {
  let step; // Incremental step. Steps 0 and 2 used for x-authentication, subsequent steps used for y and z chan
  let nonce; // Random value
  let initialized = false;

  let initial_session_data;
  /* generateInitialSessionData(...) => {
     = {
     session_hexkey,
     session_hexsign,
     session_keypair,
     session_nonce,option
     session_seckey,
     session_secsign,
     session_signpair
     }
  */
  let secondary_session_data;
  /* generateSecondarySessionData(...) => {
     nonce1_hex,
     nonce2_hex,
     crypt_hex
     }
  */

  let ternary_session_data;
  /* sessionStep1Reply(...) => {
     sess_hex,
     current_nonce
     }
  */

  let server_session_data;
  /*  xAuthFinalize xauth response on step 1 =>
      server_sign_pubkey
      server_session_pubkey
      current_nonce
      crhex
  */
  const host = host_;
  let connectionData; // store connection data for reconnect

  this.xAuthStep0Request = () => {
    step = 0; // TODO error if not x ===undefined
    return '/x/' + initial_session_data.session_hexsign + '/0';
  };

  this.xAuthStep1Request = nonce1 => {
    step = 1; // TODO error if not x === 0
    try {
      secondary_session_data = CommonUtils.generateSecondarySessionData(nonce1, initial_session_data.session_hexkey, initial_session_data.session_signpair.signSk);
    } catch (e) {
      if (DEBUG) { console.error('Error: ' + JSON.stringify(e)); }
    }
    return '/x/' + initial_session_data.session_hexsign + '/1/' + secondary_session_data.crypt_hex;
  };

  this.xAuthFinalize = (data, userKeys) => {
    initialized = true;
    server_session_data = data;
    let combined_session_data = {userKeys: userKeys, nonce: nonce};
    Object.assign(combined_session_data, server_session_data, initial_session_data, secondary_session_data);
    ternary_session_data = CommonUtils.sessionStep1Reply(data, combined_session_data, () => {});
  };

  const init = (data, dataCallback, errorCallback) => {
    // reset session data
    initialized = false;
    step = 0;
    secondary_session_data = undefined;
    ternary_session_data = undefined;
    server_session_data = undefined;
    // initialize session data
    nonce = nacl.crypto_box_random_nonce();
    initial_session_data = CommonUtils.generateInitialSessionData(nonce);

    this.call({query: this.xAuthStep0Request(), connector: data.connector, meta: true}, (response) => {
      this.call({query: this.xAuthStep1Request(response.nonce1), connector: data.connector, meta: true}, (response) => {
        this.xAuthFinalize(response, data.userKeys);
        connectionData = data; // store connection data for reconnection purposes
        if (typeof dataCallback === 'function') dataCallback(host);
      }, errorCallback);
    }, errorCallback);
  };

  const reconnect = (dataCallback, errorCallback) => init(connectionData, dataCallback, errorCallback);

  // returns {error:0, data: ...} to dataCallback
  // or return errorMessage to errorCallback
  const handleFollowUp = (callFunction, data, responseString, dataCallback, errorCallback) => {
    if (typeof errorCallback !== 'function') { fail('expected errorCallback to be a function', errorCallback); return; }
    if (typeof responseString !== 'string') { fail('Expected responseString to be a string', errorCallback); return; }
    if (typeof callFunction !== 'function') { fail('expected callFunction to be a function', errorCallback); return; }
    if (typeof dataCallback !== 'function') { fail('expected dataCallback to be a function', errorCallback); return; }
    if (typeof data !== 'object' || data === null) { fail('expected data to be an object', errorCallback); return; }

    let result;
    try {
      result = JSON.parse(responseString);
    } catch (error) {
      fail(error, errorCallback);
      return;
    }

    if (typeof result === 'object' && result.id === 'id') {
      if (result.error === 0) {
        const pid = result.data;
        let followUp;
        followUp = retries => {
          callFunction({query: '/p/' + pid, channel: data.channel, userKeys: data.userKeys, connector: data.connector, meta: true}, response => {
            if (typeof response !== 'object' || response === null) { fail('follow up expected an object', errorCallback); return; }

            const timeout = data.timeout || response.timeout || DEFAULT_TIMEOUT;
            if (response.hasOwnProperty('error') && response.error !== 0) {
              fail(response.info, errorCallback);
            } else if (response.stopped !== null) {
              dataCallback(response);
            } else if (retries * DEFAULT_FOLLOWUP_INTERVAL > timeout) {
              fail('Followup timeout limit exceeded', errorCallback);
            } else {
              setTimeout(followUp, DEFAULT_FOLLOWUP_INTERVAL, retries + 1);
            }
          },
          errorCallback);
        };
        followUp(0);
      } else {
        const errorMessage = result.data;
        fail(errorMessage, errorCallback);
      }
    } else {
      dataCallback(result);
    }
  };

  const checkDataCallback = (data, dataCallback, errorCallback) => result => {
    if (typeof result !== 'object' || result === null) {
      fail(result, errorCallback);
    } else if (result.hasOwnProperty('error') && result.error !== 0) {
      fail(result.data, errorCallback);
    } else {
      dataCallback(data.meta ? result : result.data);
    }
  };

  this.call = (data, dataCallback, errorCallback) => { // todo options: {connector,interval, timeout}
    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') { fail('No dataCallback defined', errorCallback); return; }
    if (typeof data !== 'object' || data === null) { fail('Expected object', errorCallback); return; }
    if (!data.hasOwnProperty('connector')) { fail('Expected data.connector', errorCallback); return; }

    /* data = {
       query,
       connector,
       [meta=false],
       [retries=DEFAULT_RETRIES],
       [retryInterval=DEFAULT_RETRY_INTERVAL]
       }
    */

    const meta = !!data.meta; // meta is a boolean indicating whether to strip the meta data from a call

    const retryOrErrorCallback = error => {
      if (data.retries <= 0) {
        fail(error, errorCallback);
      } else {
        setTimeout(() => this.call(data, dataCallback, errorCallback), DEFAULT_RETRY_INTERVAL);
      }
    };

    const errorCallbackWithRetries = error => {
      data.retries = (typeof data.retries === 'undefined') ? DEFAULT_RETRIES : data.retries - 1;
      try {
        const parsedError = JSON.parse(error);
        if (parsedError.hasOwnProperty('error') && parsedError.hasOwnProperty('data') && !meta) {
          fail(parsedError.data, errorCallback);
        } else {
          retryOrErrorCallback(parsedError);
        }
      } catch (e) {
        retryOrErrorCallback(error);
      }
    };

    let connector;
    if (data.connector.hasOwnProperty('XMLHttpRequest')) { connector = connectors.xhrSocket; }
    if (data.connector.hasOwnProperty('http') && host.startsWith('http://')) { connector = connectors.httpSocket; }
    if (data.connector.hasOwnProperty('https') && host.startsWith('https://')) { connector = connectors.httpsSocket; }
    if (data.connector.hasOwnProperty('local')) { connector = connectors.localSocket; }
    if (data.connector.hasOwnProperty('custom')) { connector = data.connector.custom; }

    if (typeof connector === 'undefined') {
      let protocol = '';
      if (host.startsWith('http://')) { protocol = 'http'; } else if (host.startsWith('https://')) { protocol = 'https'; }
      fail('Error: No ' + protocol + ' request connector method available.', errorCallback);
      return;
    }

    const connectorCallfunction = (result, connectorDataCallback, connectorErrorCallback) => {
      const parseCallback = responseString => {
        let response;
        try {
          response = JSON.parse(responseString);
        } catch (e) {
          fail('Parsing failed', connectorErrorCallback);
          return;
        }
        connectorDataCallback(response);
      };
      connector(data, host, result.query, parseCallback, connectorErrorCallback);
    };

    connector(data, host, data.query, responseString => {
      handleFollowUp(connectorCallfunction, data, responseString, checkDataCallback(data, dataCallback, errorCallback), errorCallbackWithRetries);
    }, errorCallbackWithRetries);
  };

  this.yCall = (data, dataCallback, errorCallback) => {
    /* data = {
       query,
       channel: 'y'|'z'
       userKeys,
       [meta=false],
       [retries] added when session is broken
       }
    */

    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') { fail('No dataCallback defined', errorCallback); return; }
    if (typeof data !== 'object' || data === null) { fail('Expected object', errorCallback); return; }

    const checkErrorForReconnect = error => { // if session error then try to re-establish error
      let result;
      if (typeof error === 'string') { // try parsing the error
        try {
          result = JSON.parse(error);
        } catch (e) {
          errorCallback(error);
          return;
        }
      } else result = error;

      if (typeof result === 'object' && result !== null && result.error === 1 && !result.hasOwnProperty('data')) { // detect silent error which implies session failure
        data.retries = typeof data.retries === 'number' ? data.retries + 1 : 1;
        if (data.retries <= 3) {
          const retry = () => this.yCall(data, dataCallback, errorCallback);
          reconnect(retry, errorCallback);
        } else {
          errorCallback('Failed to re-establish session');
        }
      } else { // regular error
        errorCallback(error);
      }
    };

    step++;

    const generalSessionData = ychan.getGeneralSessionData({user_keys: data.userKeys, nonce: ternary_session_data.current_nonce}, step, ternary_session_data.sess_hex);
    /*
      generalSessionData = {
      sessionID,
      clientSessionSecKey,
      serverSessionPubKey,
      sessionNonce
       connector
      };
    */
    //    ternary_session_data.current_nonce[23]++;
    const ydata = ychan.encode_sub({
      sessionID: generalSessionData.sessionID,
      sessionNonce: generalSessionData.sessionNonce,
      serverSessionPubKey: generalSessionData.serverSessionPubKey,
      clientSessionSecKey: generalSessionData.clientSessionSecKey,
      step: step,
      txtdata: data.query
    });

    this.call({query: data.channel + '/' + ydata, connector: data.connector, meta: true, retries: data.retries}, result => {
      // TODO check for error
      const encryptedString = result.data;
      // decode encoded data into text data
      const decryptedString = ychan.decode_sub({
        encdata: encryptedString,
        sessionNonce: generalSessionData.sessionNonce,
        serverSessionPubKey: generalSessionData.serverSessionPubKey,
        clientSessionSecKey: generalSessionData.clientSessionSecKey
      });

      if (data.channel === 'y') handleFollowUp(this.yCall, data, decryptedString, checkDataCallback(data, dataCallback, errorCallback), errorCallback);
      else if (data.channel === 'z') dataCallback(decryptedString);
      else fail('Unknown channel: ' + data.channel, errorCallback);
    }, checkErrorForReconnect);
  };

  this.zCall = (data, dataCallback, errorCallback) => {
    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') { fail('No dataCallback defined', errorCallback); return; }
    if (typeof data !== 'object' || data === null) { fail('Expected object', errorCallback); return; }
    /* data = {
       query,
       channel: 'z'
       userKeys
       connector
       }
    */
    const encodedQuery = zchan.encode({user_keys: data.userKeys, nonce: ternary_session_data.current_nonce}, step, data.query);
    this.yCall({query: encodedQuery, channel: 'z', userKeys: data.userKeys, connector: data.connector, retries: data.retries}, compressedData => {
      const uncompressedData = zchan.decode_sub(compressedData);
      handleFollowUp(this.zCall, data, uncompressedData, checkDataCallback(data, dataCallback, errorCallback), errorCallback);
    }, errorCallback);
  };

  this.initialized = () => initialized;

  // [{dataCallback, errorCallback}]
  const waitingCallbacks = [];

  const callWaitingCallbacks = callbackType => data => {
    waitingCallbacks.forEach(callbacks => { // call all callbacks in queue
      const callback = callbacks[callbackType];
      if (typeof callback === 'function') callback(data);
    });
    waitingCallbacks.length = 0; // clear queue
  };

  this.init = function (data, dataCallback, errorCallback) {
    //    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    //    if (typeof dataCallback !== 'function') { fail('No dataCallback defined', errorCallback); return; }
    if (typeof data !== 'object' || data === null) { fail('Expected object', errorCallback); return; }

    /* data =
         {
         userKeys
         connector
         }
      */
    if (typeof step === 'undefined') { // not yet logged in
      const errorAndResetCallback = error => {
        step = undefined; // reset step
        initialized = false;
        callWaitingCallbacks('errorCallback')(error);
        fail(error, errorCallback);
      };
      const dataAndCallWaitingCallback = host => {
        callWaitingCallbacks('dataCallback')(host);
        if (typeof dataCallback === 'function') dataCallback(host);
      };

      init(data, dataAndCallWaitingCallback, errorAndResetCallback);
    } else if (this.initialized()) { // logged in
      // TODO check if it's the same session
      dataCallback(host);
    } else { // busy logging in
      waitingCallbacks.push({dataCallback, errorCallback});
    }
  };
};

module.exports = {hybrixdNode};
