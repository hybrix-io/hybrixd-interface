const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  target: 'node',
  entry: './lib/interface.nodejs.js.tmp',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: '../dist/hybrix-lib.nodejs.js',
    library: 'Hybrix',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/
      }
    ]
  },
  optimization: {
    minimizer: [new TerserPlugin()]
  }
};
