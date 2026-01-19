# GSD Lazy Mode

## What This Is

An extension to GSD that adds autonomous "fire and forget" milestone execution. Users can plan everything upfront in one intensive session, then walk away while agents work through all phases until the milestone is complete with passing tests.

## Core Value

Plan once, walk away, wake up to done. No human needed at the computer after planning.

## Requirements

### Validated

- ✓ Interactive phase-by-phase planning — existing
- ✓ Parallel/sequential agent execution within phases — existing
- ✓ State persistence via markdown files (.planning/) — existing
- ✓ Subagent orchestration with fresh context per agent — existing
- ✓ Verification step after phase execution — existing
- ✓ Git atomic commits during execution — existing

### Active

- [ ] Mode selection at GSD startup (Interactive vs Lazy)
- [ ] `/gsd:plan-milestone-all` command for upfront planning
- [ ] Generate ALL PLAN.md files for ALL phases before execution
- [ ] LLM-guided phase structure determination during planning
- [ ] `/gsd:ralph` command to configure retry loop
- [ ] Max iteration limit for token budget control
- [ ] `/gsd:run-milestone` command for autonomous execution
- [ ] Ralph loop at milestone level (retry incomplete work)
- [ ] Exit condition: all requirements met + all tests pass
- [ ] No human checkpoints during run-milestone execution
- [ ] Progress persistence between ralph iterations (via git + state files)

### Out of Scope

- Per-agent ralph loops — adds coordination complexity, milestone-level loop is simpler
- Real-time notifications/alerts — user walks away, checks results later
- Automatic token cost estimation — user sets max iterations manually
- Rollback on failure — ralph pattern retries forward, doesn't roll back

## Context

**Existing System:** GSD is a meta-prompting system with orchestrator-agent architecture. Commands delegate to workflows, workflows spawn specialized subagents, state persists in `.planning/` markdown files. Current workflow requires human at each phase transition.

**Ralph Pattern:** From github.com/snarktank/ralph — a loop that spawns fresh AI agent instances repeatedly. Each iteration picks one task, executes, validates, commits. Knowledge persists via git history and state files. Loop exits when all tasks pass.

**User Need:** Can't be bothered to plan each phase one at a time. Wants to do all thinking upfront while present, then let agents grind through execution overnight.

## Constraints

- **Compatibility**: Must coexist with current Interactive mode — user chooses at startup
- **Context limits**: Each ralph iteration spawns fresh Claude, ~200k context per agent
- **Token budget**: Max iterations limit prevents runaway costs
- **Existing patterns**: Follow current GSD command/agent/workflow architecture

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Ralph loop at milestone level, not per-agent | Simpler coordination, matches ralph pattern (one loop, one task at a time) | — Pending |
| Generate all PLAN.md files upfront | Front-loads judgment while human present, execution becomes mechanical | — Pending |
| Mode selection at startup | Clean separation, lazy mode has different command set | — Pending |
| Fresh context per iteration (ralph pattern) | Prevents context degradation, inherited knowledge via state files | — Pending |

---
*Last updated: 2026-01-19 after initialization*
