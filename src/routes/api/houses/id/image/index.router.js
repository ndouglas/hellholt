const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');
const stream = require('stream');

const router = Router({ mergeParams: true });
module.exports = router;

router.route('/api/houses/:id/image')
  .all(async (req, res, next) => {
    next();
  })
  .get(async (req, res, next) => {
    try {
      debug('Request', req);
      debug('Response', res);
      const storage = req.dependencies.storage;
      const id = req.params.id;
      const buffer = await storage.getHouseImagePng(id);
      const readStream = new stream.PassThrough();
      if (!buffer) {
        return res.status(404).send('404 Not found');
      }
      readStream.end(buffer);
      res.set('Content-Type', 'image/png');
      readStream.pipe(res);
    }
    catch (error) {
      debug('Error', error);
      next(util.wrapError(error, `Error responding to request ${req}`));
    }
  });
