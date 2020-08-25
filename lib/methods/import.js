const DJB2 = require('../../common/crypto/hashDJB2');
const LZString = require('../../common/crypto/lz-string');
const CommonUtils = require('../../common/index');
// TODO add example
/**
 * Import a client module code blob.
 *
 * @category ClientModule
 * @param {object} data
 * @param {string} data.id - Id of The client code blob.
 * @param {string} data.blob - The client code blob.
 * @param {boolean} [data.check=true] - Check if there's a different version of the blob available at the host.
 * @param {boolean} [data.channel] - The channel used for the calls. 'y' for encryped, 'z' for encryped and compresses;.
 * @param {boolean} [data.host] -  The hostname for the hybrixd node.
 */
exports.import = (fail, clientModules, clientModuleBlobs, hybrixdNodes) => function (data, dataCallback, errorCallback) {
  const addBlob = newerVersionAvailable => blob => {
    try {
      const code = LZString.decompressFromEncodedURIComponent(blob);
      const determisticCode = CommonUtils.activate(code);
      if (determisticCode) {
        clientModules[data.id] = determisticCode;
        clientModuleBlobs[data.id] = blob;
      } else {
        fail('Failed to activate deterministic code', errorCallback);
        return;
      }
    } catch (e) {
      fail(e, errorCallback);
      return;
    }
    dataCallback({id: data.id, newerVersionAvailable, blob: newerVersionAvailable ? blob : undefined});
  };

  const checkHash = sourceHash => {
    const localHash = DJB2.hash(data.blob);
    if (sourceHash.hash === localHash) { // the blob matches the hash so added
      addBlob(false)(data.blob);
    } else { // the blob does not match the hash, so retrieve it and add that one
      this.rout({query: '/s/deterministic/code/' + data.id, host: data.host, channel: data.channel}, addBlob(true), errorCallback);
    }
  };

  if (Object.keys(hybrixdNodes).length > 0 && data.check !== false) {
    this.rout({query: '/s/deterministic/hash/' + data.id, host: data.host, channel: data.channel}, checkHash, errorCallback);
  } else {
    addBlob(false)(data.blob);
  }
};
