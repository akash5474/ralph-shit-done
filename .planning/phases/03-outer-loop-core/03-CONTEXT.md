# Phase 3: Outer Loop Core - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Bash script (`ralph.sh`) that spawns fresh Claude Code instances to execute plans sequentially. Reads STATE.md to determine next task, invokes Claude non-interactively, parses results, updates state, and loops until completion or cap reached. Works on Unix and Windows (Git Bash).

**Loop level:** Plan-level iterations (not phase-level). Each plan execution = one iteration.

</domain>

<decisions>
## Implementation Decisions

### Invocation modes
- Foreground only — user runs and watches terminal output (Ctrl+C to stop)
- No dry-run mode — git checkpoints provide safety net for recovery
- Auto-detect resume from STATE.md — always continues from current position
- `--start-from` flag to override starting point (e.g., `ralph.sh --start-from 03-02`)

### Iteration feedback
- Task summary after each iteration: status line + 1-2 sentence summary of what was done/failed
- Always write to log file: `.planning/ralph.log` (appends each iteration)
- Pause on failure — stops and offers: Retry / Skip / Abort
- Failures get highlighted before pause prompt

### Output behavior
- Startup shows config summary: max iterations, current position, next task
- Running indicator (spinner/dots) while Claude is working: "[4/50] Running... ⡋"
- Colored output: green=success, red=failure, yellow=warnings (respects NO_COLOR)
- Alert/log when iteration exceeds 30 minutes (no hard timeout)

### Claude spawning
- Invoke Claude with full GSD context (same as manual `/gsd:execute-phase`)
- Includes: GSD skill definitions, STATE.md, ROADMAP.md, plan file, AGENTS.md
- No per-iteration timeout — but log alert after 30 minutes
- Crashes (non-zero exit, killed) trigger immediate ralph.sh abort

### Claude's Discretion
- Exact spinner implementation
- Log file format details
- Completion summary format
- Specific Claude CLI invocation flags

</decisions>

<specifics>
## Specific Ideas

- Loop iterates at **plan level** (26 plans in milestone = up to 26 iterations + retries)
- Spawned Claude should get everything a manual `/gsd:execute-phase` invocation gets today
- Crash handling is aggressive (immediate abort) vs failure handling (pause with options)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-outer-loop-core*
*Context gathered: 2026-01-19*
