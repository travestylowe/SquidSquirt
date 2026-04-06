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
          /* Trigger within 30s of midnight PST (UTC-8) */
          const now = new Date();
          const pstMs = now.getTime() + (now.getTimezoneOffset() * 60000) - (8 * 3600000);
          const pstDate = new Date(pstMs);
          const secsIntoPstDay = pstDate.getHours() * 3600 + pstDate.getMinutes() * 60 + pstDate.getSeconds();
          triggered = secsIntoPstDay <= 30 || secsIntoPstDay >= 86370; /* 30s each side */
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
    const now = Date.now();

    /* Push current squirt BEFORE checks so rapid-fire sees the 10th squirt */
    recentSquirts.push(now);
    if (recentSquirts.length > GAME.EASTER_EGG_RAPID_COUNT + 5) {
      recentSquirts.splice(0, recentSquirts.length - GAME.EASTER_EGG_RAPID_COUNT - 5);
    }
    sessionSquirts++;

    /* idle-then-squirt uses lastSquirtTime from BEFORE this squirt (still set to previous) */
    const easterEggUnlocks = checkEasterEggs();

    /* Now update lastSquirtTime for future idle checks */
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
