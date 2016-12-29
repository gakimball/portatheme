'use strict';

const path = require('path');

/**
 * Get the location of a theme.
 *   - Try to find it in node_modules first.
 *   - Then try to find it relative to the current working directory.
 * @param {String} location - Theme location.
 * @returns {String} Full path to theme.
 */
module.exports = function getLocation(location) {
  try {
    return require.resolve(location);
  }
  catch (e) {
    return path.resolve(location);
  }
}
