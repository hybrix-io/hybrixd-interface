// TODO remove at certain point
/**
   * No longer required, is handled automatically before the first call
   * @category Deprecated
   **/
exports.init = () => function (data, dataCallback, errorCallback) {
  if (typeof dataCallback === 'function') dataCallback('Initialized');
};
