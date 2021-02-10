const debug = require('@hellholt/debug')(__filename);

const lib = require('./src');

const app = lib.getApp();

const server = app.listen(3000, () => {
  debug(`Listening on port ${server.address().port}`);
});
