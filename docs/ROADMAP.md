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
- [x] **Unlock system** — Unlockable ink colors (7 + rainbow), sprinkles (7 + rainbow), 4 secret emoji packs (easter eggs), 5 confetti shapes. Tabbed picker UI with pin/random selection. 10 silly microtransaction payment types as optional shortcuts. All unlocks earnable through play, milestones max at 1,000 squirts. Ink colors render with per-color saturation/lightness so each hue is visually distinct. Sprinkles render as small crisp dots (no blur merge) with candy-bright colors. Each emoji pack has unique physics: water drops rain heavily, stars float up and twinkle, hearts drift with sway, skulls slam down and spin.
- [x] **Unlock bubble reveal** — New unlocks float up from the squid in a translucent bubble with a preview inside. Player pops the bubble to see the item name. Multiple unlocks stagger horizontally. Bubbles settle and bob near the top until clicked.
- [x] **Keyboard squirt support** — Added `click` listener on `#squid-btn` with a double-fire guard so keyboard Enter/Space and iOS VoiceOver double-tap trigger squirts. `mousedown` still fires for mouse users; a flag prevents the subsequent `click` from double-firing.
- [x] **Squid button focus ring** — Added `:focus-visible` purple glow ring (`3px solid rgba(168,85,247,0.8)`) on `#squid-btn` with `outline-offset: 4px`.
- [x] **Screen reader game feedback** — Post-squirt puns and milestone messages are now piped into the `#hint` `aria-live="polite"` region. The static hint uses a visually-hidden clip pattern instead of `display:none` so the live region remains in the accessibility tree.
- [x] **Payment modal focus trap** — JS focus trap loops Tab at first/last focusable elements, Escape closes, initial focus moves to close button, and focus restores to the trigger element on close.
- [x] **Payment modal input focus rings** — Added `:focus-visible` purple outline (`2px solid #7c3aed`) on `.payment-actions input[type="text"]` and `textarea`.
- [x] **Patience payment: reduce timer + explain cancel** — Reduced `PAYMENT_PATIENCE_MS` from 30,000 to 10,000 ms. Added inline text in the patience modal: "You can close this at any time — you won't lose anything."
- [x] **Easter egg unlock hints** — Locked easter egg items in the unlock picker now show vague trigger hints (e.g., "Squirt rapidly…", "Visit at a special hour…", "Keep squirting in one session…", "Leave the squid alone for a while…").
- [x] **Save-state tooltip** — One-time tooltip on first visit near the counter: "Your progress saves automatically!" Shown for 4 seconds, fades out. First visit detected via `localStorage` flag.
- [x] **Delay ambient bubbles on first visit** — Ambient bubble spawning delayed by 2.5 seconds on first visit so the "squeeze me" hint lands against a still background. Return visits spawn immediately.

## Decided Against

- **Leaderboard** — Would require tracking visitor identity; not desired for this project.
