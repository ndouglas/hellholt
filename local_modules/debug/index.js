const unsafeRequire = require;
const debug = unsafeRequire('debug');

exports = (filePath) => {
  return debug(filePath.replace(/.*\/hellholt\//, 'hellholt/'));
};

module.exports = exports;
