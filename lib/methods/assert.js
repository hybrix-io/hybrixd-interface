/**
   * Test a condition and fail with a message if condition is not met
   * @category Transaction
   * @param {Object} data
   * @param {Boolean} condition - The condition to test
   * @param {String} [message] - The message to display if condition is not met
   * @example
   * hybrix.sequential([
   *   {condition: true===false, password: 'Failed on purpose. True is not equal to false.'}, 'assert'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.assert = fail => function (data, dataCallback, errorCallback, progressCallback) {
  if (data.condition) {
    dataCallback(data);
  } else {
    fail(data.message, errorCallback);
  }
};
