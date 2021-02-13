const NodeMw = require('nodemw');
const bluebird = require('bluebird');
const debug = require('@hellholt/debug')(__filename);
const NodeCache = require('node-cache');
const houseEmojiMap = require('./house_emoji');

const awoiafCache = new NodeCache({
  stdTTL: 0,
  checkperiod: 600,
});

const client = new NodeMw({
  protocol: 'https',
  server: 'awoiaf.westeros.org',
  path: '/',
  debug: true,
  userAgent: 'Hellholt',
  concurrency: 3,
});

const promiseClient = bluebird.promisifyAll(client);

const toTitleCase = (string) => string.replace(/[^\s]+/g, (word) => word.replace(/^./, (first) => first.toUpperCase()));

const getImageNameOfHouse = (house) => {
  debug('house', house);
  let imageMatches = house.match(/\s*\|\s*image\s*=\s*(?:\[\[File:)?(.*)\|.*/i);
  if (!imageMatches) {
    imageMatches = house.match(/\s*\|\s*image\s*=\s*(.*\.svg).*/i);
    if (!imageMatches) {
      return '';
    }
  }
  return imageMatches[1];
};

const getWordsOfHouse = (house) => {
  debug('house', house);
  const wordsMatches = house.match(/\s*\|\s*Words\s*=\s*''(.*)''/i);
  if (!wordsMatches) {
    return '';
  }
  return wordsMatches[1];
};

const getRegionOfHouse = (house) => {
  debug('house', house);
  const regionMatches = house.match(/\s*\|\s*Region\s*=\s*\[\[(.*)\]\]/i);
  if (!regionMatches) {
    return '';
  }
  return regionMatches[1].toLowerCase();
};

const getImageInfo = (imageName) => {
  const cacheKey = `image_info_${imageName}`;
  const cached = awoiafCache.get(cacheKey);
  if (cached) {
    return Promise.resolve(cached);
  }
  return promiseClient
    .getImageInfoAsync(`Image:${imageName}`)
    .then((imageInfo) => {
      awoiafCache.set(cacheKey, imageInfo);
      return imageInfo;
    });
};

const getImageObject = (imageInfo, houseId) => {
  debug('imageInfo', imageInfo);
  debug('houseId', houseId);
  return {
    path: `/images/houses/${houseId}.svg`,
    creator: `https://awoiaf.westeros.org/index.php/User:${imageInfo.user}`,
    license: 'https://creativecommons.org/licenses/by-sa/3.0/',
    original_url: imageInfo.descriptionurl,
    original_object: imageInfo,
  };
};

const getHouseNameFromPageTitle = (pageTitle) => {
  debug('pageTitle', pageTitle);
  return pageTitle
    .replace(/^House[\s_]*(of)?[\s_]*/, '')
    .replace(/[\s_]+of[\s_]+.*$/, '')
    .replace(/[\s_]+\(.*$/, '')
    .trim();
};

promiseClient.getHouse = (pageTitle) => {
  const cacheKey = `house_${pageTitle}`;
  const cached = awoiafCache.get(cacheKey);
  if (cached) {
    cached.cached = true;
    return Promise.resolve(cached);
  }
  return promiseClient
    .getArticleAsync(pageTitle)
    .then((house) => {
      debug('House', house);
      if (!house) {
        throw new Error('404 Not found');
      }
      awoiafCache.set(cacheKey, house);
      house.cached = false;
      return house;
    });
};

promiseClient.getHouseImageList = (pageTitle) => {
  const cacheKey = `house_image_list_${pageTitle}`;
  const cached = awoiafCache.get(cacheKey);
  if (cached) {
    cached.forEach((object) => {
      object.cached = false;
    });
    return Promise.resolve(cached);
  }
  return promiseClient
    .getImagesFromArticleAsync(pageTitle)
    .then((images) => {
      debug('Images', images);
      if (!images || !images.length) {
        throw new Error('404 Not found');
      }
      awoiafCache.set(cacheKey, images);
      images.forEach((object) => {
        object.cached = false;
      });
      return images;
    });
};

promiseClient.getHousePages = () => {
  const cacheKey = 'house_pages';
  const cached = awoiafCache.get(cacheKey);
  if (cached) {
    cached.forEach((object) => {
      object.cached = false;
    });
    return Promise.resolve(cached);
  }
  return promiseClient
    .getPagesInCategoryAsync('Noble_houses')
    .then((pages) => {
      awoiafCache.set(cacheKey, pages);
      pages.forEach((object) => {
        object.cached = false;
      });
      return pages;
    });
};

promiseClient.getHousePageTitles = () => {
  return promiseClient
    .getHousePages()
    .then((pages) => pages.filter((page) => page.ns === 0).map((page) => page.title))
    .then((pageTitles) => pageTitles.filter((pageTitle) => pageTitle.startsWith('House ')));
};

promiseClient.getHouseNames = () => {
  return promiseClient.getHousePageTitles()
    .then((pageTitles) => pageTitles.map((pageTitle) => getHouseNameFromPageTitle(pageTitle)))
    .then((houseNames) => Array.from(new Set(houseNames)));
};

promiseClient.getHouseImageName = (pageTitle) => promiseClient.getHouse(pageTitle).then((house) => getImageNameOfHouse(house));

promiseClient.getHouseImageInfo = (pageTitle) => promiseClient.getHouseImageName(pageTitle).then((imageName) => getImageInfo(imageName));

promiseClient.getHouseWords = (pageTitle) => promiseClient.getHouse(pageTitle).then((house) => getWordsOfHouse(house));

const getHouseEmoji = (houseName) => {
  return houseEmojiMap[houseName] || '';
};

promiseClient.getHouseData = async (pageTitle) => {
  return promiseClient.getHouse(pageTitle)
    .then(async (house) => {
      const houseName = getHouseNameFromPageTitle(pageTitle);
      const id = houseName.toLowerCase().replace(' ', '_');
      const name = toTitleCase(houseName);
      const words = getWordsOfHouse(house);
      const imageName = getImageNameOfHouse(house);
      const region = getRegionOfHouse(house);
      const emoji = getHouseEmoji(id);
      const arms = [];
      if (imageName) {
        const imageInfo = await getImageInfo(imageName);
        if (imageInfo) {
          const imageObject = getImageObject(imageInfo, id);
          arms.push(imageObject);
        }
      }
      return {
        id: id,
        name: name,
        emoji: emoji,
        words: words,
        arms: arms,
        region: region,
      };
    });
};

promiseClient.getHouses = async () => {
  return promiseClient.getHousePageTitles()
    .then((pageTitles) => {
      const result = [];
      pageTitles.forEach((pageTitle) => {
        const houseName = getHouseNameFromPageTitle(pageTitle);
        if (!result[houseName]) {
          result[houseName] = pageTitle;
        }
      });
      return result;
    })
    .then((houseNames) => Promise.all(Object.keys(houseNames).map((houseName) => promiseClient.getHouseData(houseName))));
};

exports.client = promiseClient;
