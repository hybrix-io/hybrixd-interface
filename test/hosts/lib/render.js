const hostTests = require('./main');
const renderLib = require('../../util/render');

const renderTableCLI = data => {
  const messages = [];
  const newMessages = [];
  let r = '\n';
  for (let symbol in data.assets) {
    r += symbol.toUpperCase() + ' ';
    r += renderLib.renderSymbol(renderLib.renderCellCLI, symbol, data.assets[symbol], messages, newMessages).join('');
    r += '\n';
  }
  r += '\n';
  r += 'Issues:\n';
  newMessages.sort();
  for (let i = 0; i < newMessages.length; ++i) {
    r += ' - ' + newMessages[i] + '\n';
  }
  r += '\n';

  r += '      SUCCESS RATE: ' + Math.floor((((data.total - data.failures) / data.total) || 0) * 100) + '%' + '\n';
  return r;
};

const renderTableWeb = data => {
  const messages = [];
  const newMessages = [];
  let r = `
        <style>:target {
          background-color: yellow;
        }
        .hostTests th {
          text-align: left;
        }
        .hostTests td {
          width: 20px;
        }
        .hostTests td:first-child {
          padding-right: 10px;
        }
        .hostTests td:hover {
          cursor: pointer;
        }
        .hostTests td:hover > .hostName {
          display: block;
        }
        .hostTests .hostName {
          position: absolute;
          background: yellow;
          display: none;
          margin-top: -35px;
          margin-left: 15px;
          padding: 2px;
          border: 1px solid black;
        }
        .hostTests .hostIssueTitle {
          float: left;
          width: 70px;
        }
        </style>
        <span style="margin-right: 40px;"><b>Symbol</b></span><span><b>Hosts</b></span>
        <table class="hostTests">
        `;
  for (let symbol in data.assets) {
    r += '<tr>';
    r += '<td>' + symbol + '</td>';
    r += renderLib.renderSymbol(renderLib.renderCellWeb, symbol, data.assets[symbol], messages, newMessages).join('');
    r += '</tr>';
  }
  r += '</table>';
  r += '<h3>New Issues</h3>';
  r += '<ul>';
  newMessages.sort();
  for (let i = 0; i < newMessages.length; ++i) {
    r += '<li>' + newMessages[i] + '</li>';
  }
  r += '</ul>';
  r += '<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>';
  r += '<ul>';
  messages.sort();
  for (let i = 0; i < messages.length; ++i) {
    r += '<li>' + messages[i] + '</li>';
  }
  r += '</ul>';

  r += '<h1>' + ((data.total - data.failures) / data.total * 100) + '%</h1>';
  return r;
};

exports.cli = renderTableCLI;
exports.web = renderTableWeb;
