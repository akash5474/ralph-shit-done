---
phase: 12-failure-learnings
plan: 02
subsystem: execution
tags: [learnings, failure-handling, retry, context-propagation, bash]

# Dependency graph
requires:
  - phase: 12-01
    provides: Failure extraction and storage functions (extract_failure_reason, append_failure_learning, clear_phase_failures)
provides:
  - Automatic failure extraction on task failure in ralph.sh
  - Failure context included in retry prompts via get_learnings_for_phase
  - Phase boundary cleanup of failure learnings on successful completion
affects: [future-retry-logic, learnings-system, execution-loop]

# Tech tracking
tech-stack:
  added: []
  patterns: [failure-learning-propagation, phase-boundary-cleanup]

key-files:
  created: []
  modified:
    - bin/lib/learnings.sh
    - bin/ralph.sh

key-decisions:
  - "Failure context extraction happens before output_file cleanup to preserve failure details"
  - "Phase boundary detection uses task ID parsing and next_plan comparison"
  - "Clear failures on both COMPLETE and phase transition for clean state"

patterns-established:
  - "Extract failure context in handle_iteration_failure_state, pass output_file parameter"
  - "Phase boundary cleanup in handle_iteration_success after determining next_plan"
  - "get_learnings_for_phase returns failure context with 'avoid repeating these mistakes' header"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 12 Plan 02: Ralph Integration Summary

**Failure learnings automatically captured on task failure, included in retry prompts, and cleared on phase completion**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-21T03:27:49Z
- **Completed:** 2026-01-21T03:31:04Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Extended get_learnings_for_phase to extract and return failure context for retry prompts
- Integrated failure extraction into ralph.sh failure handling with extract_and_store_failure helper
- Added phase boundary detection and cleanup to clear failures when phase completes successfully
- Completed failure learnings feature end-to-end (FAIL-01 through FAIL-04 requirements)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend get_learnings_for_phase to include failure context** - `f222d7a` (feat)
2. **Task 2: Add failure extraction to ralph.sh on task failure** - `e6739b5` (feat)
3. **Task 3: Add phase boundary cleanup to ralph.sh** - `0f8781d` (feat)

## Files Created/Modified
- `bin/lib/learnings.sh` - Extended get_learnings_for_phase with failure context extraction (lines 125-136, 168-176)
- `bin/ralph.sh` - Added extract_and_store_failure helper function, modified handle_iteration_failure_state to accept output_file and call extraction, added phase boundary cleanup in handle_iteration_success

## Decisions Made

**1. Move output_file cleanup after failure extraction**
- Rationale: Need to read output_file contents to extract failure reason before deleting it
- Implementation: Moved `rm -f "$output_file"` from line 400 to line 405 in ralph.sh

**2. Use phase ID parsing for boundary detection**
- Rationale: Reliable way to detect when phase changes from task IDs (e.g., 12-01 → 13-01)
- Implementation: Extract phase from task ID, compare current_phase vs next_phase

**3. Clear failures on both COMPLETE and phase transition**
- Rationale: Ensure failures are cleared whether all phases complete or just the current phase
- Implementation: Check for COMPLETE first, then compare phase numbers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Failure learnings feature is complete and functional:
- FAIL-01: extract_failure_reason parses Claude output (12-01)
- FAIL-02: append_failure_learning creates structured entries (12-01)
- FAIL-03: Failures stored in AGENTS.md Failure Context (12-01)
- FAIL-04: get_learnings_for_phase includes failures (12-02)

All v1.1 requirements satisfied. Phase 12 complete.

Ready for v1.1 milestone completion.

---
*Phase: 12-failure-learnings*
*Completed: 2026-01-21*
