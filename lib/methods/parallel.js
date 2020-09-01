function stringify (data) {
  return typeof data === 'string' ? data : JSON.stringify(data);
}

/**
   * Parallely executes several threads and collects results in a single object.
   * @category Flow
   * @param {Object} data - Parallel steps to be processed.
   * @param {Object} data.$label - A label given to the thread.
   * @param {Object} data.$label.data - The initial data passed to this thread.
   * @param {Object} data.$label.step - The step to execute with the data. Use 'sequential' to create multi step thread process.
   * @param {Object} [data._options] - An options object
   * @param {Object} [data._options.passErrors=false] - Whether to pass error results to the collected results object.

   * @example
   * hybrix.sequential([
   * {host: 'http://localhost:1111/'}, 'addHost',
   * {fee: {data:{query:'/asset/dummy/fee'}, step: 'rout'}, factor: {data:{query:'/asset/dummy/factor'}, step: 'rout'}} , 'parallel'
   * ]
   *   , onSuccess
   *   , onError
   *   , onProgress
   * );
   */
exports.parallel = fail => function (data, dataCallback, errorCallback, progressCallback) {
  const options = data._options || {};
  delete data._options;

  const steps = data;
  const stepCount = Object.keys(steps).length;
  if (stepCount === 0) {
    dataCallback({});
    return;
  }

  const resultMarks = {};
  const resultProgress = {};
  for (let i in steps) resultProgress[i] = 0;

  let parallelProgressCallback;
  if (typeof progressCallback === 'function') {
    parallelProgressCallback = () => {
      let totalProgress = 0;
      for (let i in steps) totalProgress += resultProgress[i];
      progressCallback(totalProgress / stepCount);
    };
  }

  const resultData = {};

  const dataSubCallback = i => result => {
    if (resultMarks.hasOwnProperty(i)) return;

    resultProgress[i] = 1;
    resultMarks[i] = true;
    resultData[i] = result;
    if (typeof progressCallback === 'function') parallelProgressCallback();
    for (let step in steps) {
      if (!resultMarks.hasOwnProperty(step)) return;
    }
    dataCallback(resultData);
  };

  const errorSubCallback = i => error => {
    if (resultMarks.hasOwnProperty(i)) return;

    resultMarks[i] = false;
    resultProgress[i] = 1;
    resultData[i] = options.passErrors ? ('ERROR:' + stringify(error)) : undefined;
    if (typeof progressCallback === 'function') parallelProgressCallback();
    let success = false;
    for (let step in steps) {
      if (resultMarks[step] === true) success = true;
      if (!resultMarks.hasOwnProperty(step)) return;
    }
    if (success) dataCallback(resultData);
    else errorCallback(resultData);
  };
  let subProgressCallback;
  if (typeof progressCallback === 'function') {
    subProgressCallback = i => progress => {
      resultProgress[i] = progress;
      parallelProgressCallback();
    };
  } else subProgressCallback = i => progress => {};

  const executeStep = (i, step, data) => {
    if (typeof step === 'string') {
      if (this.hasOwnProperty(step)) this[step](data, dataSubCallback(i), errorSubCallback(i), subProgressCallback(i));
      else errorSubCallback(i)('Method \'' + step + '\' does not exist.');
    } else if (typeof step === 'function') step(data, dataSubCallback(i), errorSubCallback(i), subProgressCallback(i));
    else errorSubCallback(i)('Expected function or method name.');
  };

  for (let i in steps) {
    const step = steps[i];
    if (typeof step === 'object') {
      if (step instanceof Array) executeStep(i, 'sequential', step);
      else if (step.hasOwnProperty('step')) {
        if (step.hasOwnProperty('data')) executeStep(i, step.step, step.data);
        else executeStep(i, step.step, data);
      } else errorSubCallback(i)('No step defined.');
    } else executeStep(i, step, data);
  }
};
