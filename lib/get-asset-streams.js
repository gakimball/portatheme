'use strict';

const join = require('path').join;
const mergeStream = require('merge-stream');

/**
 * Create Gulp streams for the asset files contained within a set of themes. This function is necessary because we can't just call `gulp.src()` once on all the assets. Each theme's assets needs to have vinyl-fs's `base` option set to the folder of that theme.
 * @param {Gulp} gulp - Gulp instance to use.
 * @param {String[]} locations - Theme paths.
 * @returns {stream.Transform} Vinyl source stream containing all theme assets.
 */
module.exports = (gulp, locations) => {
  const streams = locations.map(location => gulp.src([
    join(location, '*.*'),
    join(location, 'assets/**/*')
  ], {
    base: location
  }));

  return mergeStream(streams);
};
