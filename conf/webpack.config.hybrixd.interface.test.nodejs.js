const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  target: 'node',
  entry: './test/lib/main.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: '../dist/test.js',
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
