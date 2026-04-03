# Developer Role

<!-- Context for developer agents working in this project. -->

## Key Files to Read First

- `CLAUDE.md` — project conventions and patterns
- `js/constants.js` — all magic numbers live here with unit comments
- `js/app.js` — entry point, composes all subsystems
- `js/dom/refs.js` — centralized DOM element lookups
- `config.example.js` — Supabase config shape

## Build Commands

- **Dev server:** `npm start` (serves on port 8080)
- **Check:** `npm run check` (JS validation)

## Architecture

Vanilla HTML/CSS/JS with ES modules. No bundler, no runtime npm dependencies.

- Each subsystem (ink, audio, squid, counter, hints, fx) exports a factory that encapsulates its own state
- CSS animations preferred over JS for idle/ambient motion
- Supabase global counter is optional — app must work fully without it
- `config.js` is gitignored; credentials injected at deploy via GitHub Actions

## Patterns to Follow

- Constants: named exports in `js/constants.js` with unit comments — no inline magic numbers
- DOM refs: all lookups in `js/dom/refs.js`, never inline `document.getElementById`
- Subsystems: factory functions that encapsulate state (see `js/ink/canvas.js`, `js/ui/hints.js`)
- Data files: JSON in `data/` loaded via `fetch` at startup

## Common Pitfalls

- Serving via `file://` breaks ES module imports — always use `npm start`
- Forgetting `prefers-reduced-motion: reduce` for new animations
- Adding inline magic numbers instead of constants in `js/constants.js`
- Modifying `config.js` instead of `config.example.js` for committed changes
