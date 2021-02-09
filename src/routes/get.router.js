const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

module.exports = Router({ mergeParams: true })
  .get('/', async (req, res, next) => {
    try {
      debug('Request', req);
      debug('Response', res);
      res.send('/');
    }
    catch (error) {
      debug('Error', error);
      next(util.wrapError(error, `Error responding to request ${req}`));
    }
  });
