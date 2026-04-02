/**
 * Tunables and magic numbers (single source of truth for gameplay feel).
 * Copy/strings live in /data/*.json
 */

export const GAME = {
  LOCAL_STORAGE_KEY: 'sqc',

  // Ink (power is 0–1)
  INK_DRY_THRESHOLD: 0.05,
  INK_MEGA_THRESHOLD: 0.85,
  INK_DRIP_THRESHOLD: 0.28,
  INK_MEGA_OVERLAY_K: 4,
  INK_MEGA_OVERLAY_BASE: 0.83,
  INK_OVERLAY_DRAIN: 0.0018,
  INK_OVERLAY_COLOR: '#060115',
  PARTICLE_BASE: 18,
  PARTICLE_PER_POWER: 140,
  DRIP_SCALE: 30,
  GRAVITY: 0.19,
  PARTICLE_DRAG: 0.97,

  // Squid layout (SVG viewBox 400×380)
  SQUID_VIEW_MARGIN_PX: 40,
  /** Used only for max idle scale inset (slightly tighter than wrap margin). */
  SQUID_SCALE_INSET_PX: 48,
  IDLE_TO_MAX_MS: 52000,
  BLUSH_MS: 2800,
  BLUSH_OPACITY: '0.62',

  // Squirt / RNG
  FART_CHANCE: 0.25,
  BLUSH_SQUIRT_MIN: 0.75,
  BLUSH_FART_MIN: 0.65,
  SQUIRT_COOLDOWN_MS: 320,
  SCALE_SHRINK_BASE: 0.07,
  SCALE_SHRINK_EXCESS_COEF: 0.2,
  SCALE_SHRINK_EXCESS_ADD: 0.06,

  // Palette bands (local squirt count)
  PALETTE_EVERY_N: 10,

  // Confetti
  CONFETTI_MIN_SQUIRTS: 10,
  CONFETTI_MAX_SQUIRTS: 30,
  CONFETTI_PIECES_MIN: 22,
  CONFETTI_PIECES_MAX: 38,

  // Bubbles
  BUBBLE_COUNT: 14,

  // Hints
  TAUNT_IDLE_MS: 4800,
  TAUNT_ROTATE_MS: 6200,
  THANK_YOU_MS: 2600,

  // Audio — giggle probability by regime
  GIGGLE_FART: 0.72,
  GIGGLE_TINY_SQUIRT: 0.86,
  GIGGLE_MEGA_SQUIRT: 0.42,
  GIGGLE_DEFAULT: 0.20,
  TINY_SQUIRT_POWER: 0.15,
  MEGA_SQUIRT_POWER: 0.8,

  // Resize debounce (ms)
  RESIZE_DEBOUNCE_MS: 100,

  // Ink particle caps (low-end guard)
  MAX_PARTICLES_PER_SPAWN: 220,
  MAX_DRIPS_PER_SPAWN: 45,

  // Milestone celebration
  MILESTONE_MSG_MS: 3500, /* how long the milestone hint stays visible */

  // Sound toggle (localStorage key)
  SOUND_MUTED_KEY: 'sqm',

  // Haptic feedback patterns (ms)
  HAPTIC_NORMAL: [30],
  HAPTIC_MEGA: [50, 30, 80],
  HAPTIC_FART: [40, 20, 40],

  // Accessories (localStorage key)
  ACCESSORY_KEY: 'sqa',
};
