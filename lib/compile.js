'use strict';

const $ = require('gulp-load-plugins')();
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
const compile = module.exports = (location, destination) => GulpToGo((gulp, options) => {
  const files = {
    assets: [
      join(location, '*.*'),
      join(location, 'assets/**/*')
    ],
    sass: [
      join(location, 'scss/**/*.scss')
    ],
    js: [
      join(location, 'js/**/*.js')
    ]
  };

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
    return gulp.src(files.assets, { base: location })
      .pipe(gulp.dest(destination));
  }

  // Compile Sass to CSS
  function sass() {
    return gulp.src(join(location, 'scss/index.scss'))
      .pipe($.sass())
      .pipe($.rename('style.css'))
      .pipe(gulp.dest(join(destination, 'css')));
  }

  // Compile and bundle JS
  function js() {
    return gulp.src(join(location, 'js/index.js'))
      .pipe(webpack(webpackConfig(options.watch)))
      .pipe(gulp.dest(join(destination, 'js')));
  }
});