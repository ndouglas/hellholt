const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

module.exports = Router({ mergeParams: true })
  .get('/api/castles/:id', async (req, res, next) => {
    try {
      debug('Request', req);
      debug('Response', res);
      const storage = req.dependencies.storage;
      const id = req.params.id;
      const castle = await storage.getCastleById(id);
      if (!castle) {
        res.status(404).send('404 Not found');
      }
      else {
        res.send(JSON.stringify(castle, null, 2));
      }
    }
    catch (error) {
      debug('Error', error);
      next(util.wrapError(error, `Error responding to request ${req}`));
    }
  });
