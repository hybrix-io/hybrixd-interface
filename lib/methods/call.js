/**
   * Execute a custom function with callbacks. Usefull for sequential and parallel.
   * @category Flow
   * @param {Object} data
   * @param {Function} data.func - A function expecting data, dataCallback, errorCallback and optional progressCallback parameters.
   * @param {Object} [data.data] - The data to be passed to the function. If ommitted and call is used in a sequential command it will be passed from previous step.
   * @example
   *   hybrix.sequential([
   *     {func: (data,onSuccess,onError,onProgress)=>{                  // Declare a custom function
   *       onProgress(0.5);                                             // Set the progress to 50%
   *       setTimeout(onSuccess,2000,data+1);                           // Wait to seconds, then output result + 1
   *     }, data:1} , 'call'                                            // Provide the initial data
   *   ],
   *    onSuccess,                                                      // Define action to execute on successfull completion
   *    onError,                                                        // Define action to execute when an error is encountered
   *    onProgress                                                      // Define action to execute whenever there is a progress update
   );

  */
exports.call = fail => (data, dataCallback, errorCallback, progressCallback) => {
  let xdata;
  let func;
  if (typeof data === 'function') {
    func = data;
  } else if (typeof data === 'object' && data !== null && typeof data.func === 'function') {
    func = data.func;
    xdata = data.data;
  } else {
    fail('call: No function provided.', errorCallback);
    return;
  }
  // ensure callbacks are only used once, even on try-catch
  let callbackDone = false;
  const dataCallbackOnce = data => {
    if (callbackDone) {
      console.error(`Error: Repeated callback for 'call' method.`);
      return;
    }
    callbackDone = true;
    if (typeof dataCallback === 'function') dataCallback(data);
  };
  const errorCallbackOnce = error => {
    if (callbackDone) {
      console.error(`Error: Repeated callback for 'call' method.`);
      return;
    }
    callbackDone = true;
    fail(error, errorCallback);
  };
  try {
    func(xdata, dataCallbackOnce, errorCallbackOnce, progressCallback);
  } catch (error) {
    if (!callbackDone) errorCallbackOnce(error);
  }
};
