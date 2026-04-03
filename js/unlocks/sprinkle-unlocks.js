import { GAME } from '../constants.js';

/**
 * Sprinkle definitions.  Sprinkles use ink particle physics but each
 * particle gets a random color from the sprinkle's palette.
 * Single-color sprinkles = monochrome burst.
 * Rainbow sprinkles = all 7 hues randomly per particle.
 */

const RAINBOW_HUES = [0, 30, 55, 130, 210, 260, 290];

const SPRINKLES = [
  { id: 'spr-red',     name: 'Red Sprinkles',     hues: [0],    unlock: GAME.SPRINKLE_THRESHOLDS[0] },
  { id: 'spr-orange',  name: 'Orange Sprinkles',  hues: [30],   unlock: GAME.SPRINKLE_THRESHOLDS[1] },
  { id: 'spr-yellow',  name: 'Yellow Sprinkles',  hues: [55],   unlock: GAME.SPRINKLE_THRESHOLDS[2] },
  { id: 'spr-green',   name: 'Green Sprinkles',   hues: [130],  unlock: GAME.SPRINKLE_THRESHOLDS[3] },
  { id: 'spr-blue',    name: 'Blue Sprinkles',    hues: [210],  unlock: GAME.SPRINKLE_THRESHOLDS[4] },
  { id: 'spr-indigo',  name: 'Indigo Sprinkles',  hues: [260],  unlock: GAME.SPRINKLE_THRESHOLDS[5] },
  { id: 'spr-violet',  name: 'Violet Sprinkles',  hues: [290],  unlock: GAME.SPRINKLE_THRESHOLDS[6] },
  { id: 'spr-rainbow', name: 'Rainbow Sprinkles', hues: RAINBOW_HUES, unlock: GAME.SPRINKLE_THRESHOLDS[7] },
];

export function getSprinkleUnlocks() {
  return SPRINKLES;
}

/**
 * Returns a random hue from the sprinkle's palette (called per-particle).
 */
export function resolveSprinkleHue(sprinkleItem) {
  const pool = sprinkleItem.hues;
  return pool[Math.floor(Math.random() * pool.length)];
}
