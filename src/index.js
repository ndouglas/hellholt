const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

const express = require('express');
const bodyParser = require('body-parser');

exports.routes = require('./routes').getRoutes();
exports.storage = require('./storage');

exports.getApp = (dependencies) => express()
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use((req, res, next) => {
    debug('Request', req);
    debug('Response', res);
    req.base = `${req.protocol}://${req.get('host')}`;
    req.dependencies = dependencies;
    return next();
  })
  .use(express.static('./static'))
  .use('/', dependencies.routes)
  .use((error, req, res, next) => {
    debug('Error', error);
    debug('Request', req);
    debug('Response', res);
    next(util.wrapError(error, 'Failed to respond to request!'));
  });
