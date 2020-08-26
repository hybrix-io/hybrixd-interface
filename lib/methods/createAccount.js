const hexToBase32 = require('../../common/crypto/hex2base32').hexToBase32;
const DJB2 = require('../../common/crypto/hashDJB2');

function toHexString (byteArray) {
  let s = '0x';
  byteArray.forEach(function (byte) {
    s += ('0' + (byte & 0xFF).toString(16)).slice(-2);
  });
  return s;
}
// TODO add example
/**
   * Create a new deterministic account with the entropy provided.
   * @category Session
   * @param {Object} data
   * @param {string} [data.entropy] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Entropy can be provided. Must be a sufficient random string of at least 482 bytes.
   * @param {Function} [data.offset] - CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Use an offset to create multiple accounts from same entropy.
   * @param {Function} [data.pool] -  CAREFUL! Using this feature incorrectly can reduce your security and privacy. Only use when you know what you're doing. Pool function can be overridden by a custom 1600 byte pool generator.
   * deterministic
   */
exports.createAccount = (fail) => function (data, dataCallback, errorCallback) {
  if (typeof data === 'undefined') { data = {}; }

  const create = function (entropy, offset) {
    const minimalEntropyLength = 411 + 20 + 60;
    if (entropy.length <= minimalEntropyLength) {
      fail('Entropy is of insufficient length. Required > ' + minimalEntropyLength, errorCallback);
      return;
    }

    const password = hexToBase32(entropy.substr(offset + 20, 60));
    const username = hexToBase32(entropy.substr(offset, 12) +
                                 DJB2.hash(entropy.substr(offset, 12).toUpperCase()).substr(0, 4) +
                                 DJB2.hash(entropy.substr(offset, 12).toLowerCase() + password.toUpperCase()).substr(4, 4));

    // TODO validate username and password
    dataCallback({username, password});
  };

  if (typeof data.entropy === 'string') {
    create(data.entropy, data.offset || 0);
  } else {
    let pool;
    if (typeof data.pool === 'function') {
      pool = data.pool;
    } else {
      pool = function (randomNumber) {
        // randomNumber not used by pool in this instance
        if (window && window.crypto && window.crypto.getRandomValues) {
          const array = window.crypto.getRandomValues(new Uint8Array(1600));
          if (array) {
            return toHexString(array);
          } else {
            return crypto.randomBytes(1600).toString('hex');
          }
        } else {
          return crypto.randomBytes(1600).toString('hex');
        }
      };
    }

    let entropy = '';
    const maxIndex = 1000 + Math.floor(Math.random() * 256);

    const numberList = new Array(maxIndex).fill(0).map(() => {
      return Math.floor(Math.random() * Math.pow(8, 16));
    });

    const iterate = index => {
      if (index === maxIndex) {
        const offset = Math.floor(Math.random() * 411);
        create(entropy, offset);
      } else {
        entropy = pool(numberList[index]);
        ++index;
        iterate(index);
      }
    };
    iterate(0);
  }
};
