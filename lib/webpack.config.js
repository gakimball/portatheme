/**
 * Generate a Webpack config object.
 * @param {Boolean} [watch] - Enable file watching.
 * @returns {Object} Webpack config.
 */
module.exports = function webpackConfig(watch) {
  return {
    watch: watch || false,
    output: {
      filename: 'script.js'
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
  };
}
