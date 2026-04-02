# Frozen behavior (smoke / regression reference)

This document describes the public behavior of Squid Squirt so refactors can be validated without guessing.

Implementation entry point: `js/app.js` (ES module). Content data: `data/*.json`.

## Counters

- **Local total** (top): Stored under `localStorage` key `sqc`. Increments by **1** on each successful squirt (mousedown / touchstart on the squid).
- **Global total** (footer): If `config.js` sets both `supabaseUrl` and `supabaseAnonKey`, the app **reads** `counters` row `id=1` on load and **increments** via RPC `increment_squirt` on each squirt. The UI shows `—` if not configured or if load fails.
- Local and global counts are **independent**; the main number is always the local count.

## One squirt

1. **Cooldown** ~320 ms; overlapping squirts ignored during cooldown.
2. **Power** `random()` in `[0,1)` chooses ink, audio, blush rules, and “mega” vs normal spray.
3. **25%** chance of fart sound instead of squirt sound; otherwise squirt sound.
4. **Ink** spawns from the siphon mouth viewport position; dry if power &lt; dry threshold.
5. **Blush** if squirt power &gt; 0.75 or (fart and power &gt; 0.65).
6. **Squid** squish animation, random reposition (within margins), random rotation, idle scale may drop then grow again over time.
7. **Hint**: Thank-you line ~2.6 s, then idle taunt schedule resumes.
8. **Confetti**: After a random **10–30** local squirts since last burst, confetti plays; counter resets interval.

## Audio

- Giggle probability depends on fart vs squirt and power bands (see `js/constants.js`).

## Input

- Touch on squid uses `preventDefault` on `touchstart` (non-passive) to avoid scroll/zoom during play.
