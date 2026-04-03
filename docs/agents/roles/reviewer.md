# Reviewer Role

<!-- Context for reviewer agents working in this project. -->

## Review Priorities

<!-- What matters most in this codebase. Ordered by importance. -->

1. Supabase credentials: never committed, never logged, never exposed in client output
2. Accessibility: `prefers-reduced-motion: reduce` must disable or soften all non-essential animation
3. No magic numbers: all timing values, limits, and thresholds belong in `js/constants.js`
4. Graceful degradation: app must work fully without Supabase configured
5. Convention compliance: factory pattern for subsystems, centralized DOM refs, ES modules only

## Known Pain Points

- `config.js` is gitignored but required at runtime — easy to break deploys if the GitHub Actions workflow doesn't generate it correctly
- The squid idle growth/shrink mechanic interacts with swim-away behavior — changes to one can break the other

## Project-Specific False Positives

- No `package-lock.json` — intentional, there are no runtime npm dependencies
- `window.SQUIDSQUIRT_CONFIG` is a global — intentional, it's the config injection point from `config.js`
- No TypeScript — intentional, this is a vanilla JS project
