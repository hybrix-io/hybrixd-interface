function issueLink (symbol, type, issue, title) {
  const description = issue && issue.message
    ? issue.message
    : 'returned ' +  title;
  return `https://gitlab.com/hybrix/hybrixd/node/issues/new?issue[description]=${encodeURIComponent(`/label ~"\\* Development Team \\*"\n/milestone %"DEV - asset maintenance - 2020-Q1"\n${description}`)}&issue[title]=${encodeURIComponent(symbol+' '+type+' '+description)}`;
}

module.exports = {
  link: issueLink
}