---
phase: 07-learnings-propagation
plan: 01
subsystem: infra
tags: [learnings, agents-md, shell, knowledge-management]

# Dependency graph
requires:
  - phase: 06-circuit-breaker-recovery
    provides: recovery patterns and sed-based section extraction
provides:
  - AGENTS.md management functions for learning storage and retrieval
  - Section-based loading for phase-relevant learnings
  - Deduplication and size management
affects: [07-02-learning-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [section-based-markdown, yaml-frontmatter-extraction, atomic-write]

key-files:
  created:
    - bin/lib/learnings.sh
  modified: []

key-decisions:
  - "MAX_AGENTS_LINES=100 warning threshold, MAX_AGENTS_LINES_HARD=150 hard cap"
  - "Exact-match deduplication using grep -qF (simple and reliable)"
  - "Phase N learnings go under ## Phase-Specific as ### subsections"
  - "patterns-established -> Phase section, key-decisions -> Codebase Patterns"
  - "Missing AGENTS.md is OK - no learnings yet, functions return gracefully"

patterns-established:
  - "Section-based markdown loading with sed range patterns"
  - "YAML frontmatter extraction between --- markers"
  - "Learning deduplication before append (idempotent storage)"

# Metrics
duration: 4min
completed: 2026-01-19
---

# Phase 7 Plan 01: Learnings Library Summary

**AGENTS.md management library with init, section-based loading, deduplicated append, summary extraction, and size management functions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-19
- **Completed:** 2026-01-19
- **Tasks:** 3
- **Files created:** 1

## Accomplishments
- Created learnings.sh library with 5 core functions
- init_agents_file creates AGENTS.md with Error Fixes, Codebase Patterns, Phase-Specific sections
- get_learnings_for_phase extracts relevant sections for a given phase
- append_learning provides idempotent learning storage with exact-match deduplication
- extract_learnings_from_summary parses SUMMARY.md frontmatter for patterns and decisions
- prune_agents_if_needed enforces size limits (100 warning, 150 hard cap)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create learnings.sh with init and section-based loading** - `b89f026` (feat)
2. **Task 2: Add append_learning with deduplication** - `a12cb52` (feat)
3. **Task 3: Add extract_learnings_from_summary and prune_agents_if_needed** - `325a051` (feat)

## Files Created/Modified
- `bin/lib/learnings.sh` - New library with init_agents_file, get_learnings_for_phase, append_learning, extract_learnings_from_summary, prune_agents_if_needed

## Decisions Made
- MAX_AGENTS_LINES=100: Warning threshold to alert about growing file
- MAX_AGENTS_LINES_HARD=150: Hard cap with auto-pruning (keep 10 per section)
- Exact-match deduplication: grep -qF is simple and sufficient for learning strings
- Phase subsections: "Phase N" learnings become ### Phase N: under ## Phase-Specific
- Frontmatter extraction: First extract between --- markers, then parse YAML arrays
- Graceful handling: Missing AGENTS.md returns empty, no errors

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed frontmatter extraction boundary**
- **Found during:** Task 3 verification
- **Issue:** sed pattern was capturing content after YAML frontmatter ended
- **Fix:** Extract frontmatter between --- markers first, then parse YAML fields
- **Files modified:** bin/lib/learnings.sh
- **Commit:** 325a051

## Issues Encountered
None besides the frontmatter extraction fix noted above.

## User Setup Required

None - library is self-contained and uses existing codebase patterns.

## Next Phase Readiness
- learnings.sh library complete with all required functions
- Ready for 07-02 to integrate into ralph.sh execution loop
- Functions follow established patterns (atomic writes, sed extraction, NO_COLOR)

---
*Phase: 07-learnings-propagation*
*Completed: 2026-01-19*
