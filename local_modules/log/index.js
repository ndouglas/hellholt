const debug = require('@hellholt/debug');

const logLevels = {
  emerg: 0,
  alert: 1,
  crit: 2,
  error: 3,
  warning: 4,
  notice: 5,
  info: 6,
  debug: 7,
};

const maxLevel = logLevels[process.env.LOG_LEVEL || 'error'];

/**
 * Minor (< error) logging.
 *
 * @param {string} filename - The filename calling this statement.
 *
 * @param {number} level - The log level of the message.
 *
 * @param {mixed} args - The arguments.
 */
const logFunction = (filename, level, ...args) => {
  debug(filename)(...args);
  if (logLevels[level] <= maxLevel) {
    if (logLevels[level] <= logLevels.error) {
      console.error(...args);
    }
    else {
      console.log(...args);
    }
  }
};

exports = (filename) => {
  return {
    emergency: (...args) => logFunction(filename, 'emerg', ...args),
    alert: (...args) => logFunction(filename, 'alert', ...args),
    critical: (...args) => logFunction(filename, 'crit', ...args),
    error: (...args) => logFunction(filename, 'error', ...args),
    warning: (...args) => logFunction(filename, 'warning', ...args),
    notice: (...args) => logFunction(filename, 'notice', ...args),
    info: (...args) => logFunction(filename, 'info', ...args),
    debug: (...args) => logFunction(filename, 'debug', ...args),
  };
};

module.exports = exports;
