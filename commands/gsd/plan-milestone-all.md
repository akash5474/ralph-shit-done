---
name: gsd:plan-milestone-all
description: Generate all PLAN.md files for all phases in one interactive session
argument-hint: "[--resume] [--skip-research]"
agent: (none - orchestrator command)
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Task
---

<execution_context>
@~/.claude/get-shit-done/references/ui-brand.md
</execution_context>

<objective>
Generate all PLAN.md files for all phases before autonomous execution.

**Flow:** Enumerate phases -> Plan each sequentially -> Present summary -> Refine -> Done

**Orchestrator role:** Track planning progress, spawn gsd-planner for each phase, handle failures with retry, enable conversational refinement, commit after each phase.

**Why sequential:** Dependencies between phases (Phase N may reference Phase N-1 outputs). Also avoids context explosion from parallel planning.
</objective>

<context>
Flags:
- `--resume` - Resume interrupted session (read progress from STATE.md)
- `--skip-research` - Skip research for all phases

Uses functions from:
- bin/lib/planning.sh (init_planning_session, show_planning_progress, get_planning_summary)
- bin/lib/state.sh (update_planning_progress, set_planning_session)
- bin/lib/parse.sh (get_all_phases, get_unplanned_phases, get_phase_name)
</context>

<process>

## 1. Validate Environment

```bash
ls .planning/ROADMAP.md 2>/dev/null
```

**If not found:** Error - run `/gsd:new-project` first.

## 2. Parse Arguments

Extract from $ARGUMENTS:
- `--resume` flag for session continuation
- `--skip-research` flag to skip all research

## 3. Check/Initialize Session

```bash
# Check for existing planning progress
grep "<!-- PLANNING_PROGRESS_START -->" .planning/STATE.md 2>/dev/null
```

**If `--resume` AND progress exists:**
- Read current session status from STATE.md
- Display: "Resuming planning session: {session_id}"
- Get list of unplanned phases (phases without PLAN.md)

**Otherwise:**
- Initialize new planning session (creates session ID, adds progress section)
- Get all phases from ROADMAP.md
- Display: "Starting planning session: {session_id}"

## 4. Display Planning Overview

Show what will be planned:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD > PLAN MILESTONE ALL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Session: {session_id}
Phases to plan: {count}

| Phase | Name | Status |
|-------|------|--------|
| 8 | Upfront Planning | pending |
| 9 | Mode Selection | pending |
| 10 | Execution Commands | pending |

Ready to generate all plans? (y/n)
```

Wait for user confirmation (or auto-proceed if non-interactive).

</process>

<success_criteria>
- [ ] .planning/ROADMAP.md validated
- [ ] Planning session initialized (new or resumed)
- [ ] All phases enumerated from roadmap
- [ ] Each phase planned with gsd-planner (with retry on failure)
- [ ] Git commit after each successful phase
- [ ] Summary presented for user review
- [ ] Refinement requests handled (plan revision or phase replan)
- [ ] User typed "proceed" to finalize
- [ ] User knows next steps (ralph configure, run-milestone)
</success_criteria>
