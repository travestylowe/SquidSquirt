# Unlock System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add unlockable ink colors, sprinkles, emoji packs, confetti shapes, and a silly microtransaction system to SquidSquirt's progression.

**Architecture:** New `js/unlocks/` directory with definition modules per unlock type plus a central unlock-manager for state/persistence/selection. The existing `js/ui/accessories.js` picker panel is replaced by a tabbed picker (`js/ui/unlock-picker.js`) covering Hats, Ink, and Confetti. A separate `js/ui/payments.js` handles 10 silly microtransaction modals. The ink canvas and confetti system are modified to accept render mode and shape configs from the unlock-manager.

**Tech Stack:** Vanilla JS (ES modules), CSS, HTML — no new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-03-unlock-system-design.md`

---

### Task 1: Add Unlock Constants

**Files:**
- Modify: `js/constants.js`

- [ ] **Step 1: Add unlock threshold and payment timing constants to GAME object**

Add these properties to the end of the `GAME` object in `js/constants.js`, before the closing `};`:

```js
  // Unlock system (localStorage keys)
  UNLOCK_KEY: 'squ',       /* unlocked item IDs */
  UNLOCK_PIN_KEY: 'sqp',   /* pinned selections */
  UNLOCK_TXN_KEY: 'sqt',   /* microtransaction completions */

  // Ink color unlock thresholds (squirt count)
  INK_THRESHOLDS: [10, 30, 60, 100, 175, 300, 500, 1000],

  // Sprinkle unlock thresholds (squirt count)
  SPRINKLE_THRESHOLDS: [20, 50, 80, 125, 225, 400, 650, 1000],

  // Confetti shape unlock thresholds (squirt count)
  CONFETTI_THRESHOLDS: [40, 90, 150, 350, 750],

  // Easter egg detection
  EASTER_EGG_RAPID_COUNT: 10,       /* squirts needed in window */
  EASTER_EGG_RAPID_WINDOW_MS: 3000, /* time window for rapid squirts */
  EASTER_EGG_IDLE_MS: 300000,       /* 5 minutes idle for skulls */
  EASTER_EGG_SESSION_COUNT: 100,    /* squirts in one session for hearts */

  // Payment timing constants (ms)
  PAYMENT_PATIENCE_MS: 30000,       /* fake loading bar duration */
  PAYMENT_DANCE_MS: 5000,           /* shake/wiggle duration */
  PAYMENT_SERENADE_MS: 3000,        /* mic noise duration */
  PAYMENT_HIGHFIVE_WINDOW_MS: 3000, /* time to tap 5 times in rhythm */
  PAYMENT_QUEUE_BASE_MS: 800,       /* base delay between queue numbers */
```

- [ ] **Step 2: Verify the file parses correctly**

Run: Open browser dev console, confirm no syntax errors on page load. Check `import { GAME } from './js/constants.js'` resolves.

- [ ] **Step 3: Commit**

```bash
git add js/constants.js
git commit -m "feat(unlocks): add unlock thresholds and payment timing constants"
```

---

### Task 2: Create Ink Unlock Definitions

**Files:**
- Create: `js/unlocks/ink-unlocks.js`

- [ ] **Step 1: Create the ink unlocks definition module**

Create `js/unlocks/ink-unlocks.js`:

```js
import { GAME } from '../constants.js';

/**
 * Ink color definitions.  Each entry swaps the particle hue in the ink system.
 * The last entry (rainbow) cycles hue randomly per particle.
 */

const INK_COLORS = [
  { id: 'ink-red',     name: 'Red Ink',     hue: 0,    unlock: GAME.INK_THRESHOLDS[0] },
  { id: 'ink-orange',  name: 'Orange Ink',  hue: 30,   unlock: GAME.INK_THRESHOLDS[1] },
  { id: 'ink-yellow',  name: 'Yellow Ink',  hue: 55,   unlock: GAME.INK_THRESHOLDS[2] },
  { id: 'ink-green',   name: 'Green Ink',   hue: 130,  unlock: GAME.INK_THRESHOLDS[3] },
  { id: 'ink-blue',    name: 'Blue Ink',    hue: 210,  unlock: GAME.INK_THRESHOLDS[4] },
  { id: 'ink-indigo',  name: 'Indigo Ink',  hue: 260,  unlock: GAME.INK_THRESHOLDS[5] },
  { id: 'ink-violet',  name: 'Violet Ink',  hue: 290,  unlock: GAME.INK_THRESHOLDS[6] },
  { id: 'ink-rainbow', name: 'Rainbow Ink', hue: null,  unlock: GAME.INK_THRESHOLDS[7] },
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
```

- [ ] **Step 2: Commit**

```bash
git add js/unlocks/ink-unlocks.js
git commit -m "feat(unlocks): add ink color definitions module"
```

---

### Task 3: Create Sprinkle Unlock Definitions

**Files:**
- Create: `js/unlocks/sprinkle-unlocks.js`

- [ ] **Step 1: Create the sprinkle unlocks definition module**

Create `js/unlocks/sprinkle-unlocks.js`:

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add js/unlocks/sprinkle-unlocks.js
git commit -m "feat(unlocks): add sprinkle definitions module"
```

---

### Task 4: Create Emoji Unlock Definitions

**Files:**
- Create: `js/unlocks/emoji-unlocks.js`

- [ ] **Step 1: Create the emoji unlocks definition module**

Create `js/unlocks/emoji-unlocks.js`:

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add js/unlocks/emoji-unlocks.js
git commit -m "feat(unlocks): add emoji pack definitions module"
```

---

### Task 5: Create Confetti Shape Unlock Definitions

**Files:**
- Create: `js/unlocks/confetti-unlocks.js`

- [ ] **Step 1: Create the confetti unlocks definition module**

Create `js/unlocks/confetti-unlocks.js`:

```js
import { GAME } from '../constants.js';

/**
 * Confetti shape definitions.  Each provides an SVG-generating function
 * that replaces the default mini-squid confetti.  The function receives
 * a random hue for color variation.
 */

const CONFETTI_SHAPES = [
  {
    id: 'conf-stars',
    name: 'Stars',
    unlock: GAME.CONFETTI_THRESHOLDS[0],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
        <polygon points="16,2 20,12 30,12 22,19 25,30 16,23 7,30 10,19 2,12 12,12"
                 fill="hsl(${h},75%,55%)" stroke="hsl(${h},60%,40%)" stroke-width="1"/>
      </svg>`;
    },
  },
  {
    id: 'conf-hearts',
    name: 'Hearts',
    unlock: GAME.CONFETTI_THRESHOLDS[1],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" width="28" height="28" aria-hidden="true">
        <path d="M16 28 C10 22 2 17 2 10 C2 5 6 2 10 2 C13 2 15 4 16 6 C17 4 19 2 22 2 C26 2 30 5 30 10 C30 17 22 22 16 28Z"
              fill="hsl(${h},70%,55%)" stroke="hsl(${h},55%,40%)" stroke-width="1"/>
      </svg>`;
    },
  },
  {
    id: 'conf-fish',
    name: 'Fish',
    unlock: GAME.CONFETTI_THRESHOLDS[2],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg" width="34" height="24" aria-hidden="true">
        <ellipse cx="22" cy="14" rx="14" ry="10" fill="hsl(${h},65%,50%)"/>
        <polygon points="8,14 0,4 0,24" fill="hsl(${h},60%,45%)"/>
        <circle cx="28" cy="11" r="2.5" fill="#fff"/>
        <circle cx="29" cy="11" r="1.2" fill="#160030"/>
      </svg>`;
    },
  },
  {
    id: 'conf-anchors',
    name: 'Anchors',
    unlock: GAME.CONFETTI_THRESHOLDS[3],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 28 34" xmlns="http://www.w3.org/2000/svg" width="24" height="30" aria-hidden="true">
        <circle cx="14" cy="5" r="4" fill="none" stroke="hsl(${h},55%,45%)" stroke-width="2.5"/>
        <line x1="14" y1="9" x2="14" y2="30" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="20" x2="22" y2="20" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M6 28 Q6 24 14 24 Q22 24 22 28" fill="none" stroke="hsl(${h},55%,45%)" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;
    },
  },
  {
    id: 'conf-tentacles',
    name: 'Tentacles',
    unlock: GAME.CONFETTI_THRESHOLDS[4],
    svg(hue) {
      const h = Math.round(hue);
      return `<svg viewBox="0 0 32 36" xmlns="http://www.w3.org/2000/svg" width="28" height="32" aria-hidden="true">
        <path d="M8 4 Q6 16 10 28 Q12 34 8 36" stroke="hsl(${h},62%,48%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M16 2 Q14 14 16 26 Q18 34 14 36" stroke="hsl(${h},58%,42%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M24 4 Q26 16 22 28 Q20 34 24 36" stroke="hsl(${h},62%,48%)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="10" cy="30" r="2" fill="hsl(${h},55%,38%)"/>
        <circle cx="16" cy="28" r="2" fill="hsl(${h},55%,38%)"/>
        <circle cx="22" cy="30" r="2" fill="hsl(${h},55%,38%)"/>
      </svg>`;
    },
  },
];

export function getConfettiUnlocks() {
  return CONFETTI_SHAPES;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/unlocks/confetti-unlocks.js
git commit -m "feat(unlocks): add confetti shape definitions module"
```

---

### Task 6: Create the Unlock Manager

**Files:**
- Create: `js/unlocks/unlock-manager.js`

- [ ] **Step 1: Create the unlock manager module**

This is the central module that tracks unlock state, persistence, selection, and easter egg detection.

Create `js/unlocks/unlock-manager.js`:

```js
import { GAME } from '../constants.js';
import { getInkUnlocks, resolveInkHue } from './ink-unlocks.js';
import { getSprinkleUnlocks, resolveSprinkleHue } from './sprinkle-unlocks.js';
import { getEmojiUnlocks, resolveEmoji } from './emoji-unlocks.js';
import { getConfettiUnlocks } from './confetti-unlocks.js';

/**
 * Creates the unlock manager — central state for all unlock types.
 *
 * @param {number} initialCount - current squirt count at init
 * @returns unlock manager API
 */
export function createUnlockManager(initialCount) {
  const inkDefs = getInkUnlocks();
  const sprinkleDefs = getSprinkleUnlocks();
  const emojiDefs = getEmojiUnlocks();
  const confettiDefs = getConfettiUnlocks();

  /* ── Persistence ── */

  /** Set of unlocked item IDs */
  let unlocked = new Set(loadJson(GAME.UNLOCK_KEY, []));

  /** Pinned selections: { ink: id|null, confetti: id|null } */
  let pins = loadJson(GAME.UNLOCK_PIN_KEY, { ink: null, confetti: null });

  /** Microtransaction completions (item IDs) */
  let txns = new Set(loadJson(GAME.UNLOCK_TXN_KEY, []));

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  }

  function saveUnlocked() {
    localStorage.setItem(GAME.UNLOCK_KEY, JSON.stringify([...unlocked]));
  }

  function savePins() {
    localStorage.setItem(GAME.UNLOCK_PIN_KEY, JSON.stringify(pins));
  }

  function saveTxns() {
    localStorage.setItem(GAME.UNLOCK_TXN_KEY, JSON.stringify([...txns]));
  }

  /* ── Easter egg detection state ── */

  /** Ring buffer of recent squirt timestamps for rapid-fire detection */
  const recentSquirts = [];

  /** Session squirt count (not persisted — resets on page load) */
  let sessionSquirts = 0;

  /** Timestamp of last squirt for idle detection */
  let lastSquirtTime = Date.now();

  /* ── Init: auto-unlock items the player already qualifies for ── */

  function autoUnlockByCount(count) {
    const newlyUnlocked = [];
    for (const item of [...inkDefs, ...sprinkleDefs, ...confettiDefs]) {
      if (count >= item.unlock && !unlocked.has(item.id)) {
        unlocked.add(item.id);
        newlyUnlocked.push(item);
      }
    }
    if (newlyUnlocked.length > 0) saveUnlocked();
    return newlyUnlocked;
  }

  /* Auto-unlock on init for returning players */
  autoUnlockByCount(initialCount);

  /* ── Unlock via microtransaction ── */

  function unlockViaTxn(itemId) {
    unlocked.add(itemId);
    txns.add(itemId);
    saveUnlocked();
    saveTxns();
  }

  /* ── Easter egg checks ── */

  function checkEasterEggs() {
    const newlyUnlocked = [];

    for (const emoji of emojiDefs) {
      if (unlocked.has(emoji.id)) continue;

      let triggered = false;
      switch (emoji.trigger) {
        case 'rapid-fire':
          if (recentSquirts.length >= GAME.EASTER_EGG_RAPID_COUNT) {
            const oldest = recentSquirts[recentSquirts.length - GAME.EASTER_EGG_RAPID_COUNT];
            triggered = (Date.now() - oldest) <= GAME.EASTER_EGG_RAPID_WINDOW_MS;
          }
          break;

        case 'midnight': {
          const now = new Date();
          triggered = now.getHours() === 0 && now.getMinutes() === 0;
          break;
        }

        case 'session-marathon':
          triggered = sessionSquirts >= GAME.EASTER_EGG_SESSION_COUNT;
          break;

        case 'idle-then-squirt': {
          const gap = Date.now() - lastSquirtTime;
          triggered = gap >= GAME.EASTER_EGG_IDLE_MS;
          break;
        }
      }

      if (triggered) {
        unlocked.add(emoji.id);
        newlyUnlocked.push(emoji);
      }
    }

    if (newlyUnlocked.length > 0) saveUnlocked();
    return newlyUnlocked;
  }

  /* ── Selection logic ── */

  /** All unlocked items in the ink/sprinkle/emoji category */
  function getUnlockedParticleStyles() {
    const pool = [];
    for (const item of inkDefs) {
      if (unlocked.has(item.id)) pool.push({ type: 'ink', item });
    }
    for (const item of sprinkleDefs) {
      if (unlocked.has(item.id)) pool.push({ type: 'sprinkle', item });
    }
    for (const item of emojiDefs) {
      if (unlocked.has(item.id)) pool.push({ type: 'emoji', item });
    }
    return pool;
  }

  function getUnlockedConfettiShapes() {
    return confettiDefs.filter(item => unlocked.has(item.id));
  }

  /**
   * Pick the active particle style for this squirt.
   * Returns { type: 'ink'|'sprinkle'|'emoji', item } or null if nothing unlocked.
   */
  function pickParticleStyle() {
    if (pins.ink) {
      /* Check ink defs */
      const ink = inkDefs.find(d => d.id === pins.ink);
      if (ink && unlocked.has(ink.id)) return { type: 'ink', item: ink };

      /* Check sprinkle defs */
      const spr = sprinkleDefs.find(d => d.id === pins.ink);
      if (spr && unlocked.has(spr.id)) return { type: 'sprinkle', item: spr };

      /* Check emoji defs */
      const emo = emojiDefs.find(d => d.id === pins.ink);
      if (emo && unlocked.has(emo.id)) return { type: 'emoji', item: emo };
    }

    /* Random from unlocked pool */
    const pool = getUnlockedParticleStyles();
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * Pick the active confetti shape for this burst.
   * Returns a confetti item or null (null = use default mini-squid).
   */
  function pickConfettiShape() {
    if (pins.confetti) {
      const shape = confettiDefs.find(d => d.id === pins.confetti);
      if (shape && unlocked.has(shape.id)) return shape;
    }

    const pool = getUnlockedConfettiShapes();
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ── Pin management ── */

  function pinInk(id) {
    pins.ink = id;
    savePins();
  }

  function pinConfetti(id) {
    pins.confetti = id;
    savePins();
  }

  /* ── Main check (called on each squirt) ── */

  /**
   * Called on every squirt.  Updates easter egg state, checks for new unlocks.
   * @param {number} count - new total squirt count
   * @returns {{ milestoneUnlocks: Array, easterEggUnlocks: Array }}
   */
  function onSquirt(count) {
    /* Easter egg state updates (must happen BEFORE checks) */
    const now = Date.now();

    /* idle-then-squirt check must use lastSquirtTime from BEFORE this squirt */
    const easterEggUnlocks = checkEasterEggs();

    /* Now update timestamps for future checks */
    recentSquirts.push(now);
    if (recentSquirts.length > GAME.EASTER_EGG_RAPID_COUNT + 5) {
      recentSquirts.splice(0, recentSquirts.length - GAME.EASTER_EGG_RAPID_COUNT - 5);
    }
    sessionSquirts++;
    lastSquirtTime = now;

    /* Milestone-based unlocks */
    const milestoneUnlocks = autoUnlockByCount(count);

    return { milestoneUnlocks, easterEggUnlocks };
  }

  return {
    onSquirt,
    unlockViaTxn,
    pickParticleStyle,
    pickConfettiShape,
    pinInk,
    pinConfetti,
    getPins() { return { ...pins }; },
    isUnlocked(id) { return unlocked.has(id); },
    isTxnCompleted(id) { return txns.has(id); },
    getInkDefs() { return inkDefs; },
    getSprinkleDefs() { return sprinkleDefs; },
    getEmojiDefs() { return emojiDefs; },
    getConfettiDefs() { return confettiDefs; },
    getUnlockedParticleStyles,
    getUnlockedConfettiShapes,
    resolveInkHue,
    resolveSprinkleHue,
    resolveEmoji,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/unlocks/unlock-manager.js
git commit -m "feat(unlocks): add central unlock manager with easter egg detection"
```

---

### Task 7: Modify Ink Canvas for Render Modes

**Files:**
- Modify: `js/ink/canvas.js`

The ink system currently renders all particles as blurred circles with `inkHue`. We need to support three modes:
- **ink** — current behavior, single hue override
- **sprinkle** — same physics, per-particle random hue from a palette
- **emoji** — scatter emitter, emoji glyphs, no drips/stains/blur

- [ ] **Step 1: Add render mode state and a setRenderMode method**

In `js/ink/canvas.js`, after the `let inkHue = 272;` line (line 24), add:

```js
  /**
   * Render mode for the next spawnInk call.
   * Set externally by the unlock manager before each squirt.
   *   - { mode: 'ink', hue: number|function }
   *   - { mode: 'sprinkle', huePool: number[] }
   *   - { mode: 'emoji', emojis: string[] }
   * Default (null) = use current inkHue from palette.
   */
  let renderMode = null;
```

- [ ] **Step 2: Modify spawnInk to respect render mode for ink and sprinkle modes**

In the `spawnInk` function, change the blob-pushing loop. Replace the existing `for (let i = 0; i < count; i++)` block (lines 57-79) with:

```js
    /* Emoji mode uses a separate lightweight emitter — skip blob physics */
    if (renderMode && renderMode.mode === 'emoji') {
      spawnEmojiScatter(originX, originY, power, inflation, count);
      return;
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2.5 + Math.random() * 8) * Math.pow(power, 0.5)
                  + inf * (4 + Math.random() * 12);

      const sizeBoost = 1 + inf * 5;
      const r = (12 + Math.random() * 22) * Math.pow(power, 0.42) * sizeBoost;

      /* Determine hue for this particle based on render mode */
      let blobHue;
      if (renderMode && renderMode.mode === 'sprinkle') {
        const pool = renderMode.huePool;
        blobHue = pool[Math.floor(Math.random() * pool.length)];
      } else if (renderMode && renderMode.mode === 'ink' && typeof renderMode.hue === 'function') {
        blobHue = renderMode.hue();
      } else if (renderMode && renderMode.mode === 'ink') {
        blobHue = renderMode.hue;
      } else {
        blobHue = inkHue;
      }

      blobs.push({
        x: originX + (Math.random() - 0.5) * spread * 0.2,
        y: originY + (Math.random() - 0.5) * spread * 0.2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        maxR: r * (2.0 + Math.random() * 1.5),
        hue: blobHue - 8 + Math.random() * 20,
        sat: 25 + Math.random() * 25,
        lt: 1 + Math.random() * 6,
        alpha: 0.6 + Math.random() * 0.3,
        alive: true,
      });
    }
```

Also update the mega stain section (the `if (power > GAME.INK_MEGA_THRESHOLD...` block) to use the same hue logic. Replace the `hue:` line in that stain push:

```js
          hue: blobHue != null ? blobHue - 5 + Math.random() * 12 : inkHue - 5 + Math.random() * 12,
```

Wait — the mega section is outside the per-particle loop, so we need a different approach. Replace the mega stains block with:

```js
    /* Extra large stain patches for mega / inflated squirts */
    if (power > GAME.INK_MEGA_THRESHOLD || inf > 0.5) {
      const megaCount = Math.floor(8 + inf * 40 + power * 8);
      const megaSpread = spread * 1.3;
      for (let i = 0; i < megaCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * megaSpread;
        const sr = (25 + Math.random() * 45) * (1 + inf * 2);

        let stainHue;
        if (renderMode && renderMode.mode === 'sprinkle') {
          const pool = renderMode.huePool;
          stainHue = pool[Math.floor(Math.random() * pool.length)];
        } else if (renderMode && renderMode.mode === 'ink' && typeof renderMode.hue === 'function') {
          stainHue = renderMode.hue();
        } else if (renderMode && renderMode.mode === 'ink') {
          stainHue = renderMode.hue;
        } else {
          stainHue = inkHue;
        }

        stains.push({
          x: originX + Math.cos(ang) * dist,
          y: originY + Math.sin(ang) * dist,
          r: sr,
          alpha: 0.4 + Math.random() * 0.3,
          hue: stainHue - 5 + Math.random() * 12,
          sat: 25 + Math.random() * 20,
          lt: 1 + Math.random() * 5,
        });
      }
    }
```

- [ ] **Step 3: Add the emoji scatter emitter function**

Add this function inside `createInkSystem`, before the `return` statement:

```js
  /** Lightweight scatter for emoji mode — no drips, stains, or blur. */
  function spawnEmojiScatter(originX, originY, power, inflation, count) {
    const inf = inflation || 0;
    const emojis = renderMode.emojis;
    /* Fewer particles than ink for a cleaner look */
    const emojiCount = Math.min(Math.floor(count * 0.35), 60);
    const maxSpread = Math.hypot(W, H) * 0.6;
    const spread = 120 + maxSpread * inf;

    const pieces = [];

    for (let i = 0; i < emojiCount; i++) {
      const glyph = emojis[Math.floor(Math.random() * emojis.length)];
      const angle = Math.random() * Math.PI * 2;
      const speed = (3 + Math.random() * 7) * Math.pow(power, 0.5)
                  + inf * (3 + Math.random() * 8);
      const size = 16 + Math.random() * 18;

      const el = document.createElement('div');
      el.className = 'emoji-particle';
      el.textContent = glyph;
      el.style.fontSize = size + 'px';
      el.style.left = '0px';
      el.style.top = '0px';
      document.body.appendChild(el);

      pieces.push({
        el,
        x: originX + (Math.random() - 0.5) * spread * 0.15,
        y: originY + (Math.random() - 0.5) * spread * 0.15,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        alive: true,
      });
    }

    function tick() {
      let active = 0;
      for (const p of pieces) {
        if (!p.alive) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; /* light gravity */
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= 0.012;

        if (p.alpha <= 0 || p.y > H + 40 || p.x < -40 || p.x > W + 40) {
          p.alive = false;
          p.el.remove();
          continue;
        }

        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
        p.el.style.opacity = p.alpha;
        active++;
      }
      if (active > 0) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }
```

- [ ] **Step 4: Add setRenderMode to the returned API**

In the `return` statement of `createInkSystem`, add:

```js
    setRenderMode(mode) { renderMode = mode; },
```

So the full return becomes:

```js
  return {
    resize,
    spawnInk,
    step,
    setInkHue(h) { inkHue = h; },
    setRenderMode(mode) { renderMode = mode; },
    getInkDensityAt,
  };
```

- [ ] **Step 5: Verify no syntax errors**

Run: Start dev server, open browser, check console for errors. Squirt should still work with default ink (no render mode set yet).

- [ ] **Step 6: Commit**

```bash
git add js/ink/canvas.js
git commit -m "feat(ink): support ink, sprinkle, and emoji render modes"
```

---

### Task 8: Modify Confetti for Custom Shapes

**Files:**
- Modify: `js/fx/confetti.js`

- [ ] **Step 1: Make spawnSquidConfetti accept an optional shape parameter**

Change the export signature and add shape support. Replace the entire `spawnSquidConfetti` function:

```js
/**
 * Spawn a burst of confetti from a single random edge point.
 * If a shape object is provided (from confetti-unlocks), use its SVG generator.
 * Otherwise, fall back to the default mini-squid.
 *
 * @param {object|null} shape - confetti shape from confetti-unlocks, or null for default
 */
export function spawnSquidConfetti(shape) {
  const n = randomInt(GAME.CONFETTI_PIECES_MIN, GAME.CONFETTI_PIECES_MAX);
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const origin = pickEdgeOrigin(vw, vh);
  const pieces = [];

  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'squid-confetti-piece';

    const hue = 250 + Math.random() * 80;
    el.innerHTML = shape ? shape.svg(hue) : miniSquidSvg(hue);

    if (!shape) {
      const w = 26 + Math.floor(Math.random() * 14);
      const svg = el.firstElementChild;
      if (svg) {
        svg.setAttribute('width', String(w));
        svg.setAttribute('height', String(Math.round(w * 35 / 32)));
      }
    }

    document.body.appendChild(el);

    const angle = origin.angle + (Math.random() - 0.5) * 2 * CONE_HALF;
    const speed = SPEED_MIN + Math.random() * SPEED_RANGE;

    pieces.push({
      el,
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: GRAVITY_MIN + Math.random() * GRAVITY_RANGE,
      rot: Math.random() * 360,
      spin: (Math.random() - 0.5) * 14,
      delay: Math.floor(Math.random() * 8),
      alive: true,
    });
  }

  function tick() {
    let active = 0;

    for (const p of pieces) {
      if (!p.alive) continue;

      if (p.delay > 0) { p.delay--; active++; continue; }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rot += p.spin;

      if (p.y > vh + 60 || p.y < -80 || p.x < -80 || p.x > vw + 80) {
        p.alive = false;
        p.el.remove();
        continue;
      }

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg)`;
      active++;
    }

    if (active > 0) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
```

- [ ] **Step 2: Commit**

```bash
git add js/fx/confetti.js
git commit -m "feat(confetti): accept custom shape SVG generators"
```

---

### Task 9: Create Trivia Data File

**Files:**
- Create: `data/trivia.json`

- [ ] **Step 1: Create trivia questions for the squid trivia payment**

Create `data/trivia.json`:

```json
[
  {
    "question": "How many hearts does a squid have?",
    "choices": ["1", "2", "3", "4"],
    "answer": 2
  },
  {
    "question": "What color is squid blood?",
    "choices": ["Red", "Blue", "Green", "Clear"],
    "answer": 1
  },
  {
    "question": "What do squids use to propel themselves?",
    "choices": ["Fins only", "Jet propulsion", "Legs", "Tail flapping"],
    "answer": 1
  },
  {
    "question": "What is a group of squid called?",
    "choices": ["A school", "A squad", "A shoal", "A squad or shoal"],
    "answer": 2
  },
  {
    "question": "How many arms does a squid have?",
    "choices": ["6", "8", "10", "12"],
    "answer": 1
  },
  {
    "question": "What is the largest squid species?",
    "choices": ["Giant squid", "Colossal squid", "Humboldt squid", "Firefly squid"],
    "answer": 1
  },
  {
    "question": "What do squids squirt to escape predators?",
    "choices": ["Water", "Ink", "Slime", "Bubbles"],
    "answer": 1
  },
  {
    "question": "Where is a squid's brain located?",
    "choices": ["In its head", "Around its esophagus", "In its mantle", "It doesn't have one"],
    "answer": 1
  },
  {
    "question": "What shape is a squid's pupil?",
    "choices": ["Round", "Slit (vertical)", "W-shaped", "Square"],
    "answer": 2
  },
  {
    "question": "Can squids change color?",
    "choices": ["No", "Only some species", "Yes, all of them", "Only in the dark"],
    "answer": 2
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add data/trivia.json
git commit -m "feat(unlocks): add squid trivia questions for payment system"
```

---

### Task 10: Add HTML Markup for Picker Tabs and Payment Modal

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the accessory panel with a tabbed unlock picker**

In `index.html`, replace line 149:
```html
  <div id="accessory-panel" class="side-panel"></div>
```

with:

```html
  <!-- Unlock picker panel (tabbed: Hats / Ink / Confetti) -->
  <div id="unlock-panel" class="side-panel">
    <div id="unlock-tabs">
      <button class="unlock-tab active" data-tab="hats">Hats</button>
      <button class="unlock-tab" data-tab="ink">Ink</button>
      <button class="unlock-tab" data-tab="confetti">Confetti</button>
    </div>
    <div id="unlock-tab-content"></div>
  </div>

  <!-- Payment modal overlay -->
  <div id="payment-modal" class="payment-modal" aria-modal="true" role="dialog" hidden>
    <div class="payment-modal-inner">
      <button id="payment-close" class="payment-close" aria-label="Close">&times;</button>
      <div id="payment-title" class="payment-title"></div>
      <div id="payment-body" class="payment-body"></div>
      <div id="payment-actions" class="payment-actions"></div>
    </div>
  </div>
```

- [ ] **Step 2: Update the accessory button to reference the new panel**

The button (`#accessory-btn`) stays the same in the HTML — it will be rewired in JS to open the new tabbed panel. No HTML change needed.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(ui): add tabbed unlock picker and payment modal markup"
```

---

### Task 11: Update DOM Refs

**Files:**
- Modify: `js/dom/refs.js`

- [ ] **Step 1: Replace accessoryPanel ref with new panel and modal refs**

Replace the contents of `js/dom/refs.js`:

```js
/**
 * Single place for DOM lookups (IDs used by index.html).
 */
export function getDomRefs() {
  return {
    canvas: document.getElementById('ink-canvas'),
    counter: document.getElementById('counter'),
    globalCounter: document.getElementById('global-counter'),
    hint: document.getElementById('hint'),
    squidBtn: document.getElementById('squid-btn'),
    squidWrap: document.getElementById('squid-wrap'),
    squidSvg: document.getElementById('squid-svg'),
    squidBody: document.getElementById('squid-body'),
    pupilL: document.getElementById('pupil-left'),
    pupilR: document.getElementById('pupil-right'),
    blushL: document.getElementById('blush-left'),
    blushR: document.getElementById('blush-right'),
    squidCollar: document.getElementById('squid-collar'),
    squidArms: document.getElementById('squid-arms'),
    squidFeeders: document.getElementById('squid-feeders'),
    squidClubDots: document.getElementById('squid-club-dots'),
    squidSiphon: document.getElementById('squid-siphon'),
    squidSiphonMouth: document.getElementById('squid-siphon-mouth'),
    bodyGradStops: document.querySelectorAll('#bodyGrad stop'),
    eyeGradStops: document.querySelectorAll('#eyeGrad stop'),
    finGradStops: document.querySelectorAll('#finGrad stop'),
    squidEyeOutlines: document.querySelectorAll('.squid-eye-outline'),
    squidClubs: document.querySelectorAll('.squid-club'),
    muteBtn: document.getElementById('mute-btn'),
    shareBtn: document.getElementById('share-btn'),
    accessoryBtn: document.getElementById('accessory-btn'),
    accessoryPanel: document.getElementById('accessory-panel'),
    /* Unlock picker (tabbed panel) */
    unlockPanel: document.getElementById('unlock-panel'),
    unlockTabs: document.getElementById('unlock-tabs'),
    unlockTabContent: document.getElementById('unlock-tab-content'),
    /* Payment modal */
    paymentModal: document.getElementById('payment-modal'),
    paymentClose: document.getElementById('payment-close'),
    paymentTitle: document.getElementById('payment-title'),
    paymentBody: document.getElementById('payment-body'),
    paymentActions: document.getElementById('payment-actions'),
  };
}
```

Note: `accessoryPanel` is kept for backward compatibility with the existing `accessories.js` which still references it. We'll remove it in the wiring task when we update the accessory system to use the new tabbed panel.

Wait — the old `<div id="accessory-panel">` was removed from HTML in Task 10. So `accessoryPanel` will be `null`. The accessories system will need to work with the new panel. Let's keep `accessoryPanel` pointing to `null` for now and fix it in the wiring task. Actually, let's just remove it:

Replace `accessoryPanel: document.getElementById('accessory-panel'),` with nothing (remove that line). The accessory system will be refactored in the picker task.

- [ ] **Step 2: Commit**

```bash
git add js/dom/refs.js
git commit -m "feat(refs): add unlock picker and payment modal DOM refs"
```

---

### Task 12: Add CSS for Unlock Picker, Payment Modal, and Emoji Particles

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add unlock tab styles**

Add after the `.accessory-option.locked` block (after line 525):

```css
/* ── Unlock picker tabs ── */
#unlock-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.unlock-tab {
  flex: 1;
  padding: 6px 4px;
  border: 1px solid rgba(0, 80, 160, 0.15);
  border-radius: 6px;
  background: rgba(0, 80, 160, 0.06);
  color: #1e3a5f;
  font-family: 'Boogaloo', cursive;
  font-size: 0.78rem;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s, border-color 0.15s;
}

.unlock-tab:hover {
  background: rgba(0, 80, 160, 0.14);
}

.unlock-tab:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

.unlock-tab.active {
  background: rgba(88, 28, 135, 0.18);
  border-color: #7c3aed;
  color: #581c87;
}

/* Section headers inside tabs */
.unlock-section-title {
  font-size: 0.72rem;
  color: #581c87;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 10px 0 6px;
  padding-bottom: 2px;
  border-bottom: 1px solid rgba(88, 28, 135, 0.15);
}

.unlock-section-title:first-child {
  margin-top: 0;
}

/* Buy button on locked items */
.unlock-buy-btn {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 8px;
  border: 1px solid rgba(88, 28, 135, 0.3);
  border-radius: 4px;
  background: rgba(88, 28, 135, 0.1);
  color: #7c3aed;
  font-family: 'Boogaloo', cursive;
  font-size: 0.72rem;
  cursor: pointer;
  transition: background 0.15s;
}

.unlock-buy-btn:hover {
  background: rgba(88, 28, 135, 0.22);
}

/* ── Emoji particles (scattered by ink system) ── */
.emoji-particle {
  position: fixed;
  pointer-events: none;
  z-index: 21;
  will-change: transform, opacity;
  line-height: 1;
}
```

- [ ] **Step 2: Add payment modal styles**

Add after the emoji particle styles:

```css
/* ── Payment modal ── */
.payment-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.payment-modal[hidden] {
  display: none;
}

.payment-modal-inner {
  position: relative;
  width: min(90vw, 380px);
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 24px;
  font-family: 'Boogaloo', cursive;
  color: #1e3a5f;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.payment-close {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s;
}

.payment-close:hover {
  color: #475569;
  background: rgba(0, 0, 0, 0.06);
}

.payment-close:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

.payment-title {
  font-size: 1.2rem;
  color: #581c87;
  margin-bottom: 12px;
  text-align: center;
}

.payment-body {
  margin-bottom: 16px;
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
}

.payment-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.payment-actions input[type="text"],
.payment-actions textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(0, 80, 160, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-family: 'Boogaloo', cursive;
  font-size: 0.9rem;
  color: #1e3a5f;
  outline: none;
  transition: border-color 0.2s;
}

.payment-actions input[type="text"]:focus,
.payment-actions textarea:focus {
  border-color: #7c3aed;
}

.payment-actions textarea {
  min-height: 60px;
  resize: vertical;
}

.payment-submit-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #7c3aed;
  color: #fff;
  font-family: 'Boogaloo', cursive;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.payment-submit-btn:hover {
  background: #6d28d9;
}

.payment-submit-btn:active {
  transform: scale(0.96);
}

.payment-submit-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.payment-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Progress bar (patience payment) */
.payment-progress {
  width: 100%;
  height: 20px;
  background: rgba(0, 80, 160, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin: 8px 0;
}

.payment-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #a78bfa);
  border-radius: 10px;
  transition: width 0.3s ease-out;
  width: 0%;
}

/* Queue display (wait in line payment) */
.payment-queue-number {
  font-size: 2.5rem;
  color: #7c3aed;
  font-family: 'VT323', monospace;
  margin: 8px 0;
}

/* Checkbox list (promise payment) */
.payment-promise-list {
  text-align: left;
  list-style: none;
  padding: 0;
}

.payment-promise-list li {
  padding: 6px 0;
}

.payment-promise-list label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 0.88rem;
}

.payment-promise-list input[type="checkbox"] {
  margin-top: 2px;
  accent-color: #7c3aed;
}

/* Trivia choices */
.payment-trivia-choices {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.payment-trivia-choice {
  padding: 10px 14px;
  border: 1px solid rgba(0, 80, 160, 0.2);
  border-radius: 8px;
  background: rgba(0, 80, 160, 0.06);
  color: #1e3a5f;
  font-family: 'Boogaloo', cursive;
  font-size: 0.88rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, border-color 0.15s;
}

.payment-trivia-choice:hover {
  background: rgba(0, 80, 160, 0.14);
  border-color: rgba(0, 80, 160, 0.3);
}

.payment-trivia-choice.correct {
  background: rgba(22, 163, 74, 0.2);
  border-color: #16a34a;
  color: #15803d;
}

.payment-trivia-choice.wrong {
  background: rgba(220, 38, 38, 0.15);
  border-color: #dc2626;
  color: #dc2626;
}

/* Easter egg reveal animation */
.easter-egg-reveal {
  position: fixed;
  z-index: 55;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 4rem;
  animation: easter-egg-pop 1.5s ease-out forwards;
  pointer-events: none;
}

@keyframes easter-egg-pop {
  0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  30%  { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
  50%  { transform: translate(-50%, -50%) scale(1); }
  80%  { opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1) translateY(-40px); opacity: 0; }
}
```

- [ ] **Step 3: Add reduced-motion support for new animations**

Add to the `@media (prefers-reduced-motion: reduce)` block:

```css
  .easter-egg-reveal { animation-duration: 0.01s; }
  .payment-modal-inner { transition-duration: 0.01s; }
```

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat(css): add unlock picker, payment modal, and emoji particle styles"
```

---

### Task 13: Create the Payment System Module

**Files:**
- Create: `js/ui/payments.js`

- [ ] **Step 1: Create the payments module**

Create `js/ui/payments.js`:

```js
import { GAME } from '../constants.js';

/**
 * 10 silly payment types.  Each has a `run` function that takes over the
 * payment modal and resolves a promise when the player "pays."
 * The promise resolves `true` on success, `false` if cancelled.
 */

const PAYMENT_TYPES = [
  {
    id: 'compliment',
    label: 'Pay with a Compliment',
    description: 'Say something nice to the squid!',
    run: runCompliment,
  },
  {
    id: 'confession',
    label: 'Pay with a Confession',
    description: 'Tell the squid an embarrassing secret.',
    run: runConfession,
  },
  {
    id: 'dance',
    label: 'Pay with a Dance',
    description: 'Shake your device (or wiggle your mouse) for 5 seconds!',
    run: runDance,
  },
  {
    id: 'patience',
    label: 'Pay with Patience',
    description: 'Processing your payment...',
    run: runPatience,
  },
  {
    id: 'trivia',
    label: 'Pay with Knowledge',
    description: 'Answer this squid trivia question correctly!',
    run: runTrivia,
  },
  {
    id: 'pun',
    label: 'Pay with a Bad Pun',
    description: 'Submit your worst pun. The squid will judge you.',
    run: runPun,
  },
  {
    id: 'promise',
    label: 'Pay with Promises',
    description: 'Solemnly swear to uphold these sacred vows:',
    run: runPromise,
  },
  {
    id: 'highfive',
    label: 'Pay with a High Five',
    description: 'Tap the screen exactly 5 times!',
    run: runHighFive,
  },
  {
    id: 'serenade',
    label: 'Pay with a Serenade',
    description: 'Sing, hum, or yell for 3 seconds. The squid is listening.',
    run: runSerenade,
  },
  {
    id: 'queue',
    label: 'Wait in Line',
    description: 'Please wait. Your position in line:',
    run: runQueue,
  },
];

/** Deterministic payment assignment seeded by item ID string. */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPaymentForItem(itemId) {
  const idx = hashCode(itemId) % PAYMENT_TYPES.length;
  return PAYMENT_TYPES[idx];
}

/** Trivia questions — loaded once from data/trivia.json */
let triviaQuestions = null;

async function loadTrivia() {
  if (triviaQuestions) return triviaQuestions;
  const url = new URL('../../data/trivia.json', import.meta.url);
  const res = await fetch(url);
  if (!res.ok) return [];
  triviaQuestions = await res.json();
  return triviaQuestions;
}

/**
 * Creates the payment system.
 * @param {object} refs - DOM refs (paymentModal, paymentClose, paymentTitle, paymentBody, paymentActions)
 * @returns {{ requestPayment(itemId): Promise<boolean> }}
 */
export function createPaymentSystem(refs) {
  let activeReject = null;

  function showModal() {
    refs.paymentModal.hidden = false;
  }

  function hideModal() {
    refs.paymentModal.hidden = true;
    refs.paymentTitle.textContent = '';
    refs.paymentBody.textContent = '';
    refs.paymentActions.innerHTML = '';
    if (activeReject) {
      activeReject(false);
      activeReject = null;
    }
  }

  refs.paymentClose.addEventListener('click', hideModal);
  refs.paymentModal.addEventListener('click', (e) => {
    if (e.target === refs.paymentModal) hideModal();
  });

  /**
   * Open the payment modal for a given item.
   * Resolves true if payment completed, false if cancelled.
   */
  async function requestPayment(itemId) {
    const payment = getPaymentForItem(itemId);

    refs.paymentTitle.textContent = payment.label;
    refs.paymentBody.textContent = payment.description;
    refs.paymentActions.innerHTML = '';
    showModal();

    return new Promise((resolve) => {
      activeReject = resolve;
      payment.run(refs, resolve);
    });
  }

  return { requestPayment };
}

/* ── Payment implementations ── */

function runCompliment(refs, resolve) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'You have beautiful tentacles...';
  input.maxLength = 140;

  const btn = makeSubmitBtn('Compliment!');
  btn.disabled = true;
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 3; });
  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'The squid is blushing! \u{1F97A}';
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.appendChild(input);
  refs.paymentActions.appendChild(btn);
  input.focus();
}

function runConfession(refs, resolve) {
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'I once pretended to understand Git rebasing...';
  textarea.maxLength = 280;

  const btn = makeSubmitBtn('Confess!');
  btn.disabled = true;
  textarea.addEventListener('input', () => { btn.disabled = textarea.value.trim().length < 5; });
  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'Your secret is safe with the squid. Probably. \u{1F92B}';
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.appendChild(textarea);
  refs.paymentActions.appendChild(btn);
  textarea.focus();
}

function runDance(refs, resolve) {
  let motion = 0;
  const THRESHOLD = 50; /* arbitrary motion accumulation target */
  const duration = GAME.PAYMENT_DANCE_MS;

  const bar = makeProgressBar();
  refs.paymentActions.appendChild(bar.container);

  let lastX = null;
  let lastY = null;

  function onMouseMove(e) {
    if (lastX !== null) {
      motion += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
    }
    lastX = e.clientX;
    lastY = e.clientY;
    bar.update(Math.min(motion / (THRESHOLD * 30), 1));
  }

  function onDeviceMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (a) motion += Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    bar.update(Math.min(motion / (THRESHOLD * 30), 1));
  }

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('devicemotion', onDeviceMotion);

  setTimeout(() => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('devicemotion', onDeviceMotion);

    if (motion > THRESHOLD) {
      refs.paymentBody.textContent = 'Sick moves! The squid approves. \u{1F57A}';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
    } else {
      refs.paymentBody.textContent = 'The squid was not impressed. Try again!';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { runDance(refs, resolve); }, 1000);
    }
  }, duration);
}

function runPatience(refs, resolve) {
  const bar = makeProgressBar();
  refs.paymentActions.appendChild(bar.container);

  const total = GAME.PAYMENT_PATIENCE_MS;
  const start = Date.now();
  const messages = [
    'Contacting squid bank...',
    'Verifying tentacle print...',
    'Counting ink droplets...',
    'Almost there...',
    'Just kidding, halfway there...',
    'The squid is thinking...',
    'Processing...',
    'Done!',
  ];

  let msgIdx = 0;
  const interval = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(elapsed / total, 1);
    bar.update(pct);

    const newIdx = Math.min(Math.floor(pct * messages.length), messages.length - 1);
    if (newIdx !== msgIdx) {
      msgIdx = newIdx;
      refs.paymentBody.textContent = messages[msgIdx];
    }

    if (pct >= 1) {
      clearInterval(interval);
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 800);
    }
  }, 200);
}

async function runTrivia(refs, resolve) {
  const questions = await loadTrivia();
  if (questions.length === 0) {
    refs.paymentBody.textContent = 'No trivia available. Have this one free!';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
    return;
  }

  const q = questions[Math.floor(Math.random() * questions.length)];
  refs.paymentBody.textContent = q.question;

  const choicesDiv = document.createElement('div');
  choicesDiv.className = 'payment-trivia-choices';

  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'payment-trivia-choice';
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      /* Disable all choices */
      choicesDiv.querySelectorAll('button').forEach(b => { b.disabled = true; });

      if (i === q.answer) {
        btn.classList.add('correct');
        refs.paymentBody.textContent = 'Correct! The squid is impressed. \u{1F929}';
        setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      } else {
        btn.classList.add('wrong');
        choicesDiv.children[q.answer].classList.add('correct');
        refs.paymentBody.textContent = 'Wrong! Try again next time. \u{1F614}';
        setTimeout(() => {
          refs.paymentBody.textContent = q.question;
          choicesDiv.querySelectorAll('button').forEach(b => {
            b.disabled = false;
            b.classList.remove('correct', 'wrong');
          });
        }, 1500);
      }
    });
    choicesDiv.appendChild(btn);
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(choicesDiv);
}

function runPun(refs, resolve) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "What do you call a lazy squid? A sluggish squid...";
  input.maxLength = 200;

  const btn = makeSubmitBtn('Submit Pun');
  btn.disabled = true;
  input.addEventListener('input', () => { btn.disabled = input.value.trim().length < 3; });

  const judgments = [
    'The squid groaned so hard it squirted. Approved!',
    'Terrible. Absolutely terrible. ...the squid loved it.',
    'The squid rolled all its eyes. That means you pass!',
    'Even the ink turned a little. Well done.',
    'The tentacles curled in agony. Payment accepted!',
  ];

  btn.addEventListener('click', () => {
    const judgment = judgments[Math.floor(Math.random() * judgments.length)];
    refs.paymentBody.textContent = judgment;
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1800);
  });

  refs.paymentActions.appendChild(input);
  refs.paymentActions.appendChild(btn);
  input.focus();
}

function runPromise(refs, resolve) {
  const promises = [
    'I promise to think about squids at least once today',
    'I solemnly swear to never eat calamari again (starting tomorrow)',
    'I will tell one person about this squid game',
    'I accept that squids are superior to octopuses (sorry not sorry)',
    'I will do my best impression of a squid in the next 24 hours',
  ];

  const list = document.createElement('ul');
  list.className = 'payment-promise-list';

  const checkboxes = [];
  for (const text of promises) {
    const li = document.createElement('li');
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    checkboxes.push(cb);
    label.appendChild(cb);
    label.appendChild(document.createTextNode(text));
    li.appendChild(label);
    list.appendChild(li);
  }

  const btn = makeSubmitBtn('I Solemnly Swear');
  btn.disabled = true;

  function updateBtn() {
    btn.disabled = !checkboxes.every(cb => cb.checked);
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateBtn));

  btn.addEventListener('click', () => {
    refs.paymentBody.textContent = 'The squid trusts you. Don\'t let it down. \u{1F91D}';
    refs.paymentActions.innerHTML = '';
    setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(list);
  refs.paymentActions.appendChild(btn);
}

function runHighFive(refs, resolve) {
  let taps = 0;
  const TARGET = 5;
  const display = document.createElement('div');
  display.style.fontSize = '3rem';
  display.style.textAlign = 'center';
  display.style.color = '#7c3aed';
  display.style.fontFamily = "'VT323', monospace";
  display.textContent = `${taps} / ${TARGET}`;

  const tapZone = document.createElement('button');
  tapZone.className = 'payment-submit-btn';
  tapZone.style.width = '100%';
  tapZone.style.padding = '20px';
  tapZone.style.fontSize = '1.1rem';
  tapZone.textContent = '\u{270B} Tap here!';

  tapZone.addEventListener('click', () => {
    taps++;
    display.textContent = `${taps} / ${TARGET}`;
    if (taps >= TARGET) {
      refs.paymentBody.textContent = 'High five received! \u{1F64F}';
      refs.paymentActions.innerHTML = '';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
    }
  });

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(display);
  refs.paymentActions.appendChild(tapZone);
}

function runSerenade(refs, resolve) {
  const duration = GAME.PAYMENT_SERENADE_MS;
  const bar = makeProgressBar();

  const startBtn = makeSubmitBtn('\u{1F3A4} Start Singing');

  startBtn.addEventListener('click', async () => {
    refs.paymentActions.innerHTML = '';
    refs.paymentActions.appendChild(bar.container);

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_) {
      /* No mic access — just accept it anyway */
      refs.paymentBody.textContent = 'No mic? The squid appreciates the effort anyway!';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      return;
    }

    refs.paymentBody.textContent = 'The squid is listening... keep going!';
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      bar.update(pct);

      if (pct >= 1) {
        clearInterval(interval);
        stream.getTracks().forEach(t => t.stop());
        refs.paymentBody.textContent = 'Beautiful! The squid has tears in its eyes. \u{1F3B6}';
        refs.paymentActions.innerHTML = '';
        setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1200);
      }
    }, 100);
  });

  refs.paymentActions.appendChild(startBtn);
}

function runQueue(refs, resolve) {
  let position = 30 + Math.floor(Math.random() * 40);

  const display = document.createElement('div');
  display.className = 'payment-queue-number';
  display.textContent = `#${position}`;

  refs.paymentActions.innerHTML = '';
  refs.paymentActions.appendChild(display);

  function tick() {
    position--;
    display.textContent = position > 0 ? `#${position}` : 'You\'re up!';

    const messages = [
      'Please hold...',
      'Your squirt is important to us.',
      'Estimated wait: forever.',
      'Did you know? Squids can fly.',
      'Still waiting...',
      'The squid thanks you for your patience.',
      'Almost there... probably.',
    ];
    refs.paymentBody.textContent = messages[Math.floor(Math.random() * messages.length)];

    if (position <= 0) {
      refs.paymentBody.textContent = 'Welcome! Transaction complete. \u{1F389}';
      setTimeout(() => { refs.paymentModal.hidden = true; resolve(true); }, 1000);
      return;
    }

    /* Random delay — sometimes fast, sometimes slow */
    const delay = GAME.PAYMENT_QUEUE_BASE_MS + Math.random() * GAME.PAYMENT_QUEUE_BASE_MS * 2;
    setTimeout(tick, delay);
  }

  setTimeout(tick, GAME.PAYMENT_QUEUE_BASE_MS);
}

/* ── Helpers ── */

function makeSubmitBtn(label) {
  const btn = document.createElement('button');
  btn.className = 'payment-submit-btn';
  btn.textContent = label;
  return btn;
}

function makeProgressBar() {
  const container = document.createElement('div');
  container.className = 'payment-progress';
  const bar = document.createElement('div');
  bar.className = 'payment-progress-bar';
  container.appendChild(bar);
  return {
    container,
    update(pct) { bar.style.width = `${Math.round(pct * 100)}%`; },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/payments.js
git commit -m "feat(payments): add 10 silly microtransaction payment types"
```

---

### Task 14: Create the Tabbed Unlock Picker UI

**Files:**
- Create: `js/ui/unlock-picker.js`

- [ ] **Step 1: Create the unlock picker module**

This replaces the accessory panel toggle with a tabbed panel supporting Hats, Ink, and Confetti tabs.

Create `js/ui/unlock-picker.js`:

```js
import { GAME } from '../constants.js';

/**
 * Tabbed unlock picker panel (Hats / Ink / Confetti).
 *
 * @param {object} refs - DOM refs
 * @param {object} unlockManager - unlock manager instance
 * @param {object} paymentSystem - payment system instance
 * @param {function} buildHatsContent - function that returns DOM nodes for the Hats tab
 * @returns {{ close(), refresh() }}
 */
export function createUnlockPicker(refs, unlockManager, paymentSystem, buildHatsContent) {
  let open = false;
  let activeTab = 'hats';

  const tabBtns = refs.unlockTabs.querySelectorAll('.unlock-tab');

  /* ── Tab switching ── */

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === activeTab));
      renderTab();
    });
  });

  /* ── Panel open/close ── */

  function toggle() {
    open = !open;
    refs.unlockPanel.classList.toggle('open', open);
    refs.accessoryBtn.classList.toggle('active', open);
    if (open) renderTab();
  }

  function close() {
    if (!open) return;
    open = false;
    refs.unlockPanel.classList.remove('open');
    refs.accessoryBtn.classList.remove('active');
  }

  refs.accessoryBtn.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
  refs.unlockPanel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);

  /* ── Render tabs ── */

  function renderTab() {
    const container = refs.unlockTabContent;
    container.innerHTML = '';

    switch (activeTab) {
      case 'hats':
        buildHatsContent(container);
        break;
      case 'ink':
        renderInkTab(container);
        break;
      case 'confetti':
        renderConfettiTab(container);
        break;
    }
  }

  /* ── Ink tab (ink colors + sprinkles + emoji packs) ── */

  function renderInkTab(container) {
    const pins = unlockManager.getPins();

    /* Random option */
    appendOption(container, {
      label: 'Random (surprise me)',
      selected: pins.ink === null,
      onClick() {
        unlockManager.pinInk(null);
        renderTab();
      },
    });

    /* Ink colors section */
    appendSectionTitle(container, 'Ink Colors');
    for (const item of unlockManager.getInkDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinInk(item.id);
          renderTab();
        },
      });
    }

    /* Sprinkles section */
    appendSectionTitle(container, 'Sprinkles');
    for (const item of unlockManager.getSprinkleDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinInk(item.id);
          renderTab();
        },
      });
    }

    /* Emoji packs section */
    appendSectionTitle(container, 'Emoji Packs');
    for (const item of unlockManager.getEmojiDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.revealName : item.name,
        locked: !isUnlocked,
        selected: pins.ink === item.id,
        showBuy: false, /* No microtransactions for easter eggs */
        onClick() {
          if (isUnlocked) {
            unlockManager.pinInk(item.id);
            renderTab();
          }
        },
      });
    }
  }

  /* ── Confetti tab ── */

  function renderConfettiTab(container) {
    const pins = unlockManager.getPins();

    /* Random option */
    appendOption(container, {
      label: 'Random (surprise me)',
      selected: pins.confetti === null,
      onClick() {
        unlockManager.pinConfetti(null);
        renderTab();
      },
    });

    /* Default mini-squid is always available — represent as "Classic Squid" */
    appendOption(container, {
      label: 'Classic Squid',
      selected: pins.confetti === 'default',
      onClick() {
        unlockManager.pinConfetti('default');
        renderTab();
      },
    });

    for (const item of unlockManager.getConfettiDefs()) {
      const isUnlocked = unlockManager.isUnlocked(item.id);
      appendOption(container, {
        label: isUnlocked ? item.name : `${item.name} (${item.unlock.toLocaleString()} squirts)`,
        locked: !isUnlocked,
        selected: pins.confetti === item.id,
        showBuy: !isUnlocked,
        itemId: item.id,
        onClick() {
          unlockManager.pinConfetti(item.id);
          renderTab();
        },
      });
    }
  }

  /* ── Helpers ── */

  function appendSectionTitle(container, text) {
    const el = document.createElement('div');
    el.className = 'unlock-section-title';
    el.textContent = text;
    container.appendChild(el);
  }

  function appendOption(container, { label, locked, selected, showBuy, itemId, onClick }) {
    const btn = document.createElement('button');
    btn.className = 'accessory-option';
    if (locked) btn.classList.add('locked');
    if (selected) btn.classList.add('selected');
    btn.disabled = locked && !showBuy;

    btn.textContent = label;

    if (showBuy) {
      btn.disabled = false;
      btn.classList.remove('locked');
      const buyBtn = document.createElement('span');
      buyBtn.className = 'unlock-buy-btn';
      buyBtn.textContent = '\u{1F4B8} Buy';
      buyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const success = await paymentSystem.requestPayment(itemId);
        if (success) {
          unlockManager.unlockViaTxn(itemId);
          renderTab();
        }
      });
      btn.appendChild(buyBtn);
    }

    if (!locked) {
      btn.addEventListener('click', onClick);
    }

    container.appendChild(btn);
  }

  return { close, refresh: renderTab };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/unlock-picker.js
git commit -m "feat(ui): add tabbed unlock picker with buy buttons"
```

---

### Task 15: Refactor Accessories to Work with Tabbed Picker

**Files:**
- Modify: `js/ui/accessories.js`

The hat system currently builds its own panel. We need to extract just the hat content generation so the tabbed picker can embed it.

- [ ] **Step 1: Export a function that builds hat content into a given container**

Add a new export to `js/ui/accessories.js`. Replace the `buildPanel` function and modify `createAccessorySystem` to accept `panelEl` as optional (it may be `null` now since the old `#accessory-panel` div is gone). The key change: instead of building into `panelEl`, export a `buildHatsContent(container)` function.

Replace the entire `createAccessorySystem` function signature and body. The function no longer manages its own panel open/close — the tabbed picker handles that:

```js
/**
 * Manages the hat overlay inside the squid SVG and the random rotation on
 * each surface.  Panel building is delegated to the tabbed unlock picker.
 */
export function createAccessorySystem(svgBodyEl, totalCount) {
  let pinned = localStorage.getItem(GAME.ACCESSORY_KEY) || 'random';
  let currentCount = totalCount;
  let lastRandomIdx = -1;

  const accGroup = document.createElementNS(SVG_NS, 'g');
  accGroup.id = 'squid-accessories';
  const kids = svgBodyEl.children;
  if (kids.length > 4) {
    svgBodyEl.insertBefore(accGroup, kids[4]);
  } else {
    svgBodyEl.appendChild(accGroup);
  }

  function renderHat(hat) {
    accGroup.innerHTML = '';
    if (hat && hat.svg) accGroup.innerHTML = hat.svg;
  }

  function pickRandomHat() {
    const pool = availableHats(currentCount);
    if (pool.length === 0) return null;
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (idx === lastRandomIdx && pool.length > 1);
    lastRandomIdx = idx;
    return pool[idx];
  }

  function applyHat() {
    if (pinned === 'random') {
      renderHat(pickRandomHat());
    } else {
      const hat = HATS.find(h => h.id === pinned);
      if (hat && currentCount >= hat.unlock) {
        renderHat(hat);
      } else {
        renderHat(pickRandomHat());
      }
    }
  }

  /**
   * Build hat options into an external container (called by unlock-picker).
   */
  function buildHatsContent(container) {
    /* "Random" option */
    const randBtn = document.createElement('button');
    randBtn.className = 'accessory-option';
    randBtn.classList.toggle('selected', pinned === 'random');
    randBtn.textContent = 'Random (surprise me)';
    randBtn.addEventListener('click', () => {
      pinned = 'random';
      localStorage.setItem(GAME.ACCESSORY_KEY, pinned);
      applyHat();
      buildHatsContent(container);
    });
    container.appendChild(randBtn);

    for (const hat of HATS) {
      if (!hat.svg) continue;
      const btn = document.createElement('button');
      btn.className = 'accessory-option';
      const locked = currentCount < hat.unlock;
      btn.disabled = locked;
      btn.classList.toggle('locked', locked);
      btn.classList.toggle('selected', pinned === hat.id);

      btn.textContent = locked
        ? `${hat.name} (${hat.unlock.toLocaleString()} squirts)`
        : hat.name;

      btn.addEventListener('click', () => {
        pinned = hat.id;
        localStorage.setItem(GAME.ACCESSORY_KEY, pinned);
        applyHat();
        /* Re-render by clearing and rebuilding */
        container.innerHTML = '';
        buildHatsContent(container);
      });
      container.appendChild(btn);
    }
  }

  applyHat();

  return {
    updateCount(n) { currentCount = n; },
    onSurface() { applyHat(); },
    buildHatsContent,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui/accessories.js
git commit -m "refactor(accessories): extract hat content builder for tabbed picker"
```

---

### Task 16: Wire Everything Up in app.js

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Add imports for new modules**

Add these imports after the existing imports at the top of `js/app.js`:

```js
import { createUnlockManager } from './unlocks/unlock-manager.js';
import { createUnlockPicker } from './ui/unlock-picker.js';
import { createPaymentSystem } from './ui/payments.js';
```

- [ ] **Step 2: Update the accessories initialization**

Replace the existing `createAccessorySystem` call (lines 68-70):

```js
  const accessories = createAccessorySystem(
    refs.squidBody, refs.accessoryBtn, refs.accessoryPanel, count
  );
```

with:

```js
  const accessories = createAccessorySystem(refs.squidBody, count);
```

- [ ] **Step 3: Initialize unlock manager, payment system, and picker**

After the accessories initialization (and before `/* ── Init display ── */`), add:

```js
  const unlockManager = createUnlockManager(count);
  const paymentSystem = createPaymentSystem(refs);
  const unlockPicker = createUnlockPicker(
    refs, unlockManager, paymentSystem, (container) => accessories.buildHatsContent(container)
  );
```

- [ ] **Step 4: Set render mode before each squirt's ink spawn**

In the `doSquirt` function, after the line `const inkY = mouth.top + mouth.height * 0.5;` (line 169) and before `ink.spawnInk(...)` (line 170), add:

```js
    /* Set ink render mode from unlock manager */
    const particleStyle = unlockManager.pickParticleStyle();
    if (particleStyle) {
      switch (particleStyle.type) {
        case 'ink':
          ink.setRenderMode({
            mode: 'ink',
            hue: particleStyle.item.hue === null
              ? () => Math.floor(Math.random() * 360)
              : particleStyle.item.hue,
          });
          break;
        case 'sprinkle':
          ink.setRenderMode({ mode: 'sprinkle', huePool: particleStyle.item.hues });
          break;
        case 'emoji':
          ink.setRenderMode({ mode: 'emoji', emojis: particleStyle.item.emojis });
          break;
      }
    } else {
      ink.setRenderMode(null);
    }
```

- [ ] **Step 5: Update bumpCounter to check unlocks and show easter egg reveals**

In the `bumpCounter` function, after the `accessories.updateCount(count);` line (line 115), add:

```js
    /* Unlock check */
    const { milestoneUnlocks, easterEggUnlocks } = unlockManager.onSquirt(count);

    /* Easter egg reveal animation */
    for (const egg of easterEggUnlocks) {
      const reveal = document.createElement('div');
      reveal.className = 'easter-egg-reveal';
      reveal.textContent = egg.emojis ? egg.emojis[0] : '\u{2753}';
      document.body.appendChild(reveal);
      reveal.addEventListener('animationend', () => reveal.remove());
    }
```

- [ ] **Step 6: Pass confetti shape to spawnSquidConfetti**

In the `bumpCounter` function, replace the line:

```js
        spawnSquidConfetti();
```

with:

```js
        spawnSquidConfetti(unlockManager.pickConfettiShape());
```

Also update the milestone celebration. The `celebrateMilestone` function in `milestone.js` calls `spawnSquidConfetti()` internally. We need to update it to accept a shape. In `js/fx/milestone.js`, change the function:

Actually, this is a cross-file change. Let's handle it here:

- [ ] **Step 7: Update milestone.js to accept confetti shape**

In `js/fx/milestone.js`, change the `celebrateMilestone` function to accept a shape parameter:

Replace:
```js
export function celebrateMilestone() {
  /* Three staggered confetti waves */
  spawnSquidConfetti();
  setTimeout(() => spawnSquidConfetti(), 300);
  setTimeout(() => spawnSquidConfetti(), 600);
```

with:
```js
export function celebrateMilestone(confettiShape) {
  /* Three staggered confetti waves */
  spawnSquidConfetti(confettiShape);
  setTimeout(() => spawnSquidConfetti(confettiShape), 300);
  setTimeout(() => spawnSquidConfetti(confettiShape), 600);
```

Then in `app.js`, update the milestone celebration call. Replace:
```js
      celebrateMilestone();
```
with:
```js
      celebrateMilestone(unlockManager.pickConfettiShape());
```

- [ ] **Step 8: Verify the full integration**

Run: Start dev server (`npm start`), open browser. Test:
1. Squirt 10 times — Red Ink should unlock
2. Open the picker (star button) — tabs should show Hats/Ink/Confetti
3. Switch to Ink tab — Red Ink should be unlocked, others locked with "Buy" buttons
4. Click a "Buy" button — payment modal should open
5. Complete a payment — item should unlock
6. Pin an ink color — next squirts should use that color
7. Keep squirting to verify progression through thresholds
8. Try rapid-fire squirting (10 in 3s) — water droplet emoji should unlock with reveal animation

- [ ] **Step 9: Commit**

```bash
git add js/app.js js/fx/milestone.js
git commit -m "feat(unlocks): wire unlock manager, picker, and payments into game loop"
```

---

### Task 17: Update Roadmap

**Files:**
- Modify: `docs/ROADMAP.md`

- [ ] **Step 1: Add unlock system to completed items in the roadmap**

Read `docs/ROADMAP.md` and add to the Completed section:

```markdown
- **Unlock system** — unlockable ink colors (7 + rainbow), sprinkles (7 + rainbow), 4 secret emoji packs (easter eggs), 5 confetti shapes. Tabbed picker UI with pin/random selection. 10 silly microtransaction payment types as optional shortcuts. All unlocks earnable through play, milestones max at 1,000 squirts.
```

- [ ] **Step 2: Commit**

```bash
git add docs/ROADMAP.md
git commit -m "docs(roadmap): add unlock system to completed features"
```
