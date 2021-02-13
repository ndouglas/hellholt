const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

const router = Router({ mergeParams: true });
module.exports = router;

router.route('/awoiaf/houses/:id/raw')
  .all(async (req, res, next) => {
    next();
  })
  .get(async (req, res, next) => {
    try {
      debug('Request', req);
      debug('Response', res);
      const id = req.params.id;
      const awoiafClient = req.dependencies.awoiafClient;
      const house = await awoiafClient.getHouse(id);
      if (!house) {
        res.status(404).send('404 Not found');
      }
      else {
        res.send(house);
      }
    }
    catch (error) {
      debug('Error', error);
      next(util.wrapError(error, `Error responding to request ${req}`));
    }
  });
