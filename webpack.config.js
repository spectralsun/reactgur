/* eslint-env node */

module.exports = {
  entry: [
    './client/Reactgur.js'
  ],
  output: {
    path: __dirname,
    filename: 'reactgur/static/bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel'],
      },
    ],
  },
  plugins: [
  ]
};