// TODO remove at certain point
/**
   * No longer required, is handled automatically before the first call
   * @category Depricated
   **/
exports.init = () => function (data, dataCallback, errorCallback) {
  if (typeof dataCallback === 'function') dataCallback('Initialized');
};
