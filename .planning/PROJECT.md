# Ralph Loop + Autopilot Port

## What This Is

This project upgrades the `ralph-shit-done` fork by porting the `ralph loop` and `get-shit-done-autopilot` changes into the current, more up-to-date codebase. The goal is to merge the two fork histories safely, keep compatibility with the existing GSD command/workflow system, and modernize the imported behavior with current best practices. The primary users are maintainers and power users who rely on predictable phase orchestration across Claude, OpenCode, and Gemini runtimes.

## Core Value

Port and unify Ralph loop + autopilot capabilities into this repo without breaking existing workflows or execution reliability.

## Requirements

### Validated

- [x] Multi-runtime install flow exists for Claude/OpenCode/Gemini via `bin/install.js`.
- [x] Workflow-driven command orchestration exists via `commands/gsd/*.md` and `get-shit-done/workflows/*.md`.
- [x] File-based planning lifecycle exists in `.planning/` with `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, and phase artifacts.
- [x] Agent-specialized planning/execution pipeline exists (`gsd-roadmapper`, `gsd-planner`, `gsd-executor`, `gsd-verifier`, etc.).
- [x] Deterministic tooling layer exists in `get-shit-done/bin/gsd-tools.cjs` and `get-shit-done/bin/lib/*.cjs`.

### Active

- [ ] Port Ralph loop behavior from `../get-shit-done-autopilot` into this repo with parity where still relevant.
- [ ] Port autopilot workflow enhancements into this repo while adapting to newer architecture and workflow contracts.
- [ ] Compare git histories of both forks and produce a traceable integration plan for what to bring, revise, or drop.
- [ ] Apply current best practices during porting (state durability, clear gates, predictable commits, and robust verification).
- [ ] Maintain backward compatibility for existing commands and avoid regressions in planning/execution flows.

### Out of Scope

- Full rewrite of GSD internals from scratch - unnecessary risk; incremental integration is safer.
- Breaking command surface changes across runtimes - avoid churn for existing users.
- Shipping unrelated net-new product features before parity/port stabilization - keeps effort focused.

## Context

This repository is already ahead of `../get-shit-done-autopilot` and has an existing codebase map in `.planning/codebase/`. The work is a brownfield convergence effort: identify valuable autopilot/ralph-loop deltas, map them onto the latest architecture, and preserve established execution contracts. Recent architecture relies on markdown workflow contracts plus `gsd-tools` CLI operations, with strict file-based project state under `.planning/`.

## Constraints

- **Codebase baseline**: `ralph-shit-done` is source-of-truth baseline - it is newer and should not be downgraded.
- **Compatibility**: Keep slash command and workflow contracts stable - existing users and docs depend on them.
- **Reliability**: Preserve atomic doc/state writes and deterministic workflow transitions - avoids context-loss failures.
- **Scope control**: Prioritize port + modernization over speculative feature expansion - reduce integration risk.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `ralph-shit-done` as the target baseline | This repo is more up to date and already mapped | -- Pending |
| Integrate by comparing fork histories, not blind copy | Prevents regressions and preserves newer architecture | -- Pending |
| Keep existing workflow gates and commit boundaries | Maintains determinism and recovery characteristics | -- Pending |
| Modernize imported logic during port | Aligns autopilot behavior with current best practices | -- Pending |

---
*Last updated: 2026-02-22 after initialization*
