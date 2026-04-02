# SquidSquirt — Project Instructions

## Architecture

Vanilla HTML/CSS/JS with ES modules. No bundler, no runtime npm dependencies. Serve over HTTP (not `file://`).

- Entry point: `js/app.js` (imports all subsystems, runs `requestAnimationFrame` loop)
- All magic numbers live in `js/constants.js`
- DOM element lookups centralized in `js/dom/refs.js`
- Each subsystem (ink, audio, squid, counter, hints, fx) exports a factory that encapsulates its own state

## Roadmap

**Always keep `docs/ROADMAP.md` in sync with the code.** When completing a planned item, move it to the Completed section with a short description of what was built. When adding new features not on the roadmap, add them to Completed. Never delete completed items.

## Key conventions

- Constants: named exports in `js/constants.js` with unit comments — no inline magic numbers
- Config: `window.SQUIDSQUIRT_CONFIG` set in `config.js` (never committed with real keys)
- Data files: JSON in `data/` loaded via `fetch` at startup
- CSS animations preferred over JS for idle/ambient motion
- Supabase global counter is optional — app must work fully without it
- `prefers-reduced-motion: reduce` must disable or soften all non-essential animation
