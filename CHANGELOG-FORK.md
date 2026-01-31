## [1.20.5] - 2026-02-19

### Fixed
- `/gsd:health --repair` now creates timestamped backup before regenerating STATE.md (#657)

### Changed
- Subagents now discover and load project CLAUDE.md and skills at spawn time for better project context (#671, #672)
- Improved context loading reliability in spawned agents

## [1.20.4] - 2026-02-17

### Fixed
- Executor agents now update ROADMAP.md and REQUIREMENTS.md after each plan completes — previously both documents stayed unchecked throughout milestone execution
- New `requirements mark-complete` CLI command enables per-plan requirement tracking instead of waiting for phase completion
- Executor final commit includes ROADMAP.md and REQUIREMENTS.md

## [1.20.3] - 2026-02-16

### Fixed
- Milestone audit now cross-references three independent sources (VERIFICATION.md + SUMMARY frontmatter + REQUIREMENTS.md traceability) instead of single-source phase status checks
- Orphaned requirements (in traceability table but absent from all phase VERIFICATIONs) detected and forced to `unsatisfied`
- Integration checker receives milestone requirement IDs and maps findings to affected requirements
- `complete-milestone` gates on requirements completion before archival — surfaces unchecked requirements with proceed/audit/abort options
- `plan-milestone-gaps` updates REQUIREMENTS.md traceability table (phase assignments, checkbox resets, coverage count) and includes it in commit
- Gemini CLI: escape `${VAR}` shell variables in agent bodies to prevent template validation failures

## [1.20.2] - 2026-02-16

### Fixed
- Requirements tracking chain now strips bracket syntax (`[REQ-01, REQ-02]` → `REQ-01, REQ-02`) across all agents
- Verifier cross-references requirement IDs from PLAN frontmatter instead of only grepping REQUIREMENTS.md by phase number
- Orphaned requirements (mapped to phase in REQUIREMENTS.md but unclaimed by any plan) are detected and flagged

### Changed
- All `requirements` references across planner, templates, and workflows enforce MUST/REQUIRED/CRITICAL language — no more passive suggestions
- Plan checker now **fails** (blocking, not warning) when any roadmap requirement is absent from all plans
- Researcher receives phase-specific requirement IDs and must output a `<phase_requirements>` mapping table
- Phase requirement IDs extracted from ROADMAP and passed through full chain: researcher → planner → checker → executor → verifier
- Verification report requirements table expanded with Source Plan, Description, and Evidence columns

## [1.20.1] - 2026-02-16

### Fixed
- Auto-mode (`--auto`) now survives context compaction by persisting `workflow.auto_advance` to config.json on disk
- Checkpoints no longer block auto-mode: human-verify auto-approves, decision auto-selects first option (human-action still stops for auth gates)
- Plan-phase now passes `--auto` flag when spawning execute-phase
- Auto-advance clears on milestone complete to prevent runaway chains

## [1.20.0] - 2026-02-15

### Added
- `/gsd:health` command — validates `.planning/` directory integrity with `--repair` flag for auto-fixing config.json and STATE.md
- `--full` flag for `/gsd:quick` — enables plan-checking (max 2 iterations) and post-execution verification on quick tasks
- `--auto` flag wired from `/gsd:new-project` through the full phase chain (discuss → plan → execute)
- Auto-advance chains phase execution across full milestones when `workflow.auto_advance` is enabled

### Fixed
- Plans created without user context — `/gsd:plan-phase` warns when no CONTEXT.md exists, `/gsd:discuss-phase` warns when plans already exist (#253)
- OpenCode installer converts `general-purpose` subagent type to OpenCode's `general`
- `/gsd:complete-milestone` respects `commit_docs` setting when merging branches
- Phase directories tracked in git via `.gitkeep` files

## [1.19.2] - 2026-02-15

### Added
- User-level default settings via `~/.gsd/defaults.json` — set GSD defaults across all projects
- Per-agent model overrides — customize which Claude model each agent uses
