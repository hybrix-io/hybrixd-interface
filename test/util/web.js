let host = 'http://localhost:1111/';

function getParameterByName (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name.toLowerCase() + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function go (main, render) {
  return function () {
    const symbolsToTest = getParameterByName('symbol');
    const hybrix = new Hybrix.Interface({XMLHttpRequest: XMLHttpRequest});
    DEBUG = getParameterByName('debug') === 'true';

    if (getParameterByName('host')) host = getParameterByName('host');

    const progressCallback = progress => {
      document.body.innerHTML = '<div style="border-style:solid; border-width:1px; border-radius:10px; height:20px;"><div style="text-align:center;color:white;background-color:blue; border-radius:10px; height:20px; width:' + (progress * 100) + '%">' + Math.floor(progress * 100) + '%</div></div>';
    };

    const renderCallback = data => { document.body.innerHTML = render.web(data); };
    main.runTests(symbolsToTest, hybrix, host, renderCallback, progressCallback);
  };
}

exports.go = go;
