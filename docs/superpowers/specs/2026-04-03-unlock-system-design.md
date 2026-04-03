# Unlock System Design

## Overview

Expand SquidSquirt's progression system with unlockable ink colors, sprinkles, emoji packs, confetti shapes, and a silly microtransaction system. All unlocks are earnable through play — microtransactions are a fun optional shortcut, never a gate.

## Unlock Types

### Ink Colors (8 unlocks, squirt-count milestones)

Swap the particle hue in the existing ink system.

| Squirts | Unlock |
|---------|--------|
| 10 | Red ink |
| 30 | Orange ink |
| 60 | Yellow ink |
| 100 | Green ink |
| 175 | Blue ink |
| 300 | Indigo ink |
| 500 | Violet ink |
| 1,000 | Rainbow ink |

Rainbow ink requires all 7 singles to be unlocked (which they will be by 1,000).

### Sprinkles (8 unlocks, squirt-count milestones)

Same particle physics as ink, but each particle gets a random color from the selected palette. Single-color sprinkles = monochrome burst. Rainbow sprinkles = all 7 colors per burst.

| Squirts | Unlock |
|---------|--------|
| 20 | Red sprinkles |
| 50 | Orange sprinkles |
| 80 | Yellow sprinkles |
| 125 | Green sprinkles |
| 225 | Blue sprinkles |
| 400 | Indigo sprinkles |
| 650 | Violet sprinkles |
| 1,000 | Rainbow sprinkles |

### Emoji Packs (4 unlocks, secret easter egg triggers)

Emojis use the sprinkle emitter (multi-particle scatter, no drips/stains/blur). They are a third rendering mode alongside ink and sprinkles for the particle system.

| Trigger | Unlock | Detection |
|---------|--------|-----------|
| 10 squirts in 3 seconds | Water droplets | Ring buffer of last 10 squirt timestamps; check if oldest is within 3s |
| Squirt at exactly midnight (local) | Stars | Check `hours === 0 && minutes === 0` on squirt (1-minute window) |
| 100 squirts without closing tab | Hearts | Session counter (not persisted), resets on page load |
| Idle 5 minutes then squirt | Skulls | Track last squirt time, check if gap >= 300,000ms |

Easter egg emoji packs have NO microtransaction option. They can only be discovered.

### Confetti Shapes (5 unlocks, squirt-count milestones)

Replace the current mini-squid confetti SVGs with unlocked shape SVGs. Same parabolic arc physics.

| Squirts | Unlock |
|---------|--------|
| 40 | Stars confetti |
| 90 | Hearts confetti |
| 150 | Fish confetti |
| 350 | Anchors confetti |
| 750 | Tentacles confetti |

## Selection Behavior

- **Ink, sprinkles, and emoji share one selection slot** (the particle system). Player picks one active style.
- **Confetti has its own separate selection slot.**
- **Default: random** — each squirt randomly picks from all unlocked styles. Each confetti trigger randomly picks from unlocked shapes.
- **Pin to override** — tapping an item in the picker pins it. It stays active every squirt until changed.
- **"Random" option** — explicit option in the picker to return to random selection.

## Microtransactions

Every milestone-based unlock (ink, sprinkles, confetti) has two paths: earn it via squirt count, OR "buy" it with a silly microtransaction. These are optional shortcuts, never forced.

### The 10 Payment Methods

| Payment | Player Action |
|---------|--------------|
| Compliment | Type a compliment to the squid |
| Confession | Type an embarrassing secret |
| Dance | Shake phone / wiggle mouse for 5 seconds |
| Patience | Watch a fake loading bar for 30 seconds |
| Squid Trivia | Answer a real squid fact question correctly |
| Bad Pun | Submit a pun (squid judges it) |
| Promise | Check absurd checkbox promises |
| High Five | Tap the screen exactly 5 times in rhythm |
| Serenade | Grant mic access, make noise for 3 seconds |
| Wait in Line | Sit through a fake queue countdown |

### Payment Assignment

- Each locked item gets a randomly assigned payment type, seeded by item ID so it's consistent across sessions.
- Payment UI is a modal overlay themed to the payment type.
- After "payment," the item unlocks immediately and persists to localStorage.
- Easter egg emoji packs have no microtransaction option.

## Easter Egg Reveal

- When an easter egg unlocks, a special animation plays (distinct from milestone celebrations) — squid wink + "???" bubble that reveals the emoji.
- The picker shows easter egg slots as "???" until discovered.
- No hints about how to unlock them.

## Architecture

### New Files

| File | Responsibility |
|------|---------------|
| `js/unlocks/ink-unlocks.js` | Ink color definitions, thresholds, hue values |
| `js/unlocks/sprinkle-unlocks.js` | Sprinkle definitions, thresholds, multi-color particle config |
| `js/unlocks/emoji-unlocks.js` | Emoji pack definitions, secret trigger detection logic |
| `js/unlocks/confetti-unlocks.js` | Confetti shape definitions, thresholds, SVG shape data |
| `js/unlocks/unlock-manager.js` | Central state: tracks unlocked items, selection (random vs pinned), persistence to localStorage, easter egg condition checking |
| `js/ui/unlock-picker.js` | Tabbed picker panel UI (Hats / Ink / Confetti tabs). Ink tab contains ink colors, sprinkles, and emoji packs in labeled sections. Lock/unlock display, pin selection, "random" option. |
| `js/ui/payments.js` | 10 payment type definitions, modal UI, validation logic per type |
| `data/trivia.json` | Squid trivia questions for the trivia payment method |

### Modified Files

| File | Change |
|------|--------|
| `js/app.js` | Wire up unlock-manager, pass squirt events to trigger milestone + easter egg checks |
| `js/constants.js` | Add unlock thresholds, payment timing constants (loading bar duration, queue timings, etc.) |
| `js/ink/canvas.js` | Accept render mode (ink / sprinkle / emoji) and color config from unlock-manager |
| `js/fx/confetti.js` | Accept shape from confetti-unlocks instead of hardcoded mini-squid SVG |
| `js/dom/refs.js` | Add refs for picker tabs and payment modal elements |
| `index.html` | Add tabbed picker markup, payment modal markup |
| `style.css` | Styles for tabs, payment modals, lock/unlock states, easter egg reveal animation |

### Data Flow

1. Squirt happens -> `app.js` calls `unlockManager.check(count)`
2. Manager checks all thresholds + easter egg conditions -> emits newly unlocked items
3. Manager picks active style (random from unlocked, or pinned) -> passes to ink system
4. Ink system renders based on mode (ink hue, sprinkle colors, or emoji glyphs)
5. On confetti trigger -> confetti system gets active shape from manager

### localStorage Keys

| Key | Data |
|-----|------|
| `squ` | Unlocked item IDs (array) |
| `sqp` | Pinned selections `{ink: id \| null, confetti: id \| null}` |
| `sqt` | Microtransaction completions (array of item IDs) |

Existing keys (`sqc` for count, `sqa` for accessory) are unchanged.

### Easter Egg Detection (in unlock-manager)

| Trigger | Implementation |
|---------|---------------|
| 10 squirts in 3 seconds | Ring buffer of last 10 squirt timestamps. On each squirt, check if `timestamps[0]` is within 3s of now. |
| Squirt at midnight | On squirt, check `new Date().getHours() === 0 && getMinutes() === 0`. One-minute window. |
| 100 squirts without closing tab | Session counter (not persisted) incremented on each squirt. Resets on page load. |
| Idle 5 minutes then squirt | Track last squirt time. On next squirt, check if gap >= 300,000ms. |

## Summary

- **29 total new unlocks**: 8 ink, 8 sprinkles, 4 emoji (secret), 5 confetti
- **Plus existing**: 14 base hats + 4 milestone hats
- **All earnable through play**, milestones max at 1,000 squirts
- **10 silly microtransactions** as optional shortcuts (not for easter eggs)
- **Random selection by default**, tap to pin, "random" option to unpin
- **Ink/sprinkles/emoji share one particle slot**, confetti is separate
- **Factory modules per type**, thin unlock-manager for coordination
- **localStorage persistence**, optional Supabase sync deferred to future work
