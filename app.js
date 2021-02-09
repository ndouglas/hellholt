const debug = require('@hellholt/debug')(__filename);

const lib = require('./src');

const dependencies = {
  routes: lib.routes,
  storage: lib.storage,
};

const app = lib.getApp(dependencies);

const server = app.listen(3000, () => {
  debug(`Listening on port ${server.address().port}`);
});
