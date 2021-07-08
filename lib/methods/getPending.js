const STATUS_PENDING = 0;
const STATUS_FAILED = -1;
const STATUS_COMPLETED = 1;
const PENDING_TRANSACTION_STORAGE_KEY = 'ff00-0038';
exports.PENDING_TRANSACTION_STORAGE_KEY = PENDING_TRANSACTION_STORAGE_KEY;
exports.STATUS_PENDING = STATUS_PENDING;
exports.mergeStrategy = mergeStrategy;

const THRESHOLD = 8 * 1000 * 60 * 60;// after one hour transactions are considered failed
/*
pendingTransactions = {
  'ref=symbol:id' : { type:'regular',ref, status, timestamp, meta:{id,symbol,amount,target,source}}
}

 */

const finalize = (pendingTransactions, data, dataCallback, hasSession) => function () {
  if (data.refresh !== false) { // fail stale transactions
    const now = Date.now();
    for (const ref in pendingTransactions) {
      const pendingTransaction = pendingTransactions[ref];
      if (pendingTransaction.status === STATUS_PENDING && now - pendingTransaction.timestamp > THRESHOLD) pendingTransaction.status = STATUS_FAILED;
    }
  }

  const result = {...pendingTransactions};
  if (data.remove !== false) {
    for (const ref in pendingTransactions) {
      if (pendingTransactions[ref].status !== STATUS_PENDING) delete pendingTransactions[ref];
    }
  }
  if (data.sync !== false && hasSession()) { // sync in background
    this.save({key: PENDING_TRANSACTION_STORAGE_KEY, value: pendingTransactions, legacy: true}, () => {}, () => {});
  }
  return dataCallback(result);
};

function refreshPendingTransaction (data, pendingTransaction) {
  const type = pendingTransaction.type;
  const hostData = {channel: data.channel};
  if (data.hasOwnProperty('host')) {
    if (typeof data.host === 'string') hostData.host = data.host;
    else if (typeof data.host === 'object' && data.host !== null && data.host.hasOwnProperty(type)) {
      hostData.host = data.host[type];
    } else if (typeof data.host === 'object' && data.host !== null && data.host.hasOwnProperty('default')) {
      hostData.host = data.host.default;
    }
  }

  if (pendingTransaction.status !== STATUS_PENDING) return []; // nothing to do
  else if (type === 'regular') {
    return [
      {query: `/a/${pendingTransaction.meta.symbol}/confirm/${pendingTransaction.meta.id}`, ...hostData}, 'rout',
      result => {
        if (result === true || result === 'true') pendingTransaction.status = STATUS_COMPLETED;
      }
    ];
  } else if (type === 'deal') {
    return [
      {query: `/e/deal/status/${pendingTransaction.meta.id}`, ...hostData}, 'rout',
      result => {
        if (Number(result.progress) === 1 || result.status === 'done') pendingTransaction.status = STATUS_COMPLETED;
        else if (result.status === 'rejected' || result.status === 'timeout') pendingTransaction.status = STATUS_FAILED;
      }
    ];
  } else return [];
}

function refreshPending (pendingTransactions, hasSession, data, dataCallback, errorCallback) {
  const updateSteps = {};
  // TODO maybe a type filter
  for (const ref in pendingTransactions) {
    const pendingTransaction = pendingTransactions[ref];
    updateSteps[ref] = refreshPendingTransaction(data, pendingTransaction);
  }
  return this.parallel({...updateSteps, _options: {failIfAllFail: false}}, finalize(pendingTransactions, data, dataCallback, hasSession).bind(this), errorCallback);
}

/**
 * Merge the stored pending transactions with the existing ones
 * @param  {object} storedPendingTransactions [description]
 */
const mergeStoredPending = (pendingTransactions, hasSession, data, dataCallback, errorCallback) => function (storedPendingTransactions) {
  mergeStrategy(pendingTransactions, storedPendingTransactions);
  return refreshPending.bind(this)(pendingTransactions, hasSession, data, dataCallback, errorCallback);
};

/**
 * merge strategy to resolve conflicts in remote and local storage
 * @param  {[type]} local  [description]
 * @param  {[type]} remote [description]
 * @returns {[type]}        [description]
 */
function mergeStrategy (local, remote) {
  if (typeof local !== 'object' || local === null) return {};
  if (typeof remote !== 'object' || remote === null) return local;
  for (const ref in remote) { // overwrite if remote has more intel
    if (!local.hasOwnProperty(ref) || remote[ref].status !== STATUS_PENDING) local[ref] = remote[ref];
  }
  return local;
}

// TODO only saved if changed

/**
   * Retrieve pending transactions
   * @category Transaction
   * @param {Object} data
   * @param {String} data.data - An encrypted and stringified string, array or object.
   * @param {Object} [data.refresh=true] - Whether to update the status first
   * @param {Object} [data.remove=true] - Whether to remove confirmed or finalized transaction
   * @param {Object} [data.sync=true] - Whether to synchronize the data with storage (if refreshed)
   * @example
   * hybrix.sequential([
   *   {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   *   {ref:'test', type:'regular', meta:{symbol:'dummy',id:'TX01'}}, 'addPending',
   *   'getPending'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.getPending = (pendingTransactions, fail, hasSession) => function (data, dataCallback, errorCallback) {
  if (typeof data === 'undefined') data = {};
  if (typeof data !== 'object' || data === null) return fail('Expected data to be an object', errorCallback);
  else if (data.refresh === false) return finalize(pendingTransactions, data, dataCallback, hasSession).bind(this)();
  else if (data.sync !== false && hasSession()) {
    const followUp = mergeStoredPending(pendingTransactions, hasSession, data, dataCallback, errorCallback).bind(this);
    // TODO proper key
    return this.load(
      {key: PENDING_TRANSACTION_STORAGE_KEY, legacy: true, mergeStrategy},
      followUp,
      () => followUp({}) // if not available, use empty data
    );
  } else return refreshPending.bind(this)(pendingTransactions, hasSession, data, dataCallback, errorCallback);
};
