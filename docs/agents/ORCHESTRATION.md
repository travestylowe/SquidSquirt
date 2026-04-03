# Orchestration

<!-- How agents collaborate in this project. -->

## Available Workflows

| Command | What It Does | Agents Used |
|---------|-------------|-------------|
| `/feature-dev` | Full feature lifecycle: explore -> design -> implement -> review -> docs | explorer, architect, developer, reviewer, test-runner, doc-syncer |
| `/code-review` | Multi-agent PR review with confidence filtering | reviewer (x5) |

## Phase Gates

Agents flow freely through read/analysis/draft phases. Human approval is required at:

1. **Architecture approval** — before implementation begins
2. **Worktree merge** — after developer agent completes, human reviews diff
3. **Review findings** — human decides which issues to fix
4. **Doc updates** — human approves each edit

## Parallel Execution

- Exploration: 2-3 explorer agents simultaneously, different focus areas
- Architecture: 2-3 architect agents simultaneously, different design philosophies
- Review: 3-5 reviewer agents simultaneously, different review lenses
- Implementation: single developer agent (sequential within, but test-runner can follow)

## Worktree Usage

The `code-developer` and `test-runner` agents run in isolated worktrees. This means:
- They have a full copy of the repo to work in
- Changes don't affect the main working tree until merged
- The human reviews a clean diff before accepting changes
- If the agent's work is rejected, the worktree is discarded with no impact

## Error and Retry

- If a developer agent is blocked, it stops and reports back. The parent session resolves the blocker and re-launches, or switches to direct implementation.
- If a test-runner finds failures, results go to the parent session for triage. The parent decides whether to fix via developer agent or directly.
- If doc-syncer proposes an incorrect update, the human denies the edit. No retry — the human fixes it manually or provides guidance.
