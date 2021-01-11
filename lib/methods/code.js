const baseCode = require('../../common/basecode');

/**
   * Change encoding of a string from one format to the other.
   * @category Encryption
   * @param {Object} data
   * @param {Object} data.data - A string to encode.
   * @param {String} [data.target='base256'] - Target encoding.
   * @param {String} [data.source='base256'] - Source encoding.
   * @example
   * hybrix.sequential([
   *   {data:'hello world',source:'ascii',target:'hex'}, 'code'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */

exports.code = (fail) => function (data, dataCallback, errorCallback) {
  if (typeof data === 'object' && data !== null && (typeof data.data === 'string' || typeof data.data === 'number' || typeof data.data === 'boolean')) {
    const source = data.source ? data.source : 'base256';
    const target = data.target ? data.target : 'base256';
    const output = baseCode.recode(source, target, String(data.data));
    dataCallback(output);
  } else {
    fail('Expected string, boolean or number input!', errorCallback);
  }
};
