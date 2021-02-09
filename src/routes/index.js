const glob = require('glob');
const Router = require('express').Router;

const unsafeRequire = require;

exports.getRoutes = () => glob
  .sync('**/*.router.js', { cwd: `${__dirname}/` })
  .map((filename) => unsafeRequire(`./${filename}`))
  .filter((router) => Object.getPrototypeOf(router) === Router)
  .reduce((rootRouter, router) => rootRouter.use(router), Router({ mergeParams: true }));
