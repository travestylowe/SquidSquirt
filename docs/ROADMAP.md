# Roadmap

## Completed

- [x] **Global squirts counter** — Shared Supabase-backed counter in the footer, separate from the local `localStorage` count. Shows `—` when not configured or offline. Styled as secondary UI with safe-area support.
- [x] **Squid idle animation** — Gentle float via `squid-drift` keyframes (10s cycle), staggered tentacle wave on arms (2.85s) and feeders (2.85s, −0.42s offset). Honors `prefers-reduced-motion: reduce`.
- [x] **Thank-you pun library** — 27 post-squirt puns in `data/thanks.json`, shown for 2.6s after each squeeze via `hints.showThankYouPun()`. Distinct from the 37 idle taunts in `data/taunts.json`.
- [x] **Confetti bursts** — Mini squid SVG confetti every 10–30 squirts (randomized interval).
- [x] **Ambient bubbles** — 14 perpetually rising CSS-animated bubbles.
- [x] **Palette rotation** — 8 color palettes cycle every 10 squirts, animating all SVG fills/strokes.
- [x] **Squid idle growth** — Scale increases over 52s of idle time, shrinks back on squirt.
- [x] **Milestone reactions** — Triple confetti burst + purple screen flash + gold milestone message at 100, 500, 1,000, 5,000, 10,000, 50,000, and 100,000 squirts. Implemented in `js/fx/milestone.js`, milestone hint displayed via `hints.showMilestoneMsg()`.
- [x] **Sound toggle** — Mute/unmute button in floating controls (bottom-right). Persists in `localStorage`. Implemented in `js/ui/soundToggle.js`.
- [x] **Share button** — Uses Web Share API on supported devices, clipboard copy fallback. Shares squirt count + site URL. Implemented in `js/ui/shareButton.js`.
- [x] **Mobile haptic feedback** — `navigator.vibrate()` on each squirt. Different patterns for normal (30ms), mega (50-30-80ms), and fart (40-20-40ms) squirts.
- [x] **Ink color unlocks** — Ink particle/drip hue now matches the current squid palette instead of fixed purple. Each palette in `data/palettes.json` has an `inkHue` field; `ink.setInkHue()` updates it on palette change.
- [x] **Squid customization (accessories)** — 6 SVG accessories (Party Hat, Crown, Bow Tie, Pirate Hat, Top Hat, Wizard Hat) unlocked at squirt milestones (50–5,000). Picker panel in `js/ui/accessories.js`. Auto-equips newly unlocked items. Selection persisted in `localStorage`.
- [x] **Unlock system** — Unlockable ink colors (7 + rainbow), sprinkles (7 + rainbow), 4 secret emoji packs (easter eggs), 5 confetti shapes. Tabbed picker UI with pin/random selection. 10 silly microtransaction payment types as optional shortcuts. All unlocks earnable through play, milestones max at 1,000 squirts.

## Decided Against

- **Leaderboard** — Would require tracking visitor identity; not desired for this project.
