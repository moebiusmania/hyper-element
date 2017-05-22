'use strict';

const path = require('path');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: [
    './src/index.js'
  ],
  output: {
    path: path.join(__dirname, './demo'),
    filename: 'app.js',
  },
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true
    }),
    new WebpackNotifierPlugin({
      title: 'hyper-element',
      alwaysNotify: true
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'text-loader' ]
      },
      {
        test: /\.html$/,
        use: [ 'text-loader' ]
      }
    ]
  },
  devServer: {
    contentBase: './'
  },
  resolve: {
    mainFields: ['browserify', 'browser', 'module', 'main']
  }
}