const glob = require('glob-promise');
const fs = require('fs');
const axios = require('axios');
const getImageColors = require('get-image-colors');
const colorNamer = require('color-namer');
const svg2img = require('svg2img');

const fsP = fs.promises;

const dataPath = './data';
const staticPath = './static';

const readJson = (path) => fsP.readFile(path).then((data) => JSON.parse(data));

const buildCastles = () => glob
  .sync('castles/*.json', { cwd: dataPath })
  .map((filename) => readJson(`${dataPath}/${filename}`));

const buildHouses = () => glob
  .sync('houses/*.json', { cwd: dataPath })
  .map((filename) => readJson(`${dataPath}/${filename}`));

const castles = buildCastles();
const houses = buildHouses();

exports.getCastles = () => Promise.all(castles);

exports.getHouses = () => Promise.all(houses);

exports.getElementById = (list, id) => list.find((item) => item.id === id);

exports.getCastleById = async (id) => exports.getElementById(await this.getCastles(), id);

exports.getHouseById = async (id) => exports.getElementById(await this.getHouses(), id);

exports.getHouseImagePath = (id) => `${staticPath}/images/houses/${id}.svg`;

exports.setHouseImage = (id, data) => fsP.writeFile(exports.getHouseImagePath(id), data);

exports.downloadFile = (url, path) => {
  return axios({
    url: url,
    responseType: 'stream',
  }).then((response) => {
    const stream = fs.createWriteStream(path);
    return response.data
      .pipe(stream);
  });
};

exports.downloadHouseImage = (id, url) => exports.downloadFile(url, exports.getHouseImagePath(id));

exports.getSvgColors = (path) => {
  return getImageColors(path, 'image/svg+xml')
    .then((colors) => {
      const result = [];
      const found = [];
      colors.forEach((color) => {
        const hex = color.hex();
        if (found.indexOf(hex) === -1) {
          result.push(color);
          found.push(hex);
        }
      });
      return result;
    });
};

exports.getHouseImageColors = (id) => exports.getSvgColors(exports.getHouseImagePath(id));

exports.recalculateHouseData = async (data) => {
  const id = data.id;
  try {
    if (data.arms && data.arms.length) {
      if (!fs.existsSync(exports.getHouseImagePath(id))) {
        const houseImageUrl = data.arms[0].original_object.url;
        await exports.downloadHouseImage(id, houseImageUrl);
      }
      const houseColors = await exports.getHouseImageColors(id);
      data.colors = houseColors.map((color) => exports.getColorMap(color));
    }
  }
  catch (error) {
    console.error(error);
  }
  return data;
};

exports.updateHouseData = (data) => exports.setHouseData(exports.recalculateHouseData(data));

exports.setHouseData = (data) => fsP.writeFile(`${dataPath}/houses/${data.id}.json`, JSON.stringify(data, null, 2)).then(() => data);

exports.getTputColor = (r, g, b) => {
  const rWeighted = r < 75 ? 0 : (r - 35) / 40;
  const gWeighted = g < 75 ? 0 : (g - 35) / 40;
  const bWeighted = b < 75 ? 0 : (b - 35) / 40;
  return Math.floor(rWeighted * 6 * 6 + gWeighted * 6 + bWeighted + 16);
};

exports.getHouseTputColors = (id) => {
  return exports.getHouseImageColors(id)
    .then((colors) => colors.map((color) => color.rgb()))
    .then((rgbColors) => {
      return rgbColors.map((rgb) => {
        return exports.getTputColor(rgb[0], rgb[1], rgb[2]);
      });
    });
};

exports.getHumanColors = (hex) => {
  const colorNames = colorNamer(hex);
  const result = {};
  const dumbKeys = [
    'roygbiv',
  ];
  Object.keys(colorNames)
    .filter((key) => dumbKeys.indexOf(key) === -1)
    .forEach((key) => {
      result[key] = colorNames[key].sort((first, second) => first.distance < second.distance)[0].name;
    });
  return result;
};

exports.getHouseHumanColors = (id) => {
  return exports.getHouseImageColors(id)
    .then((colors) => colors.map((color) => color.hex()))
    .then((hexColors) => hexColors.map((hex) => exports.getHumanColors(hex)));
};

exports.getColorMap = (color) => {
  const hex = color.hex();
  const rgb = color.rgb();
  const tput = exports.getTputColor(rgb[0], rgb[1], rgb[2]);
  const names = exports.getHumanColors(hex);
  const result = {};
  result.hex = hex;
  result.rgb = rgb;
  result.tput = tput;
  Object.keys(names).forEach((key) => {
    result[key] = names[key];
  });
  return result;
};

exports.getHouseImagePng = (id, options = {}) => {
  return new Promise((resolve, reject) => {
    svg2img(exports.getHouseImagePath(id), options, (error, buffer) => {
      if (error) {
        reject(error);
      }
      else {
        resolve(buffer);
      }
    });
  });
};
