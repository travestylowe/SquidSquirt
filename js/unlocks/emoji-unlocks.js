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
  },
  {
    id: 'emoji-stars',
    name: '???',
    revealName: 'Stars',
    emojis: ['\u{2B50}', '\u{1F31F}', '\u{2728}'],
    trigger: 'midnight',
  },
  {
    id: 'emoji-hearts',
    name: '???',
    revealName: 'Hearts',
    emojis: ['\u{2764}\u{FE0F}', '\u{1F49C}', '\u{1F497}', '\u{1F49B}'],
    trigger: 'session-marathon',
  },
  {
    id: 'emoji-skulls',
    name: '???',
    revealName: 'Skulls',
    emojis: ['\u{1F480}', '\u{2620}\u{FE0F}', '\u{1F47B}'],
    trigger: 'idle-then-squirt',
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
