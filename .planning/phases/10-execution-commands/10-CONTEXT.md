# Phase 10: Execution Commands - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Complete user-facing command set for autonomous milestone execution. The commands that enable the "plan once, walk away, wake up to done" workflow. Integrates with safety infrastructure (Phase 1) and all prior lazy mode machinery.

</domain>

<decisions>
## Implementation Decisions

### Command invocation flow
- Single orchestrator command: `/gsd:autopilot`
- Replaces separate plan-milestone-all, ralph, and run-milestone commands
- No individual commands for advanced users — only autopilot exists
- If plans already exist: prompt user "Plans exist. Use existing or regenerate?"

### Configuration UX
- Interactive prompts every time autopilot runs
- Prompts cover essential + safety settings: max iterations, timeout, circuit breaker threshold, stuck threshold
- No --yes flag or skip option — user must consciously confirm before autonomous run
- Values saved to .ralph-config after confirmation

### Progress feedback
- Periodic summaries after each iteration (not live streaming)
- One-line format: `[5/50] ✓ 03-02 Claude invocation (2m 34s)`
- Includes: iteration count, status icon, plan ID, task name, duration
- No log files — STATE.md is the record of progress

### Interruption handling
- Ctrl+C triggers graceful stop: finish current iteration, commit checkpoint, then exit
- Exit shows summary + next steps: completed plans, current position, exact resume command
- Resume via same command: `/gsd:autopilot` detects incomplete run and prompts "Resume previous run?"
- No pause feature — just stop and resume later if review needed

### Claude's Discretion
- Exact prompt wording for configuration questions
- Progress line formatting details (unicode vs ASCII fallback)
- Exit message structure and formatting
- How to detect "incomplete run" state for resume prompt

</decisions>

<specifics>
## Specific Ideas

- Command name `/gsd:autopilot` emphasizes the autonomous nature
- The workflow should feel like starting a self-driving car — confirm settings, press go, walk away
- Resume detection should be seamless — user doesn't need to remember special flags

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-execution-commands*
*Context gathered: 2026-01-20*
