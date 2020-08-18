const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './test/lib/web.js',

  output: {
    path: path.resolve(__dirname, '.'),
    filename: '../test/test.web.js',
    library: 'HybrixTest' // added to create a library file
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
