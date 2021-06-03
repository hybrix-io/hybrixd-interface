/**
   * Add a unified asset TODO
   * @category AssetManagement
   * @param {Object} data
   * @param {string} data.symbol - The symbol of the asset
   * @param {string} data.name - The name of the asset
   * @param {string} data.symbols - The symbol of the asset
   * @param {string} [data.info] - The info of the asset
   * @param {string} [data.host] - The host used for the calls.
   * @param {string} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'xmpl', symbols:{btc:1,eth:1}}, 'addUnifiedAsset',
   * {symbol: 'xmpl'}, 'refreshAsset'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */

const compressUnifiedAddress = require('../../common/compress-unified-address.js');

exports.addUnifiedAsset = assets => function (data, dataCallback, errorCallback, progressCallback) {
  // TODO check data = object
  // TODO check data.symbol
  // TODO check data.symbol does not yet exist
  // TODO check data.symbols
  const steps = {};
  for (const symbol in data.symbols) {
    steps[symbol] = {data: {symbol, channel: data.channel, host: data.host}, step: 'addAsset'}; // TOOD pass host,channel
  }
  const addUnifiedAsset = () => {
    assets[data.symbol] = {
      symbol: data.symbol,
      symbols: data.symbols,
      name: data.name,
      info: data.info,
      fee: 0, // TODO multi asset fee
      factor: (typeof data.factor === 'undefined') ? undefined : data.factor,
      mode: (typeof data.mode === 'undefined') ? [] : data.mode,
      contract: (typeof data.contract === 'undefined') ? [] : data.contract,
      'keygen-base': {},
      'fee-symbol': data.symbol, // TODO multi asset fee
      'fee-factor': 0, // TODO multi asset fee
      data: {
        balance: 'n/a',
        subBalances: {},
        baseBalances: {},
        sufficientFuel: undefined,
        subSufficientFuels: {},
        feePerSubAsset: {},
        keys: {},
        publickey: '',
        privatekey: '',
        address: '',
        seed: [],
        mode: []
      }
    };
    const asset = assets[data.symbol];

    for (const subSymbol in data.symbols) {
      const weight = data.symbols[subSymbol];
      const subAsset = assets[subSymbol];
      const prefix = subAsset.symbol + ':';
      const comma = (asset.data.address === '' ? '' : ',');

      // TODO multi asset fee
      asset.fee = Math.max(asset.fee, weight * subAsset.fee);
      // TODO multi asset fee
      asset['fee-factor'] = Math.max(asset['fee-factor'], Number(subAsset['fee-factor'])); // get the maximal fee-factor for to enable as small as possible fees

      if (typeof data.contract === 'undefined') asset.contract.push(prefix + subAsset.contract);

      if (typeof data.mode === 'undefined') asset.mode.push(prefix + subAsset.mode);

      if (typeof data.factor === 'undefined') asset.factor = Math.min(Number(subAsset.factor), asset.factor); // get the minimal factor to ensure consistency over assets

      asset['keygen-base'][subSymbol] = subAsset['keygen-base'];
      asset.data.keys[subSymbol] = subAsset.data.keys;
      asset.data.publickey += comma + prefix + subAsset.data.publickey;
      asset.data.privatekey += comma + prefix + subAsset.data.privatekey;

      asset.data.address += comma + prefix + subAsset.data.address;
      asset.data.seed.push(prefix + subAsset.data.seed);
      asset.data.mode.push(prefix + subAsset.data.mode);
      asset.data.feePerSubAsset[subSymbol] = {[subAsset['fee-symbol']]: subAsset.fee};
    }
    asset.data.address = data.symbol + ':' + compressUnifiedAddress.encode(asset.data.address); // return compressed unified address
    // TODO compress public, private keys
    this.asset(data.symbol, dataCallback, errorCallback);
  };
  this.parallel(steps, addUnifiedAsset, errorCallback, progressCallback);
};
