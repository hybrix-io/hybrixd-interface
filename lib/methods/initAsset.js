const CommonUtils = require('../../common/index');
// TODO add example
/**
   * Initialize an asset (crypto currency or token)
   * @category AssetManagement
   * @param {Object} data
   * @param {Object} data.assetDetails - Asset details as retrieved by calling `/a/$SYMBOL/details`
   * @param {string} data.clientModuleCodeBlob - A string containing the client module code blob.
   * @param {Boolean} [data.check=true] - Whether to check if the provided clientModuleCodeBlob matches the remote version
   * @param {string} [data.seed] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a custom see
   * @param {string} [data.keys] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a keypair
   * @param {string} [data.privateKey] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pass a privateKey
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   **/
exports.initAsset = (user_keys, fail, assets, clientModules, hasSession) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('assetDetails')) return fail('Missing \'assetDetails\'.', errorCallback);
  if (typeof data.assetDetails !== 'object' || data.assetDetails === null) fail('Expected \'assetDetails\' to be an object.', errorCallback);

  const init = () => {
    const symbol = data.assetDetails.symbol;
    assets[symbol] = data.assetDetails;
    assets[symbol].symbol = symbol;
    assets[symbol].data = {balance: 'n/a'};
    const mode = data.assetDetails['mode'].split('.');
    const [baseMode, subMode] = mode;

    if (!data.assetDetails.hasOwnProperty('keygen-base')) return fail('Missing \'keygen-base\' in details.', errorCallback);

    const baseSymbol = data.assetDetails['keygen-base'];

    const addressCallback = address => {
      assets[symbol].data.address = address;
      this.asset(symbol, dataCallback, errorCallback);
    };

    const keysCallback = keys => {
      assets[symbol].data.keys = keys;
      assets[symbol].data.keys.mode = subMode;
      assets[symbol].data.publickey = clientModules[baseMode].publickey(assets[symbol].data.keys);
      assets[symbol].data.privatekey = clientModules[baseMode].privatekey(assets[symbol].data.keys);

      const address = clientModules[baseMode].address(assets[symbol].data.keys, addressCallback, errorCallback);
      if (typeof address !== 'undefined') addressCallback(address); // otherwise callback will be handled
    };

    assets[symbol]['fee-symbol'] = data.assetDetails['fee-symbol'] || symbol;
    assets[symbol]['fee-factor'] = data.assetDetails['fee-factor'];
    let keys;
    try {
      assets[symbol].data.mode = subMode;
      if (typeof data.keys !== 'undefined') { // get keys directly from provided input
        keys = data.keys;
      } else if (typeof data.privateKey !== 'undefined') { // generate keys from provided privateKey
        if (!clientModules[baseMode].hasOwnProperty('importPrivate')) {
          return fail('Asset ' + symbol + ' does not support importing of private keys.', errorCallback);
        } else {
          keys = clientModules[baseMode].importPrivate(data);
        }
      } else {
        if (!hasSession() && !data.seed) return fail('Cannot initiate asset without a session, seed or keys.', errorCallback);

        assets[symbol].data.seed = data.seed || CommonUtils.seedGenerator(user_keys, baseSymbol); // use provided seed or generate seed based on user keys
        keys = clientModules[baseMode].keys(assets[symbol].data, keysCallback, errorCallback);
      }
    } catch (e) {
      return fail(e, errorCallback);
    }
    if (typeof keys !== 'undefined') return keysCallback(keys);
  };

  if (!clientModules.hasOwnProperty(data.assetDetails['mode'].split('.')[0])) { //  blob was not yet initialized
    const mode = data.assetDetails['mode'].split('.')[0];
    return this.import({id: mode, blob: data.clientModuleCodeBlob, channel: data.channel, host: data.host, check: data.check}, init, errorCallback);
  } else return init();
};
