const issueLib = require('./issue')

function stringify(x){
  return typeof x === 'undefined' ? 'undefined' : JSON.stringify(x);
}

const renderTableJSON = data => {
  return stringify(data);
}

const renderTableXML = (renderSymbol) => (data, isTestingHosts) => {
  const messages = [];
  const newMessages = [];

  let r='';
  for (let symbol in data.assets) {
      r = renderSymbol(renderCellXML, symbol, data.assets[symbol],messages,newMessages, isTestingHosts).join('');
  }
  r='<?xml version="1.0" encoding="UTF-8" ?><testsuites id="hybrix" name="hybrix" tests="'+data.total+'" failures="'+(data.failures)+'" time="0.001"><testsuite id="testsuite.hybrix" name="hybrix" tests="'+data.total+'" failures="'+(data.failures)+'" time="0.001">'+r;
  r+='</testsuite></testsuites>';
  return r;
}

const renderCellXML = (symbol,testId, valid, known, result, messages,newMessages, isTestingHosts) => {
  const title = stringify(result).replace(/"/g, '');
  const type_ = isTestingHosts ? Object.keys(result)[0] : testId;
  const failureMsg = valid ? '<failure message="${title}" type="ERROR"></failure>' : ''

  return `
    <testcase id="${symbol + '_' + type_ + ' host'}" name="${symbol+' '+type_ + ' host'}" time="0.001">
      ${failureMsg}
    </testcase>`
};

const renderCellWeb = (symbol, type, validity, known, data, messages, newMessages, isTestingHosts) => {
  const title = stringify(data).replace(/"/g, '');
  const valid = typeof validity === 'string' ? (validity === 'Success') : validity;
  const text = isTestingHosts ? Object.keys(data)[0] : type;
  const issueText = symbol + ' ' + text;
  const issueTextDashed = symbol + '_' + text;
  const known_ = known || {};
  const message = isTestingHosts ? text : (known_.message || undefined)

  if (known) {
    const color = valid ? 'purple' : 'orange';
    messages.push(mkIssueLink(symbol, text, known_, message, known_.link, issueText, issueTextDashed, isTestingHosts))
    return mkCell(color, title, issueTextDashed, issueText, isTestingHosts)
  } else if (valid) {
    return `<td style="text-align:center;background-color:green" title="${title}">&nbsp;</td>`;
  } else {
    newMessages.push(mkIssueLink(symbol, text, known_, title, known_.link, issueText, issueTextDashed, isTestingHosts))
    return mkCell('red', title, issueTextDashed, issueText, isTestingHosts);
  }
};

const mkIssueLink = (symbol, type, known, message, link, issueText, issueTextDashed, isTestingHosts) => {
  const href = link ? ` target="_blank" href="${link}"` : '';
  const linkTag = !link ? ` <a style="color:red;"target="_blank" href="${issueLib.link(symbol, type, known, message)}"><b>Create issue</b></a>` : '';
  const hosts = isTestingHosts ? `<span class="hostIssueTitle">${symbol.toUpperCase()}</span>` : '';
  const text = isTestingHosts ? '- Host ping failed' : issueText;

  return `
    ${hosts}
    <b style="color:red;">
      ${text}
    </b> :
    <a name="${issueTextDashed + href}">
      ${message}
    </a>
    ${linkTag}
  `;
}

const mkCell = (color, title, link, text, isHost) => `<td style="text-align:center;background-color:${color}" title="${title}"><a style="text-decoration:none; width: 100%;height: 100%;display: block;" href="#${link}">&nbsp;</a>${isHost ? '<span class="hostName">' + text + '</span>' : ''}</td>`;

exports.xml = renderTableXML;
exports.json = renderTableJSON;
exports.renderCellWeb = renderCellWeb
exports.stringify = stringify