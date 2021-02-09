const debug = require('@hellholt/debug')(__filename);

/**
 * Wrap errors, preserving useful information.
 *
 * @param {Error} error - The original error.
 *
 * @param {string} message - Some error message.
 *
 * @return {Error} - A new error.
 */
exports.wrapError = (error, message) => {
  const result = new Error(message);
  result.code = error.code || undefined;
  result.stack += `\nCaused By:\n${error.extendedStack || error.stack}`;
  result.extendedStack = result.stack;
  result.underlyingError = error;
  debug('Error', result);
  return result;
};
