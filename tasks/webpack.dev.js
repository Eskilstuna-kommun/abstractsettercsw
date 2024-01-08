const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  output: {
    path: `${__dirname}/../../ek-extern-2023/plugins`,
    publicPath: '/build/js',
    filename: 'abstractcsw.js',
    libraryTarget: 'var',
    libraryExport: 'default',
    library: 'Abstractcsw'
  },
  mode: 'development',
  module: {

  },
  devServer: {
    static: './',
    port: 9008,
    devMiddleware: {
      writeToDisk: true
    }
  }
});
