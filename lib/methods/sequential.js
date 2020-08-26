/**
   * Sequentually executes functions and passes results to next step.
   * @category Flow
   * @param {Array.<string|Object|Function>} data - Sequential steps to be processed. An object indicates data that is supplied to the next step. A function is a transformation of the data of the previous step and given to the next step. A string is a method that used the data from the last step and supplies to the next step.
   * @example
   * hybrix.sequential([
   * 'init',
   * {username: 'DUMMYDUMMYDUMMY0', password: 'DUMMYDUMMYDUMMY0'}, 'session',
   * {data:'Hello World!'}, 'encrypt',
   * data=>{return {data:data}}, 'decrypt'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.sequential = fail => function (data, dataCallback, errorCallback, progressCallback, currentStep, totalSteps) {
  if (data instanceof Array) {
    data = {steps: data};
  } else if (!(typeof data === 'object' && data !== null && data.steps instanceof Array)) {
    return fail('Expected an array to define sequentials steps', errorCallback);
  }

  if (typeof currentStep === 'undefined') {
    currentStep = 0;
    totalSteps = data.steps.length;
  }

  if (data.steps.length === 0) {
    if (typeof progressCallback === 'function') progressCallback(1);
    dataCallback(data.data);
  } else {
    if (typeof progressCallback === 'function') progressCallback(currentStep / totalSteps);

    let step = data.steps[0];
    if (typeof step === 'string') {
      if (this.hasOwnProperty(step)) {
        if (DEBUG) console.log('this.' + step + '(' + JSON.stringify(data.data) + ')');

        let subStepProgressCallback;
        if (typeof progressCallback === 'function') {
          subStepProgressCallback = progress => progressCallback((currentStep + progress) / totalSteps);
        }

        if (step === 'call' && typeof data.data === 'object' && data.data !== null && !data.data.hasOwnProperty('data') && data.data.hasOwnProperty('func')) {
          data.data.data = data.prevData; // use previous data for 'call' method
        }

        return this[step](data.data, resultData => {
          this.sequential({data: resultData, steps: data.steps.slice(1), prevData: data.data}, dataCallback, errorCallback, progressCallback, currentStep + 1, totalSteps);
        }, errorCallback, subStepProgressCallback);
      } else {
        return fail('Method \'' + step + '\' does not exist.', errorCallback);
      }
    } else if (typeof step === 'object') {
      if (DEBUG) console.log(JSON.stringify(data.data) + ' => ' + JSON.stringify(step));
      return this.sequential({data: step, steps: data.steps.slice(1), prevData: data.data}, dataCallback, errorCallback, progressCallback, currentStep + 1, totalSteps);
    } else if (typeof step === 'function') {
      let result;
      try {
        result = step(data.data);
        if (DEBUG) console.log(JSON.stringify(data.data) + ' => ' + JSON.stringify(result));
      } catch (e) {
        return fail(e);
      }
      return this.sequential({data: result, steps: data.steps.slice(1), prevData: data.data}, dataCallback, errorCallback, progressCallback, currentStep + 1, totalSteps);
    }
  }
};
