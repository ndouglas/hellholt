const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

const router = Router({ mergeParams: true });
module.exports = router;

router.route('/api/castles/:id')
  .all(async (req, res, next) => {
    next();
  })
  .get(async (req, res, next) => {
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
  })
  .put(async (req, res, next) => {
    next(new Error('not implemented'));
  })
  .delete(async (req, res, next) => {
    next(new Error('not implemented'));
  });
