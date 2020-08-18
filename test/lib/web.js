const render = require('./render.js');
const main = require('./main.js');
const web = require('./../util/web');

window.go = web.go(main, render);
