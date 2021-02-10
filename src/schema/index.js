const Joi = require('joi');

exports.image = Joi.object({
  path: Joi.string()
    .min(3)
    .max(250)
    .uri({
      relativeOnly: true,
    })
    .required(),
  creator: Joi.string()
    .uri()
    .required(),
  license: Joi.string()
    .uri()
    .required(),
  original_uri: Joi.string()
    .uri()
    .required(),
  notes: Joi.string(),
});

exports.arms = Joi.array()
  .min()
  .items(exports.image);

exports.castleId = Joi.string()
  .lowercase()
  .min(3)
  .max(30)
  .pattern(/^[a-z_]+$/);

exports.continentId = Joi.string()
  .valid('essos', 'sothyros', 'ulthos', 'westeros');

exports.houseId = Joi.string()
  .lowercase()
  .min(3)
  .max(30)
  .pattern(/^[a-z_]+$/);

exports.kingdomId = Joi.string()
  .valid('crownlands', 'dorne', 'iron_islands', 'north', 'reach', 'riverlands', 'stormlands', 'vale', 'westerlands');

exports.singleEmoji = Joi.string();

exports.castle = Joi.object({
  id: exports.castleId.required(),
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  kingdom: exports.kingdomId,
  continent: exports.continentId
    .default('westeros')
    .required(),
});

exports.house = Joi.object({
  id: exports.houseId.required(),
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  emoji: exports.singleEmoji,
  isNoble: Joi.boolean()
    .required(),
  kingdom: exports.kingdomId,
  continent: exports.continentId
    .default('westeros')
    .required(),
  arms: exports.arms
    .required(),
});
