/**
 * Emoji pack definitions.  All are easter-egg unlocks — no squirt-count
 * threshold.  Each pack lists emoji glyphs rendered via the sprinkle
 * emitter (scatter, no drips/stains/blur).
 *
 * Trigger IDs map to detection logic in unlock-manager.
 */

const EMOJI_PACKS = [
  {
    id: 'emoji-water',
    name: '???',
    revealName: 'Water Droplets',
    emojis: ['\u{1F4A7}', '\u{1F4A6}', '\u{1F30A}'],
    trigger: 'rapid-fire',
    /* Heavy drops that rain down quickly */
    physics: { gravity: 0.45, drag: 0.92, fadeRate: 0.008, sizeMin: 18, sizeRange: 14, speedMul: 0.7 },
  },
  {
    id: 'emoji-stars',
    name: '???',
    revealName: 'Stars',
    emojis: ['\u{2B50}', '\u{1F31F}', '\u{2728}'],
    trigger: 'midnight',
    /* Floaty stars that drift upward and twinkle (slow fade, low gravity) */
    physics: { gravity: -0.06, drag: 0.985, fadeRate: 0.005, sizeMin: 12, sizeRange: 20, speedMul: 0.5, twinkle: true },
  },
  {
    id: 'emoji-hearts',
    name: '???',
    revealName: 'Hearts',
    emojis: ['\u{2764}\u{FE0F}', '\u{1F49C}', '\u{1F497}', '\u{1F49B}'],
    trigger: 'session-marathon',
    /* Gentle float upward with side-to-side sway */
    physics: { gravity: -0.03, drag: 0.98, fadeRate: 0.006, sizeMin: 16, sizeRange: 16, speedMul: 0.6, sway: true },
  },
  {
    id: 'emoji-skulls',
    name: '???',
    revealName: 'Skulls',
    emojis: ['\u{1F480}', '\u{2620}\u{FE0F}', '\u{1F47B}'],
    trigger: 'idle-then-squirt',
    /* Heavy skulls that slam down fast, then tumble/spin */
    physics: { gravity: 0.55, drag: 0.88, fadeRate: 0.007, sizeMin: 22, sizeRange: 18, speedMul: 1.3, spin: true },
  },
];

export function getEmojiUnlocks() {
  return EMOJI_PACKS;
}

/**
 * Returns a random emoji glyph from the pack (called per-particle).
 */
export function resolveEmoji(emojiItem) {
  const pool = emojiItem.emojis;
  return pool[Math.floor(Math.random() * pool.length)];
}
