/**
   * Create, sign and execute a transaction e.g. push it into the network.
   * @category Transaction
   * @param {Object} data
   * @param {String} data.symbol - The symbol of the asset
   * @param {String} data.target - The target address
   * @param {Number} data.amount - The amount that should be transferred
   * @param {Boolean} [data.validate=true] - Validate target address and available funds.
   * @param {String} [data.message] - Option to add data (message, attachment, op return) to a transaction.
   * @param {Object} [data.unspent] - Manually set the unspent data
   * @param {String} [data.source=address] - Provide optional (partial) source address.
   * @param {String} [data.comparisionSymbol=hy] - Provide symbol to compare fees for multi transactions
   * @param {Number} [data.fee] - The fee.
   * @param {Number} [data.time] - Provide an explicit time timestamp.
   * @param {String} [data.host] - The host that should be used.
   * @param {String} [data.channel]  - Indicate the channel 'y' for encryption, 'z' for both encryption and compression
   * @example
   * hybrix.sequential([
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {symbol: 'dummy', target: '_dummyaddress_', amount:1}, 'transaction',
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.transaction = () => function (data, dataCallback, errorCallback, progressCallback) {
  this.sequential({steps: [
    data, 'rawTransaction',
    rawtx => { return { query: '/a/' + data.symbol + '/push/' + rawtx, channel: data.channel, host: data.host }; }, 'rout'
  ]}, dataCallback, errorCallback, progressCallback);
};
