---
phase: quick
plan: 003
subsystem: infra
tags: [nodejs, path-resolution, terminal-launcher, windows, cross-platform]

# Dependency graph
requires:
  - phase: 11-terminal-launcher
    provides: Terminal spawning infrastructure for execution isolation
provides:
  - Reliable path resolution for ralph.sh and progress-watcher.js across all platforms
  - Cross-platform terminal spawning without path not found errors
affects: [lazy-mode, autopilot, execution-isolation]

# Tech tracking
tech-stack:
  added: []
  patterns: [Use os.homedir() + path.join() for cross-platform path resolution, Apply toGitBashPath() on Windows for Git Bash compatibility]

key-files:
  created: []
  modified: [bin/lib/terminal-launcher.js]

key-decisions:
  - "Use os.homedir() instead of literal $HOME strings for reliable path resolution"
  - "Apply toGitBashPath() conversion on Windows to ensure Git Bash compatibility"

patterns-established:
  - "Path resolution: Always use os.homedir() + path.join() for user-relative paths, never literal $HOME"
  - "Windows Git Bash: Convert Windows paths using toGitBashPath() before passing to bash commands"

# Metrics
duration: 1min
completed: 2026-01-21
---

# Quick Task 003: Fix ralph.sh Path Bug Summary

**Replaced literal $HOME strings with os.homedir() path resolution in terminal-launcher.js, eliminating "ralph.sh not found" errors when spawning new terminal windows**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-21T23:43:02Z
- **Completed:** 2026-01-21T23:44:31Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Fixed path resolution bug causing "ralph.sh not found" errors when spawning terminals
- Ensured cross-platform compatibility (Windows, macOS, Linux) for terminal spawning
- Applied proper Git Bash path conversion on Windows using existing toGitBashPath() utility

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix path resolution in launchTerminal and launchProgressWatcher** - `307cb70` (fix)
2. **Task 2: Update showManualInstructions to show resolved path** - No code changes (verification task - confirmed existing RALPH_SCRIPT constant already uses absolute path via __dirname)

**Plan metadata:** (included in final commit below)

## Files Created/Modified
- `bin/lib/terminal-launcher.js` - Replaced literal `$HOME` strings with os.homedir() + path.join() for absolute path resolution, added toGitBashPath() conversion on Windows

## Decisions Made
- Use os.homedir() instead of literal $HOME strings for reliable cross-platform path resolution
- Apply toGitBashPath() conversion on Windows to ensure Git Bash receives properly formatted paths (/c/Users/... format)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward path resolution fix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Terminal launcher now works reliably across all platforms. Ralph.sh and progress-watcher.js are correctly located when spawning new terminal windows. No blockers for future lazy mode or autopilot usage.

---
*Phase: quick*
*Completed: 2026-01-21*
