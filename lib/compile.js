'use strict';

const $ = require('gulp-load-plugins')();
const getWatchPaths = require('./getWatchPaths');
const getAssetStreams = require('./getAssetStreams');
const getEyeglassConfig = require('./getEyeglassConfig');
const GulpToGo = require('gulp-to-go');
const join = require('path').join;
const rimraf = require('rimraf');
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config');

/**
 * Compile a template.
 * @param {String} location - Location of theme.
 * @param {String} destination - Output folder.
 * @returns {Promise} Promise which resolves when compilation is done.
 */
const compile = module.exports = (locations, destination) => GulpToGo((gulp, options) => {
  const files = getWatchPaths(locations);

  // Build theme once
  gulp.task('default', gulp.series(clean, gulp.parallel(copy, sass, js)));

  // Build theme and watch for changes
  gulp.task('watch', gulp.parallel('default', () => {
    gulp.watch(files.assets, copy);
    gulp.watch(files.sass, sass);
    gulp.watch(files.js, js);
  }));

  // Clean dist folder
  function clean(done) {
    rimraf(destination, done);
  }

  // Copy static assets
  function copy() {
    return getAssetStreams(gulp, locations)
      .pipe(gulp.dest(destination));
  }

  // Compile Sass to CSS
  function sass() {
    return gulp.src(join(locations[0], 'scss/index.scss'))
      .pipe($.sass(getEyeglassConfig(locations)))
      .pipe($.rename('style.css'))
      .pipe(gulp.dest(join(destination, 'css')));
  }

  // Compile and bundle JS
  function js() {
    return gulp.src(join(locations[0], 'js/index.js'))
      .pipe(webpack(webpackConfig(locations, options.watch)))
      .pipe(gulp.dest(join(destination, 'js')));
  }
});
