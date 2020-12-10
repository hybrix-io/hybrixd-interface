const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './lib/interface.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: '../dist/hybrixd.interface.web.js.tmp',
    library: 'Hybrix' // added to create a library file
  },
  resolve: {
    fallback: {
      fs: false,
      http: false,
      https: false,
      crypto: false,
      assert: require.resolve('assert'),
      util: require.resolve('util'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      zlib: require.resolve('browserify-zlib')
    }
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
