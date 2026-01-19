# Phase 6: Circuit Breaker & Recovery - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Intelligent failure handling that pauses execution after repeated failures across different tasks, analyzes why the loop is stuck, and allows user to resume, skip, or abort. This builds on Phase 5's stuck detection (3 failures on same task exits) by adding a circuit breaker for systemic failures across multiple tasks.

</domain>

<decisions>
## Implementation Decisions

### Pause behavior
- Trigger: N consecutive failures across different tasks (not same task — that's existing stuck detection)
- N value: Claude's discretion (pick sensible default based on existing retry patterns)
- Interactive mode: Prompt "Paused. Resume / Skip task / Abort?" when terminal available
- Non-interactive mode: Treat pause trigger as STUCK status — exit with stuck code, fail fast
- Resume mechanism: User responds to prompt (interactive) or restarts ralph.sh (non-interactive)

### Stuck analysis
- Examine: Recent failure outputs + STATE.md iteration history
- Cross-reference to identify patterns (same error type, same file, related failures)
- Output location: STATE.md inline section (not separate file)
- Detail level: Brief summary (3-5 lines) — pattern identified, suspected cause, suggested action
- Actionable suggestions: Claude's discretion — include when obvious, omit when unclear

### User notification
- Channel: Console output only (no separate log file)
- Information content: Claude's discretion based on available information
- Interactive options: Resume / Skip task / Abort (three choices)
- Colors: Yes, use existing color scheme (YELLOW for pause/warning state)

### Claude's Discretion
- Exact value of N for circuit breaker threshold
- Detail level of actionable suggestions in stuck analysis
- Information density in pause notification message

</decisions>

<specifics>
## Specific Ideas

- Circuit breaker is for systemic issues (multiple tasks failing) vs stuck detection (single task failing repeatedly)
- YELLOW color for pause state aligns with existing warning color convention
- Skip option allows bypassing problematic task without aborting entire run

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-circuit-breaker-recovery*
*Context gathered: 2026-01-19*
