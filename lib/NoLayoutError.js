'use strict';

/**
 * Custom error type thrown when a page is rendered with a layout that doesn't exist.
 */
module.exports = class NoLayoutError extends Error {
  /**
   * Create a new layout error instance.
   * @param {String} message - Error message.
   */
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
    this.message = message;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    else {
      this.stack = (new Error(message)).stack;
    }
  }
}
