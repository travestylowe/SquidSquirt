# SquidSquirt — Agent Team

## Applicable Standards

<!-- These standards from ~/.claude/standards/ apply to this project. -->
<!-- Agents will load these automatically when working in this repo. -->

- [ ] standards/typescript.md
- [ ] standards/nextjs.md
- [ ] standards/react.md
- [x] standards/supabase.md    <!-- detected: supabase/ directory -->
- [ ] standards/salesforce.md
- [ ] standards/ai-integration.md

## Roles

| Role | Scope | Start Here | Constraints |
|------|-------|------------|-------------|
| Development | Build features, fix bugs | docs/agents/roles/developer.md | Follow CLAUDE.md patterns |
| Review | Code review, quality gates | docs/agents/roles/reviewer.md | Confidence >= 80 only |
| QA | Test coverage, acceptance | <!-- TODO: create docs/agents/roles/qa.md --> | Behavior tests only |
| <!-- TODO --> | <!-- scope --> | <!-- doc path --> | <!-- constraints --> |

## Project-Specific Agents

<!-- Define agents unique to this project in .claude/agents/ -->

| Agent | File | Purpose | Trigger |
|-------|------|---------|---------|
| <!-- name --> | `.claude/agents/example.md` | <!-- purpose --> | <!-- when it runs --> |

## Human Gates

<!-- Actions that require human approval before executing. -->
<!-- These apply to ALL agents working in this project. -->

- Pushing to remote
- Database migrations
- Deleting files or branches
- Sending messages (email, Slack, etc.)
- Publishing to external channels
- Any action affecting shared state

## Documentation Map

<!-- Key docs agents should know about. Update as docs are added. -->

| Area | Path |
|------|------|
| Project instructions | `CLAUDE.md` |
| Roadmap | `docs/ROADMAP.md` |
| Agent orchestration | `docs/agents/ORCHESTRATION.md` |
| Agent guardrails | `docs/agents/GUARDRAILS.md` |
| Developer role | `docs/agents/roles/developer.md` |
| Reviewer role | `docs/agents/roles/reviewer.md` |
