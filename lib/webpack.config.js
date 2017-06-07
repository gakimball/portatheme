const path = require('path');
const fromPairs = require('lodash.frompairs');

/**
 * Generate a Webpack config object.
 * @param {String[]} locations - List of theme locations.
 * @param {Boolean} [watch] - Enable file watching.
 * @returns {Object} Webpack config.
 */
module.exports = (locations, watch) => ({
  watch: watch || false,
  output: {
    filename: 'script.js'
  },
  resolve: {
    alias: fromPairs(locations.slice(1).map(location => [
      path.basename(location),
      location
    ]))
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  }
});
