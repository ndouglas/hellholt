const Router = require('express').Router;
const debug = require('@hellholt/debug')(__filename);
const util = require('@hellholt/util');

const router = Router({ mergeParams: true });
module.exports = router;

router.route('/awoiaf/update_houses')
  .all(async (req, res, next) => {
    next();
  })
  .get(async (req, res, next) => {
    try {
      debug('Request', req);
      debug('Response', res);
      const awoiafClient = req.dependencies.awoiafClient;
      const pageTitles = await awoiafClient.getHousePageTitles();
      if (!pageTitles) {
        return res.status(404).send('404 Not found');
      }
      const storage = req.dependencies.storage;
      const responseBody = [];
      const houseDataPromises = pageTitles.map((pageTitle) => awoiafClient.getHouseData(pageTitle).catch((error) => {}));
      const houseDataCollection = await Promise.all(houseDataPromises);
      const updatedHouseDataPromises = houseDataCollection.map((houseData) => storage.updateHouseData(houseData).catch((error) => {}));
      const updatedHouseDataCollection = await Promise.all(updatedHouseDataPromises);
      res.status(200).send(JSON.stringify(updatedHouseDataCollection, null, 2));
    }
    catch (error) {
      debug('Error', error);
      next(util.wrapError(error, `Error responding to request ${req}`));
    }
  });
