// (c)2020 hybrix - Rouke Pouw

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
        if (value === null) return errorCallback('Key not found');
      } catch (e) {
        return errorCallback(e);
      }
      return dataCallback(value);
    },
    seek: ({key}, dataCallback, errorCallback) => {
      try {
        for (let index = 0; true; ++index) {
          const otherKey = storage.key(index);
          if (otherKey === null) return dataCallback(false);
          if (otherKey === key) return dataCallback(true);
        }
      } catch (e) {
        return errorCallback(e);
      }
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
  else return checkStorageWrapper(data.storage);
}

exports.initializeStorageConnector = initializeStorageConnector;
