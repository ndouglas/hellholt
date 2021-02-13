const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

const express = require('express');
const bodyParser = require('body-parser');

const awoiaf = require('./awoiaf');
const routes = require('./routes').getRoutes();
const schema = require('./schema');
const storage = require('./storage');

const dependencies = {
  routes: routes,
  schema: schema,
  storage: storage,
  awoiafClient: awoiaf.client,
};

exports.getApp = () => express()
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
  .use('/', routes)
  .use((error, req, res, next) => {
    debug('Error', error);
    debug('Request', req);
    debug('Response', res);
    next(util.wrapError(error, 'Failed to respond to request!'));
  });
