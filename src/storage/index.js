const glob = require('glob-promise');
const fs = require('fs').promises;

const dataPath = './data';

const readJson = async (path) => fs.readFile(path).then((data) => JSON.parse(data));

const buildCastles = () => glob
  .sync('castles/*.json', { cwd: dataPath })
  .map((filename) => readJson(`${dataPath}/${filename}`));

const buildHouses = () => glob
  .sync('houses/*.json', { cwd: dataPath })
  .map((filename) => readJson(`${dataPath}/${filename}`));

const castles = buildCastles();
const houses = buildHouses();

exports.getCastles = async () => Promise.all(castles);

exports.getHouses = async () => Promise.all(houses);

exports.getElementById = async (list, id) => list.find((item) => item.id === id);

exports.getCastleById = async (id) => exports.getElementById(await this.getCastles(), id);

exports.getHouseById = async (id) => exports.getElementById(await this.getHouses(), id);
