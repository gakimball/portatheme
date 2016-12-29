'use strict';

const compile = require('./lib/compile');
const fs = require('fs');
const getLocation = require('./lib/getLocation');
const path = require('path');
const pify = require('pify');
const pug = require('pug');

const mkdirp = pify(require('mkdirp'));
const writeFile = pify(fs.writeFile);

/**
 * Theme class. Stores a reference to a theme and its parent, and allows pages and assets to be compiled.
 */
module.exports = class Theme {
  /**
   * Create a new theme.
   * @param {String} location - Node module or folder containing theme.
   * @param {Theme} [parent] - Theme to inherit.
   */
  constructor(location, parent) {
    /**
     * Folder containing theme assets.
     * @constant
     * @type String
     */
    this.location = getLocation(location);

    /**
     * Paths to parent themes.
     * @constant
     * @type String[]
     */
    this.parents = parent
      ? [parent.location].concat(parent.parents)
      : [];

    /**
     * Folder to output theme files to.
     * @type ?String
     */
    this.dest = null;

    /**
     * Function to run build process.
     * @type ?Function
     */
    this.compiler = null;
  }

  /**
   * Set destination directory for builds.
   * @param {String} location - Path to set.
   */
  outputTo(location) {
    if (typeof location !== 'string') {
      throw new Error('Theme.outputTo(): path must be a string.');
    }

    if (path.isAbsolute(location)) {
      this.dest = location;
    }
    else {
      this.dest = path.join(process.cwd(), location);
    }

    this.compiler = compile([this.location].concat(this.parents), this.dest);
  }

  /**
   * Compile a Pug template with an object of data.
   * @param {String} dest - Path relative to base output directory to write file to.
   * @param {Object} [data] - Locals to pass to Pug renderer.
   * @param {String} [layout='default'] - Theme template to use when rendering.
   * @returns {Promise} Promise which resolves when the file has been written, or rejects if there's an error.
   */
  compilePage(dest, data, layout) {
    if (this.dest === null) {
      return Promise.reject(new Error('Theme.compilePage(): no output directory has been set. Use Theme.outputTo() to set one.'));
    }

    const outputPath = path.join(this.dest, dest);
    const outputDir = path.dirname(outputPath);
    const template = path.join(this.location, `templates/${layout || 'default'}.pug`);
    return mkdirp(outputDir).then(() => writeFile(outputPath, this.compileString(data, layout)));
  }

  /**
   * Compile a Pug template to a string.
   * @param {Object} [data] - Locals to pass to Pug renderer.
   * @param {String} [layout='default'] - Theme template to use when rendering.
   * @returns {String} Rendered HTML string.
   */
  compileString(data, layout) {
    const template = path.join(this.location, `templates/${layout || 'default'}.pug`);
    return pug.renderFile(template, data || {});
  }

  /**
   * Run the asset building process for the theme.
   * @returns {Promise} Promise which resolves when the build process is finished, or rejects if there's an error.
   */
  build() {
    if (this.dest === null) {
      return Promise.reject(new Error('Theme.build(): no output directory has been set. Use Theme.outputTo() to set one.'));
    }

    return this.compiler();
  }

  /**
   * Run the asset building process for the theme, then watch for changes.
   * @returns {Promise} Promise which rejects if the build process encounters an error.
   */
  buildAndWatch() {
    if (this.dest === null) {
      return Promise.reject(new Error('Theme.buildAndWatch(): no output directory has been set. Use Theme.outputTo() to set one.'));
    }

    return this.compiler('watch', { watch: true });
  }
}
