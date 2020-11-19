// (c)2020 hybrix - Rouke Pouw
const fs = require('fs');

// https://developer.mozilla.org/en-US/docs/Web/API/Storage
function createDefaultStorageWrapper (storage) {
  return {
    save: ({key, value}, dataCallback, errorCallback) => {
      try {
        storage.setItem(key, value);
      } catch (e) {
        return errorCallback(e);
      }
      return dataCallback();
    },
    load: ({key}, dataCallback, errorCallback) => {
      let value;
      try {
        value = storage.getItem(key);
      } catch (e) {
        return errorCallback(e);
      }
      if (value === null) return errorCallback('Key not found');
      return dataCallback(value);
    },
    seek: ({key}, dataCallback, errorCallback) => {
      let result = false;
      try {
        for (let index = 0; true; ++index) {
          const otherKey = storage.key(index);
          if (otherKey === null) break; // end of indices reached
          if (otherKey === key) { result = true; break; }
        }
      } catch (e) {
        return errorCallback(e);
      }
      return dataCallback(result);
    },
    burn: ({key}, dataCallback, errorCallback) => {
      try {
        storage.removeItem(key);
      } catch (e) {
        return errorCallback(e);
      }
      return dataCallback();
    },
    list: ({pattern}, dataCallback, errorCallback) => {
      return errorCallback('list not yet implemented'); // TODO
    },
    meta: ({pattern}, dataCallback, errorCallback) => {
      return errorCallback('meta not yet implemented'); // TODO fix
    }
  };
}

function createFileStorageWrapper (path) {
  return {
    save: ({key, value}, dataCallback, errorCallback) => {
      fs.writeFile(path + '/' + key, value, error => {
        return error
          ? errorCallback(error)
          : dataCallback();
      });
    },
    load: ({key}, dataCallback, errorCallback) => {
      fs.readFile(path + '/' + key, (error, data) => {
        return error
          ? errorCallback(error)
          : dataCallback(data.toString());
      });
    },
    seek: ({key}, dataCallback, errorCallback) => {
      fs.access(path + '/' + key, fs.constants.F_OK, error => dataCallback(!error));
    },
    burn: ({key}, dataCallback, errorCallback) => {
      fs.unlink(path + '/' + key, error => {
        return error
          ? errorCallback(error)
          : dataCallback();
      });
    },
    list: ({pattern}, dataCallback, errorCallback) => {
      return errorCallback('list not yet implemented'); // TODO
    },
    meta: ({pattern}, dataCallback, errorCallback) => {
      return errorCallback('meta not yet implemented'); // TODO
    }
  };
}

function checkStorageWrapper (storage) {
  if (typeof storage !== 'object' || storage === null) return null;
  if (typeof storage.save !== 'function') return null;
  if (typeof storage.load !== 'function') return null;
  if (typeof storage.burn !== 'function') return null;
  if (typeof storage.seek !== 'function') return null;
  if (typeof storage.list !== 'function') return null;
  return storage;
}

function initializeStorageConnector (data) {
  if (typeof data !== 'object' || data === null || !data.hasOwnProperty('storage')) return null;
  if (window.Storage && data.storage instanceof window.Storage) return createDefaultStorageWrapper(data.storage);
  if (typeof data.storage === 'string') return createFileStorageWrapper(data.storage);
  else return checkStorageWrapper(data.storage);
}

exports.initializeStorageConnector = initializeStorageConnector;
