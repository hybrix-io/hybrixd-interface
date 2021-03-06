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

const hybrixdNode = function (host_, isRegular = true, encryptByDefault = false) {
  this.isRegular = isRegular; // indicate whether this is a regular of specialized host. specialized hosts are skipped as default host
  this.encryptByDefault = encryptByDefault; // Indicate whether to use y chan by default

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
  this.getHostName = () => host;
  let connectionData; // store connection data for reconnect

  const xAuthStep0Request = () => {
    step = 0; // TODO error if not x ===undefined
    return '/x/' + initial_session_data.session_hexsign + '/0';
  };

  const xAuthStep1Request = nonce1 => {
    step = 1; // TODO error if not x === 0
    try {
      secondary_session_data = CommonUtils.generateSecondarySessionData(nonce1, initial_session_data.session_hexkey, initial_session_data.session_signpair.signSk);
    } catch (e) {
      if (DEBUG) console.error('Error: ' + JSON.stringify(e));
      return null;
    }
    return '/x/' + initial_session_data.session_hexsign + '/1/' + secondary_session_data.crypt_hex;
  };

  const xAuthFinalize = (data, userKeys) => {
    initialized = true;
    server_session_data = data;
    const combined_session_data = {userKeys: userKeys, nonce: nonce};
    Object.assign(combined_session_data, server_session_data, initial_session_data, secondary_session_data);
    try {
      ternary_session_data = CommonUtils.sessionStep1Reply(data, combined_session_data, () => {});
      return true;
    } catch (e) {
      return false;
    }
  };

  const resetSession = () => {
    initialized = false;
    step = undefined;
    initial_session_data = undefined;
    secondary_session_data = undefined;
    ternary_session_data = undefined;
    server_session_data = undefined;
    nonce = undefined;
  };

  const init = (data, dataCallback, errorCallback) => {
    // reset session data
    resetSession();
    step = -1;
    // initialize session data
    nonce = nacl.crypto_box_random_nonce();
    initial_session_data = CommonUtils.generateInitialSessionData(nonce);
    this.call({query: xAuthStep0Request(), connector: data.connector, meta: true}, response => {
      const query = xAuthStep1Request(response.nonce1);
      if (query) {
        this.call({query, connector: data.connector, meta: true}, response => {
          if (xAuthFinalize(response, data.userKeys)) {
            connectionData = data; // store connection data for reconnection purposes
            if (typeof dataCallback === 'function') dataCallback(host);
          } else {
            resetSession();
            if (typeof errorCallback === 'function') errorCallback('Authentication failed');
          }
        }, errorCallback);
      } else {
        resetSession();
        if (typeof errorCallback === 'function') errorCallback('Authentication failed');
      }
    }, errorCallback);
  };

  const reconnect = (dataCallback, errorCallback) => init(connectionData, dataCallback, errorCallback);

  // returns {error:0, data: ...} to dataCallback
  // or return errorMessage to errorCallback
  const handleFollowUp = (callFunction, data, responseString, dataCallback, errorCallback) => {
    if (typeof errorCallback !== 'function') return fail('expected errorCallback to be a function', errorCallback);
    if (typeof responseString !== 'string') return fail('Expected responseString to be a string', errorCallback);
    if (typeof callFunction !== 'function') return fail('expected callFunction to be a function', errorCallback);
    if (typeof dataCallback !== 'function') return fail('expected dataCallback to be a function', errorCallback);
    if (typeof data !== 'object' || data === null) return fail('expected data to be an object', errorCallback);

    let result;
    try {
      result = JSON.parse(responseString);
    } catch (error) {
      return fail(error, errorCallback);
    }

    if (typeof result === 'object' && result.id === 'id') {
      if (result.error === 0) {
        const pid = result.data;
        const followUp = retries => {
          callFunction({query: '/p/' + pid, channel: data.channel, userKeys: data.userKeys, connector: data.connector, meta: true}, response => {
            if (typeof response !== 'object' || response === null) return fail('follow up expected an object', errorCallback);

            const timeout = data.timeout || response.timeout || DEFAULT_TIMEOUT;
            if (response.hasOwnProperty('error') && response.error !== 0) return fail(response.data, errorCallback);
            else if (response.stopped !== null) return dataCallback(response);
            else if (retries * DEFAULT_FOLLOWUP_INTERVAL > timeout) return fail('Followup timeout limit exceeded', errorCallback);
            else return setTimeout(followUp, DEFAULT_FOLLOWUP_INTERVAL, retries + 1);
          },
          errorCallback);
        };
        return followUp(0);
      } else return fail(result.data, errorCallback);
    } else return dataCallback(result);
  };

  const checkDataCallback = (data, dataCallback, errorCallback) => result => {
    if (typeof result !== 'object' || result === null) return fail(result, errorCallback);
    else if (result.hasOwnProperty('error') && result.error !== 0) return fail(result.data, errorCallback);
    else return dataCallback(data.meta ? result : result.data);
  };

  this.call = (data, dataCallback, errorCallback) => { // todo options: {connector,interval, timeout}
    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') return fail('No dataCallback defined', errorCallback);
    if (typeof data !== 'object' || data === null) return fail('Expected object', errorCallback);
    if (!data.hasOwnProperty('connector')) return fail('Expected data.connector', errorCallback);

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
      if (data.retries <= 0) return fail(error, errorCallback);
      else return setTimeout(() => this.call(data, dataCallback, errorCallback), DEFAULT_RETRY_INTERVAL);
    };

    const errorCallbackWithRetries = error => {
      data.retries = (typeof data.retries === 'undefined') ? DEFAULT_RETRIES : data.retries - 1;
      let retryData;
      try {
        const parsedError = JSON.parse(error);
        if (typeof parsedError === 'object' && parsedError !== null && parsedError.hasOwnProperty('error') && parsedError.hasOwnProperty('data') && !meta) return fail(parsedError.data, errorCallback);
        retryData = parsedError;
      } catch (e) {
        retryData = error;
      }
      return retryOrErrorCallback(retryData);
    };

    let connector;
    if (typeof data.connector === 'object' && data.connector !== null) {
      if (data.connector.hasOwnProperty('XMLHttpRequest')) connector = connectors.xhrSocket;
      if (data.connector.hasOwnProperty('http') && host.startsWith('http://')) connector = connectors.httpSocket;
      if (data.connector.hasOwnProperty('https') && host.startsWith('https://')) connector = connectors.httpsSocket;
      if (data.connector.hasOwnProperty('local')) connector = connectors.localSocket;
      if (data.connector.hasOwnProperty('custom')) connector = data.connector.custom;
    }

    if (typeof connector === 'undefined') {
      let protocol = '';
      if (host.startsWith('http://')) protocol = 'http';
      else if (host.startsWith('https://')) protocol = 'https';
      return fail('Error: No ' + protocol + ' request connector method available.', errorCallback);
    }

    const connectorCallfunction = (result, connectorDataCallback, connectorErrorCallback) => {
      const parseCallback = responseString => {
        let response;
        try {
          response = JSON.parse(responseString);
        } catch (e) {
          return fail('Parsing failed', connectorErrorCallback);
        }
        return connectorDataCallback(response);
      };
      return connector(data, host, result.query, parseCallback, connectorErrorCallback);
    };

    return connector(data, host, data.query, responseString => {
      handleFollowUp(connectorCallfunction, data, responseString, checkDataCallback(data, dataCallback, errorCallback), errorCallbackWithRetries);
    }, errorCallbackWithRetries);
  };

  this.yCall = (data, dataCallback, errorCallback) => {
    /* data = {
       query,
       channel: 'y'|'z'
       userKeys,
       connector,
       [meta=false],
       [retries=3] used when session is broken
       }
    */

    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') return fail('No dataCallback defined', errorCallback);
    if (typeof data !== 'object' || data === null) return fail('Expected object', errorCallback);

    const checkErrorForReconnect = error => { // if session error then try to re-establish error
      let result;
      if (typeof error === 'string') { // try parsing the error
        try {
          result = JSON.parse(error);
        } catch (e) {
          return errorCallback(error);
        }
      } else result = error;

      if (typeof result === 'object' && result !== null && result.error === 1 && !result.hasOwnProperty('data')) { // detect silent error which implies session failure
        data.retries = typeof data.retries === 'number' ? data.retries - 1 : 3;
        if (data.retries > 0) {
          const retry = () => this.yCall(data, dataCallback, errorCallback);
          return reconnect(retry, errorCallback);
        } else return errorCallback('Failed to re-establish session after 3 tries.');
      } else return errorCallback(error); // regular error
    };
    if (!initialized) return checkErrorForReconnect({error: 1}); // force silent error to try reconnect

    step++;
    let generalSessionData;
    try {
      generalSessionData = ychan.getGeneralSessionData({user_keys: data.userKeys, nonce: ternary_session_data.current_nonce}, step, ternary_session_data.sess_hex);
    } catch (error) {
      resetSession();
      return errorCallback(error);
    }
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
      step,
      txtdata: data.query
    });

    const query = data.channel + (ydata.startsWith('/') ? '' : '/') + ydata;
    return this.call({query, data: data.data, connector: data.connector, meta: true, retries: data.retries}, result => {
      // TODO check for error
      const encryptedString = result.data;
      // decode encoded data into text data
      const decryptedString = ychan.decode_sub({
        encdata: encryptedString,
        sessionNonce: generalSessionData.sessionNonce,
        serverSessionPubKey: generalSessionData.serverSessionPubKey,
        clientSessionSecKey: generalSessionData.clientSessionSecKey
      });

      if (data.channel === 'y') return handleFollowUp(this.yCall, data, decryptedString, checkDataCallback(data, dataCallback, errorCallback), errorCallback);
      else if (data.channel === 'z') return dataCallback(decryptedString);
      else return fail('Unknown channel: ' + data.channel, errorCallback);
    }, checkErrorForReconnect);
  };

  this.zCall = (data, dataCallback, errorCallback) => {
    /* data = {
       query,
       channel: 'z'
       userKeys
       connector
       [meta=false],
       [retries=3] used when session is broken
       }
    */
    if (typeof errorCallback !== 'function') console.error('No errorCallback defined');
    if (typeof dataCallback !== 'function') return fail('No dataCallback defined', errorCallback);
    if (typeof data !== 'object' || data === null) return fail('Expected object', errorCallback);

    const encodedQuery = zchan.encode({user_keys: data.userKeys, nonce: ternary_session_data.current_nonce}, step, data.query);
    return this.yCall({query: encodedQuery, data: data.data, channel: 'z', userKeys: data.userKeys, connector: data.connector, retries: data.retries}, compressedData => {
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
    if (typeof data !== 'object' || data === null) return fail('Expected object', errorCallback);

    /* data =
         {
         userKeys
         connector
         }
      */
    if (typeof step === 'undefined') { // not yet logged in
      const errorAndResetCallback = error => {
        resetSession();
        callWaitingCallbacks('errorCallback')(error);
        fail(error, errorCallback);
      };
      const dataAndCallWaitingCallback = host => {
        callWaitingCallbacks('dataCallback')(host);
        if (typeof dataCallback === 'function') dataCallback(host);
      };

      return init(data, dataAndCallWaitingCallback, errorAndResetCallback);
    } else if (this.initialized()) return dataCallback(host); // logged in TODO check if it's the same session
    else return waitingCallbacks.push({dataCallback, errorCallback}); // busy logging in
  };

  this.reset = function (data, dataCallback, errorCallback) {
    resetSession();
    if (typeof dataCallback === 'function') dataCallback();
  };
};

module.exports = {hybrixdNode};
