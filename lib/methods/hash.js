const DJB2 = require('../../common/crypto/hashDJB2');

/**
   * Stringify and create a DJB2 hash.
   * @category Encryption
   * @param {Object} data
   * @param {Object} data.data - A string, array or object.
   * @param {String} [data.salt] - A string.
   * @example
   * hybrix.sequential([
   *   {data:'hello world'}, 'hash'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */

exports.hash = () => function (data, dataCallback, errorCallback) {
  // TODO only add salt if salt
  // TODO add sha option
  dataCallback(DJB2.hash(JSON.stringify(data.data) + JSON.stringify(data.salt)));
};
