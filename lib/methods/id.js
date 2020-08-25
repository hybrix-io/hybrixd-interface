/**
   * Identity function, outputs the data that is passed
   * @category Flow
   * @param {Array.<string|Object|Function>} data - data passed to  dataCallback
   * @example
   * hybrix.sequential([
   * {hello:'world'}, 'id'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.id = () => (data, dataCallback, errorCallback) => {
  dataCallback(data);
};
