'use strict';

const path = require('path');

/**
 * Create an Eyeglass configuration object tuned to the current theme setup.
 *   - If `locations` has a length of 1, then the theme being used doesn't inherit anything. No special config is needed.
 *   - If `locations` has a length greater than 1, then the theme inherits the Sass files of its parent. Special aliases are created in Eyeglass that point to the Sass files of the parent themes.
 * For example, if a theme at the path `themes/base/` inherits from `themes/parent`, the alias `parent` is created to point to `themes/parent/scss/index.scss`. Writing `@import "parent";` will import the parent theme's Sass file.
 *
 * @param {String[]} locations - List of theme locations.
 * @returns {Object} Eyeglass config object, or `undefined` if it's not necessary.
 */
module.exports = locations => {
  if (locations.length > 1) {
    return {
      eyeglass: {
        modules: locations.slice(1).map(location => ({
          name: path.basename(location),
          main: () => ({
            sassDir: path.join(location, 'scss')
          })
        }))
      }
    };
  }
};
