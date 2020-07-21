const ProgressBar = require('progress');

let lastP;
let bar;

function makeProgressBar (title) {
  bar = new ProgressBar(' [.] ' + title + ': [:bar] :percent, eta: :etas', {
    complete: '▓',
    incomplete: '░',
    width: 76 - title.length,
    total: 100
  });
}

makeProgressBar('test progress');

const progressCallback = (isQuiet, isVerbose) => (progress) => {
  if (!isQuiet) {
    if (isVerbose) {
      const s = String(progress * 100).split('.');
      let P;
      if (s.length === 1) {
        P = s[0] + '.0';
      } else {
        P = s[0] + '.' + s[1][0];
      }
      if (P !== lastP) {
        process.stdout.write(P + '%\r');
        lastP = P;
      }
    } else {
      bar.update(progress);
    }
  }
};

exports.progressCallback = progressCallback