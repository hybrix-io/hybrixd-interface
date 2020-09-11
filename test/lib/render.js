const renderLib = require('../util/render');

const renderTableCLI = data => {
  const messages = [];
  const newMessages = [];
  let r = '\n';
  r += '   #   SAMPLE                                    SEED                    ' + '\n';
  r += '      ┌────┬─────┬──────┬────┬──────┬──────┬────┬────┬────┬──────┬──────┬────┬────┐' + '\n';
  r += '      │Test│Sampl│Detail│Vald│Balnce│Unspnt│Hist│Tran│Vald│Balnce│Unspnt│Sign│Hash│' + '\n';
  for (let symbol in data.assets) {
    r += '      ├────┼─────┼──────┼────┼──────┼──────┼────┼────┼────┼──────┼──────┼────┼────┤' + '\n';
    r += symbol.substr(0, 5) + '     '.substr(0, 5 - symbol.length) + ' │';

    const results = renderLib.renderSymbol(renderLib.renderCellCLI, symbol, data.assets[symbol], messages, newMessages);
    //
    r += results[0] + '│';
    r += results[1] + ' │';
    r += ' ' + results[2] + ' │';
    r += results[3] + '│';
    r += ' ' + results[4] + ' │';
    r += ' ' + results[5] + ' │';
    r += results[6] + '│';
    r += results[7] + '│';
    r += results[8] + '│';
    r += ' ' + results[9] + ' │';
    r += ' ' + results[10] + ' │';
    r += results[11] + '│';
    r += results[12] + '│';
    r += '\n';
  }
  r += '      └────┴─────┴──────┴────┴──────┴──────┴────┴────┴────┴──────┴──────┴────┴────┘' + '\n';
  r += '\n';
  r += 'New Issues:\n';
  newMessages.sort();
  for (let i = 0; i < newMessages.length; ++i) {
    r += ' - ' + newMessages[i] + '\n';
  }
  r += '\n';
  r += 'Known Issues:\n';
  messages.sort();
  for (let i = 0; i < messages.length; ++i) {
    r += ' - ' + messages[i] + '\n';
  }
  r += '\n';
  r += '      SUCCESS RATE: ' + Math.floor((((data.total - data.failures) / data.total) || 0) * 100) + '%' + '\n';
  return r;
};

const renderTableWeb = data => {
  const messages = [];
  const newMessages = [];
  let r = `
<style>
:target {
 background-color: yellow;
}
</style>
<table><tr><td>Symbol</td><td colspan="2"></td><td colspan="7" style="text-align:center;">Sample</td><td colspan="5"  style="text-align:center;">Seed</td></tr>`;
  r += '<tr><td></td><td>Test</td><td>Sample</td><td>Details</td><td>Valid</td><td>Balance</td><td>Unspent</td>';
  r += '<td>History</td>';
  r += '<td>Transaction</td>';
  r += '<td>Valid</td><td>Balance</td><td>Unspent</td>';
  // r+='<td>History</td>'
  r += '<td>Sign</td><td>Hash</td></tr>';
  for (let symbol in data.assets) {
    r += '<tr>';
    r += '<td>' + symbol + '</td>';
    r += renderLib.renderSymbol(renderLib.renderCellWeb, symbol, data.assets[symbol], messages, newMessages, false).join('');
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
