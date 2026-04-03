# Guardrails

## Confidence Scoring

All review and QA agents score findings on a 0-100 scale:

| Score | Meaning |
|-------|---------|
| 0 | False positive — doesn't hold up to scrutiny |
| 25 | Might be real — can't verify, or stylistic without explicit guideline |
| 50 | Real but minor — nitpick or unlikely in practice |
| 75 | Verified and important — will impact functionality or violates explicit rule |
| 100 | Certain — confirmed, frequent, evidence-backed |

**Reporting threshold: >= 80.** Suppress everything below.

## No-Go Zones

<!-- Paths, patterns, or actions agents must never touch. -->

- Never commit `config.js` — contains Supabase credentials, injected at deploy time
- Never modify `supabase/sql/init_counters.sql` after it's been applied to production
- Never log or expose Supabase keys in client-visible output

## Escalation Rules

Agents must stop and ask a human when:

- Requirements are ambiguous (don't assume)
- Security-sensitive code is involved
- Cross-cutting architectural decisions are needed
- The agent encounters something unexpected (unfamiliar patterns, conflicting conventions)
- Work would exceed the defined scope (e.g., a "fix this bug" task that requires a refactor)

## Operational Limits

<!-- Customize per project. -->

- Supabase free tier: 200 concurrent Realtime connections, 2M messages/month
- No bundler or build step — all JS must be valid ES modules served directly
- All animations must respect `prefers-reduced-motion: reduce`
