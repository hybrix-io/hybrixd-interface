const {PENDING_TRANSACTION_STORAGE_KEY, STATUS_PENDING, mergeStrategy} = require('./getPending');

const add = (data, pendingTransactions, hasSession, dataCallback) => function (storedPendingTransactions) {
  mergeStrategy(pendingTransactions, storedPendingTransactions);
  for (const pendingTransaction of data.transaction) {
    if (!pendingTransaction.hasOwnProperty('timestamp')) pendingTransaction.timestamp = Date.now();
    if (!pendingTransaction.hasOwnProperty('status')) pendingTransaction.status = STATUS_PENDING;
    pendingTransactions[pendingTransaction.ref] = pendingTransaction;
  }
  if (data.sync !== false && hasSession()) { // sync in background
    this.save({key: PENDING_TRANSACTION_STORAGE_KEY, value: pendingTransactions, legacy: true}, () => {}, () => {});
  }
  return dataCallback();
};
/**
   * Add pending transaction(s)
   * @category Transaction
   * @param {Object|Array} data.transaction - Transaction object or array of transactions objects
   * @param {String} data.transaction.ref - Transaction object requires a unique reference id
   * @param {Object} data.transaction.meta - Transaction object requires a unique reference id
   * @param {Object} data.transaction.type - Transaction object requires a unique reference id
   * @param {Number} [data.transaction.timestamp=now]
   * @param {Number} [data.transaction.status=0] -
   * @param {String} [data.sync=true] - Whether to synchronize the data with storage
   * @example
   * hybrix.sequential([
   *   {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   *   {ref:'test', type:'regular', meta:{symbol:'dummy',id:'TX01'}}, 'addPending'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.addPending = (pendingTransactions, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('transaction')) return fail('Expected data to be an object with property \'transaction\'', errorCallback);
  if (!(data.transaction instanceof Array)) data.transaction = [data.transaction];
  for (const pendingTransaction of data.transaction) {
    if (typeof pendingTransaction !== 'object' || pendingTransaction === null || !pendingTransaction.hasOwnProperty('ref') || !pendingTransaction.hasOwnProperty('meta') || !pendingTransaction.hasOwnProperty('type')) {
      return fail('Expected transaction object with \'ref\', \'type\' and \'meta\' property', errorCallback);
    }
  }
  const followUp = add(data, pendingTransactions, hasSession, dataCallback).bind(this);
  if (data.sync !== false && hasSession()) {
    this.load({key: PENDING_TRANSACTION_STORAGE_KEY, legacy: true}, followUp, () => followUp({}));
  } else followUp({});
};
