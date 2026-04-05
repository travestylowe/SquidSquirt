import { GAME } from '../constants.js';

/**
 * Ink color definitions.  Each entry swaps the particle hue in the ink system.
 * The last entry (rainbow) cycles hue randomly per particle.
 */

const INK_COLORS = [
  { id: 'ink-red',     name: 'Red Ink',     hue: 0,    sat: 55, lt: 18, unlock: GAME.INK_THRESHOLDS[0] },
  { id: 'ink-orange',  name: 'Orange Ink',  hue: 30,   sat: 60, lt: 22, unlock: GAME.INK_THRESHOLDS[1] },
  { id: 'ink-yellow',  name: 'Yellow Ink',  hue: 55,   sat: 65, lt: 28, unlock: GAME.INK_THRESHOLDS[2] },
  { id: 'ink-green',   name: 'Green Ink',   hue: 130,  sat: 50, lt: 16, unlock: GAME.INK_THRESHOLDS[3] },
  { id: 'ink-blue',    name: 'Blue Ink',    hue: 210,  sat: 55, lt: 18, unlock: GAME.INK_THRESHOLDS[4] },
  { id: 'ink-indigo',  name: 'Indigo Ink',  hue: 260,  sat: 50, lt: 14, unlock: GAME.INK_THRESHOLDS[5] },
  { id: 'ink-violet',  name: 'Violet Ink',  hue: 290,  sat: 55, lt: 16, unlock: GAME.INK_THRESHOLDS[6] },
  { id: 'ink-rainbow', name: 'Rainbow Ink', hue: null,  sat: 60, lt: 22, unlock: GAME.INK_THRESHOLDS[7] },
];

export function getInkUnlocks() {
  return INK_COLORS;
}

/**
 * Returns the hue for a given ink unlock.
 * For rainbow, returns a random hue each call (caller invokes per-particle).
 */
export function resolveInkHue(inkItem) {
  if (inkItem.hue === null) return Math.floor(Math.random() * 360);
  return inkItem.hue;
}
