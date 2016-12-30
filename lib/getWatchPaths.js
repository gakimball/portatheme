'use strict';

const join = require('path').join;

/**
 * Create a set of glob patterns to watch in the build process.
 * @prop {String[]} locations - Theme paths to reference.
 * @returns {GulpFileList} List of files by category.
 */
module.exports = function getFiles(locations) {
  /**
   * Files for the build process to watch.
   * @typedef {Object} GulpFileList
   * @prop {String[]} assets - Static assets. The copying task is re-run when these files change.
   * @prop {String[]} sass - Sass source files. The Sass task is re-run when these files change.
   * @prop {String[]} js - JavaScript source files. The JavaScript task is re-run when these files change.
   */
  const files = {
    assets: [],
    sass: [],
    js: []
  }

  locations.map(location => {
    files.assets.push(
      join(location, '*.*'),
      join(location, 'assets/**/*')
    );

    files.sass.push(
      join(location, 'scss/**/*.scss')
    );

    files.js.push(
      join(location, 'js/**/*.js')
    );
  });

  return files;
}
