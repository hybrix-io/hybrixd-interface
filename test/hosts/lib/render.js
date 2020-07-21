const hostTests = require('./main');
const issueLib = require('../../util/issue')
const renderLib = require('../../util/render')

const renderSymbol = (renderCell, symbol, data, messages, newMessages) => {
  const results = [];
  for(let testId in data) {
    const x = data[testId];
    const result = x.result

    for (type_ in result) {
      const valid = x.result[type_];
      const known = x.known;
      const result = x.result;
      const validationMessages = data.messages;

      const testResult = renderCell(symbol, testId, valid, known, result, messages, newMessages, true);

      results.push(testResult);
    }
  }

  return results;
};

const renderCellCLI = (symbol, testId, validity, known, result, messages, newMessages) => {
  const title = renderLib.stringify(result).replace(/"/g, '');
  const type_ = typeof result !== 'undefined' && result !== null ? Object.keys(result)[0] : '';
  const typeString = typeof result !== 'undefined' && result !== null ? type_ + ' host' : 'host';
  const valid = validity === "Success";

  if(known){
    if(valid){
      if(known.link){
        messages.push('\033[36m'+symbol+ ' '+ typeString +'\033[0m : '+known.message);
      }else{
        messages.push('\033[36m'+symbol+ ' '+ typeString +'\033[0m : '+known.message+ ' \033[31m [Create issue]\033[0m');
      }
      return {[type_]: '\033[36m OK  \033[0m'};
    }else{
      if(known.link){
        messages.push('\033[33m'+symbol+ ' '+ typeString +'\033[0m : '+known.message+' (Returned '+ title+')');
      }else{
        messages.push('\033[33m'+symbol+ ' '+ typeString +'\033[0m : '+known.message+ ' \033[31m [Create issue]\033[0m');
      }
      return {[type_]: '\033[33m WARN\033[0m'};
    }
  } else if (valid) {
    return {[type_]: '\033[32m OK  \033[0m'};
  } else {
    newMessages.push(symbol.toUpperCase() + '\033[31m ' + typeString + '\033[0m : host ping failed. \033[31m [Create issue]\033[0m');
    return {[type_]: '\033[31m FAIL\033[0m'};
  }
};

const renderTableCLI = data => {
  const messages = [];
  const newMessages = [];
  let r = '\n';
  for (let symbol in data.assets) {
  r += symbol.toUpperCase() + '\n';

  const results = renderSymbol(renderCellCLI, symbol, data.assets[symbol],messages,newMessages).reduce((acc, type_) => ({...acc, ...type_}), {});
  const resultsCells = Object.keys(results).reduce((acc, hostUrl, i) => {
    const typeResult = results[hostUrl];
    return `${acc}${typeResult} - ${hostUrl}\n`
  }, '');
  r += resultsCells
    r += '\n';
  }
  r += '\n';
  r += 'New Issues:\n';
  newMessages.sort();
  for (let i =0;i<newMessages.length;++i) {
    r+= ' - '+newMessages[i]+'\n';
  }
  r += '\n';
  r += 'Known Issues:\n';
  messages.sort();
  for (let i =0;i<messages.length;++i) {
    r+= ' - '+messages[i]+'\n';
  }
  r += '\n';
  r += '      SUCCESS RATE: ' + Math.floor((((data.total-data.failures) / data.total) || 0) * 100) + '%' + '\n';
  return r;
}

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
    r += renderSymbol(renderLib.renderCellWeb, symbol, data.assets[symbol], messages, newMessages).join('');
    r += '</tr>';
  }
  r += '</table>';
  r += '<h3>New Issues</h3>';
  r += '<ul>';
  newMessages.sort();
  for (let i =0;i<newMessages.length;++i) {
    r += '<li>'+newMessages[i]+'</li>';
  }
  r += '</ul>';
  r += '<h3><a href="https://gitlab.com/groups/hybrix/-/issues?milestone_title=Coin+support+%3A+Test+Issues" target="_blank">Known Issues</a></h3>';
  r += '<ul>';
  messages.sort();
  for (let i =0;i<messages.length;++i) {
    r += '<li>'+messages[i]+'</li>';
  }
  r += '</ul>';


  r += '<h1>' + ((data.total-data.failures) / data.total * 100) + '%</h1>';
  return r;
};

exports.cli = renderTableCLI;
exports.web = renderTableWeb;
exports.renderSymbol = renderSymbol;
