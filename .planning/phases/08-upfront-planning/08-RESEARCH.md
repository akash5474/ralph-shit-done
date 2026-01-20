# Phase 8: Upfront Planning - Research

**Researched:** 2026-01-19
**Domain:** Multi-phase orchestration, session management, interactive workflows in bash + Claude Code CLI
**Confidence:** HIGH

## Summary

Phase 8 creates the `/gsd:plan-milestone-all` workflow that generates all PLAN.md files for all phases in a single interactive session before autonomous execution begins. This is the final piece enabling true "fire and forget" autonomous execution - users complete all planning upfront, then walk away while ralph.sh executes.

The codebase already has robust infrastructure to build on:
- `/gsd:plan-phase` orchestrates single-phase planning with research, planning, and verification loops
- `gsd-planner` agent generates PLAN.md files with proper frontmatter and structure
- `gsd-plan-checker` agent verifies plans achieve phase goals
- `bin/lib/state.sh` provides atomic STATE.md updates
- `bin/lib/parse.sh` provides ROADMAP.md parsing (plan enumeration, completion detection)
- `bin/ralph.sh` demonstrates the outer loop pattern for iterative Claude invocation

The key insight is that `plan-milestone-all` is an orchestrator over the existing `/gsd:plan-phase` command - not a replacement. It sequences invocations, tracks progress, enables refinement, and commits results. The individual planning logic already exists.

**Primary recommendation:** Create a new slash command `/gsd:plan-milestone-all` that:
1. Reads ROADMAP.md to enumerate phases
2. Iterates through phases sequentially, calling `/gsd:plan-phase` logic for each
3. Tracks progress in a dedicated planning STATE section (planning_progress in STATE.md)
4. After all plans generated, presents summary for user review
5. Enables conversational refinement before proceeding to execution

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code CLI | current | Plan generation via -p flag | Already used in invoke.sh for task execution |
| bash | 4.0+ | Orchestration script | Cross-platform via Git Bash, established in ralph.sh |
| Task() agent spawn | GSD | Subagent invocation | Pattern established in /gsd:plan-phase |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jq (optional) | any | JSON parsing | When available for Claude output parsing |
| grep/sed/awk | POSIX | Text parsing | STATE.md and ROADMAP.md manipulation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Spawning subagents per phase | Direct Claude CLI calls | Subagents provide proper context loading via @file; CLI calls need manual context assembly |
| Separate planning-state.md | Extend STATE.md | Separate file adds complexity; STATE.md already has progress tracking patterns |
| Parallel phase planning | Sequential | Dependencies between phases make parallel risky; sequential ensures SUMMARY.md available for next phase |

**Installation:**
No additional dependencies required. All tools already available in the codebase.

## Architecture Patterns

### Recommended Command Structure
```
commands/gsd/
  plan-milestone-all.md     # NEW: Orchestrator command

bin/lib/
  planning.sh              # NEW: Planning session functions
  state.sh                 # Extended: Planning progress tracking
  parse.sh                 # Extended: Phase enumeration from ROADMAP.md
```

### Pattern 1: Orchestrator Over Existing Workflows

**What:** New command sequences existing `/gsd:plan-phase` calls rather than duplicating planning logic
**When to use:** When building higher-level workflows from existing commands

```markdown
# /gsd:plan-milestone-all flow

1. Parse ROADMAP.md → enumerate phases
2. For each phase in sequence:
   a. Check if PLAN.md files exist (skip if complete, per resumability)
   b. Check if CONTEXT.md exists (offer research vs skip)
   c. Spawn gsd-planner subagent (reuse /gsd:plan-phase logic)
   d. Track completion in STATE.md planning section
   e. Git commit after successful plan generation
3. After all phases planned:
   a. Present summary table
   b. Enter refinement loop (user can request changes)
   c. Re-plan specific phase if requested
4. Exit when user says "proceed"
```

**Why not invoke /gsd:plan-phase directly:**
- Slash commands are user-facing, not inter-command callable
- Need to control context between phases (summarize vs full load)
- Need to track cross-phase planning progress
- Verification loop is handled at orchestrator level, not per-phase

### Pattern 2: Planning Progress in STATE.md

**What:** Track planning session state separate from execution state
**When to use:** For resumable multi-step workflows

```markdown
## Planning Progress

**Session:** planning-2026-01-19
**Status:** in_progress | completed | needs_refinement

| Phase | Plans | Status | Generated |
|-------|-------|--------|-----------|
| 1 | 2 | complete | 2026-01-19 14:30 |
| 2 | 3 | complete | 2026-01-19 14:45 |
| 3 | 2 | in_progress | - |
| 4 | TBD | pending | - |
```

**STATE.md markers:**
```markdown
<!-- PLANNING_PROGRESS_START -->
[table content]
<!-- PLANNING_PROGRESS_END -->
```

### Pattern 3: Context Summarization Between Phases

**What:** Pass minimal context forward to avoid bloat
**When to use:** When planning Phase N requires knowing about Phase N-1

```bash
# Per CONTEXT.md decision: "Fresh context per phase - clear between phases,
# start clean with ROADMAP + prior PLAN.md summaries"

# Context for Phase N planning:
- ROADMAP.md (full)
- REQUIREMENTS.md (full)
- STATE.md (full)
- Prior phase SUMMARY.md files (1-2 paragraphs each, not full PLAN.md)
- Current phase CONTEXT.md (if exists)
- Current phase RESEARCH.md (if exists)
```

**Implementation:**
```bash
# Extract summary section from PLAN.md frontmatter (not full content)
get_phase_summary() {
    local phase_num="$1"
    local phase_dir
    phase_dir=$(ls -d .planning/phases/${phase_num}-* 2>/dev/null | head -1)

    # Look for SUMMARY.md files (created after plan execution)
    # If not available, extract objective from PLAN.md
    if ls "${phase_dir}"/*-SUMMARY.md 2>/dev/null | head -1; then
        # Use summaries
        cat "${phase_dir}"/*-SUMMARY.md | head -50
    else
        # Fall back to plan objectives
        for plan in "${phase_dir}"/*-PLAN.md; do
            sed -n '/<objective>/,/<\/objective>/p' "$plan" | head -5
        done
    fi
}
```

### Pattern 4: Interactive Refinement Loop

**What:** Conversational refinement after all plans generated
**When to use:** When user reviews generated plans and wants changes

```
User: "Plan 03-02 needs to handle error cases"
Claude: Regenerating 03-02...
[Spawns gsd-planner in revision mode for 03-02]
Claude: Plan 03-02 updated. Here's what changed: [diff]

User: "The dependency between 04-01 and 04-02 seems wrong"
Claude: Checking dependencies...
[Analyzes and potentially swaps dependency direction]
Claude: Updated. 04-01 now depends on 04-02. Wave assignments updated.

User: "proceed"
Claude: All 25 plans ready. You can now run /gsd:run-milestone
```

**Per CONTEXT.md decision:**
- No explicit lock mechanism - plans considered final when user says "proceed"
- Warn user if changing a plan that others depend on, but allow the change

### Pattern 5: Failure Recovery with Git Commits

**What:** Commit after each successful phase plan, retry on failure
**When to use:** For crash-safe progress persistence

```bash
# Per CONTEXT.md decision:
# - Git commit after each successful plan - failure loses only current plan
# - Retry 2-3 times on failure, then pause for user intervention (don't skip)

plan_single_phase() {
    local phase_num="$1"
    local retries=0
    local max_retries=3

    while [[ $retries -lt $max_retries ]]; do
        # Invoke planning (spawns gsd-planner)
        if generate_phase_plans "$phase_num"; then
            # Success - commit
            git add .planning/phases/${phase_num}-*/*-PLAN.md
            git commit -m "docs(${phase_num}): create phase plans"
            update_planning_progress "$phase_num" "complete"
            return 0
        fi

        retries=$((retries + 1))
        echo -e "${YELLOW}Retry $retries/$max_retries...${RESET}"
    done

    # All retries failed - pause for user intervention
    echo -e "${RED}Phase $phase_num planning failed after $max_retries attempts${RESET}"
    return 1
}
```

### Anti-Patterns to Avoid
- **Re-implementing plan-phase logic:** Use existing gsd-planner agent, don't duplicate
- **Loading all prior PLAN.md files:** Causes context bloat; use summaries only
- **Parallel phase planning:** Dependencies between phases break; stay sequential
- **Implicit state:** Track progress explicitly in STATE.md for resumability
- **Automatic skipping on failure:** Per CONTEXT.md, pause for intervention instead

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase enumeration | Custom ROADMAP parser | `get_total_plans()` + extend parse.sh | Already parses plan checkboxes, extend for phases |
| Plan generation | Custom prompting | gsd-planner agent via Task() | Full planning logic already implemented |
| Plan verification | Custom checks | gsd-plan-checker agent | Already does goal-backward verification |
| STATE.md updates | Direct file manipulation | `update_section()` from state.sh | Atomic writes, marker-based sections |
| Progress display | Custom formatting | `generate_progress_bar()` from state.sh | Established pattern |
| Git commits | Manual git commands | Checkpoint pattern from checkpoint.sh | Atomic commits, proper messaging |

**Key insight:** Phase 8 is primarily orchestration - composing existing pieces. The planning logic, verification, and state management all exist. New code should coordinate, not duplicate.

## Common Pitfalls

### Pitfall 1: Context Explosion Across Phases

**What goes wrong:** Loading all prior PLAN.md files causes context overflow
**Why it happens:** Natural instinct to provide "full context" for better planning
**How to avoid:**
- Use SUMMARY.md when available (much smaller)
- Extract only <objective> section if SUMMARY not available
- Keep prior context to 50-100 lines per phase
**Warning signs:** Claude produces truncated or degraded plans for later phases

### Pitfall 2: Lost Progress on Crash

**What goes wrong:** Crash during planning loses all progress
**Why it happens:** Not committing incrementally
**How to avoid:**
- Git commit after EACH successful phase plan (not just at end)
- Track progress in STATE.md with markers
- Check for existing plans before regenerating (resumability)
**Warning signs:** User has to start over after browser/terminal close

### Pitfall 3: Undetected Inter-Phase Dependencies

**What goes wrong:** Phase 4 plan assumes Phase 3 output that doesn't exist
**Why it happens:** Plans generated without checking prior phase outputs
**How to avoid:**
- Load prior phase PLAN.md objectives to understand what exists
- Validate that depends_on references resolve
- Cross-check artifact paths between phases
**Warning signs:** Execute phase fails because expected file doesn't exist

### Pitfall 4: Refinement Breaks Dependencies

**What goes wrong:** User changes Plan 02-01, breaking Plan 03-01 that depends on it
**Why it happens:** No dependency impact analysis before allowing changes
**How to avoid:**
- Parse depends_on chains across all plans
- Warn user: "Plans 03-01, 03-02 depend on 02-01. Changing may affect them."
- Allow change but mark dependent plans for review
**Warning signs:** Post-refinement execution fails with missing dependencies

### Pitfall 5: Non-Interactive Mode Hangs

**What goes wrong:** Planning session expects user input but runs headless
**Why it happens:** Forgetting to handle non-interactive case
**How to avoid:**
- Check `[[ -t 0 ]]` before any prompts
- Non-interactive mode: generate all plans, skip refinement, auto-proceed
- Or: fail fast if interactive required
**Warning signs:** CI/automated runs hang indefinitely

### Pitfall 6: Research Skipped When Needed

**What goes wrong:** Complex phase planned without research, plans miss key patterns
**Why it happens:** User declined research, or CONTEXT.md didn't suggest it
**How to avoid:**
- Per CONTEXT.md: "If CONTEXT.md suggests research, offer it"
- Check for technical complexity signals in phase description
- Make research optional but visible
**Warning signs:** Plans miss standard patterns for domain (auth, payments, etc.)

## Code Examples

Verified patterns from existing codebase:

### Enumerating Phases from ROADMAP.md
```bash
# Source: Extend pattern from parse.sh get_next_plan_after
get_all_phases() {
    local roadmap="${ROADMAP_FILE:-.planning/ROADMAP.md}"

    # Extract phase numbers from "### Phase N:" headers
    grep -E '^### Phase [0-9]+:' "$roadmap" | \
        sed 's/### Phase \([0-9]*\):.*/\1/' | \
        sort -n
}

# Check if phase has plans
phase_has_plans() {
    local phase_num="$1"
    local padded=$(printf "%02d" "$phase_num")
    local phase_dir
    phase_dir=$(ls -d .planning/phases/${padded}-* 2>/dev/null | head -1)

    [[ -d "$phase_dir" ]] && ls "${phase_dir}"/*-PLAN.md 2>/dev/null | head -1
}
```

### Spawning Planner Subagent (from /gsd:plan-phase pattern)
```bash
# Source: commands/gsd/plan-phase.md step 8
spawn_planner() {
    local phase_num="$1"
    local context_files="$2"

    local prompt="<planning_context>

**Phase:** ${phase_num}
**Mode:** standard

**Project State:**
@.planning/STATE.md

**Roadmap:**
@.planning/ROADMAP.md

${context_files}

</planning_context>

<downstream_consumer>
Output consumed by /gsd:execute-phase
Plans must be executable prompts with frontmatter and tasks.
</downstream_consumer>"

    # Spawn via Task (internal to Claude)
    Task(
        prompt="$prompt",
        subagent_type="gsd-planner",
        description="Plan Phase ${phase_num}"
    )
}
```

### Progress Tracking Update
```bash
# Source: Extend pattern from state.sh update_section
update_planning_progress() {
    local phase_num="$1"
    local status="$2"  # pending | in_progress | complete | failed
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M')

    # Read current progress table, update matching row
    # Similar to add_iteration_entry pattern but for planning
    local new_row="| $phase_num | - | $status | $timestamp |"

    # Use sed to update existing row or append
    # ... (implementation similar to state.sh patterns)
}
```

### Dependency Impact Analysis
```bash
# Source: New pattern for refinement safety
get_dependent_plans() {
    local plan_id="$1"

    # Search all PLAN.md frontmatter for depends_on containing this plan
    grep -l "depends_on:.*${plan_id}" .planning/phases/*/*-PLAN.md 2>/dev/null | \
        xargs -I{} basename {} | \
        sed 's/-PLAN.md//'
}

warn_if_has_dependents() {
    local plan_id="$1"
    local dependents
    dependents=$(get_dependent_plans "$plan_id")

    if [[ -n "$dependents" ]]; then
        echo -e "${YELLOW}Warning: These plans depend on $plan_id:${RESET}"
        echo "$dependents" | while read dep; do
            echo "  - $dep"
        done
        echo -e "${YELLOW}Changing $plan_id may affect them.${RESET}"
    fi
}
```

### Live Progress Display
```bash
# Source: Pattern from display.sh, extended for planning
show_planning_progress() {
    local current_phase="$1"
    local total_phases="$2"
    local phase_name="$3"

    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${CYAN} GSD ► PLANNING PHASE ${current_phase}/${total_phases}${RESET}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    echo -e "Phase: ${BOLD}${phase_name}${RESET}"
    echo ""
}
```

## Integration Points

### With Existing Commands

| Command | Integration | Notes |
|---------|-------------|-------|
| `/gsd:plan-phase` | Extract planner/checker logic | Don't invoke command, reuse agent spawning |
| `/gsd:discuss-phase` | Check for CONTEXT.md | If exists, use decisions; if not, skip discussion |
| `/gsd:research-phase` | Check for RESEARCH.md | Offer research if CONTEXT.md suggests, otherwise skip |
| `/gsd:execute-phase` | Generate compatible plans | Same PLAN.md format, frontmatter, task structure |

### With Existing Infrastructure

| Component | Integration | Notes |
|-----------|-------------|-------|
| `gsd-planner` | Spawn via Task() | Reuse full agent for plan generation |
| `gsd-plan-checker` | Spawn via Task() | Verify each phase's plans before moving to next |
| `STATE.md` | Add Planning Progress section | Use marker pattern for resumability |
| `ROADMAP.md` | Read phases, update plan counts | Use existing checkbox pattern |
| `ralph.sh` | No direct integration | Plans generated here consumed by ralph later |

### New Files to Create

| File | Purpose | Pattern Source |
|------|---------|----------------|
| `commands/gsd/plan-milestone-all.md` | Orchestrator command | `commands/gsd/plan-phase.md` structure |
| `bin/lib/planning.sh` | Planning session functions | `bin/lib/state.sh` patterns |

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Plan one phase, execute, repeat | Plan all phases upfront | Phase 8 (this) | Enables autonomous execution |
| Interactive planning required | Optional refinement + auto-proceed | Phase 8 (this) | Supports headless execution |
| No cross-phase dependency check | Dependency impact warnings | Phase 8 (this) | Safer refinement |

**Deprecated/outdated:**
- None - this is new functionality

## Open Questions

Things that couldn't be fully resolved:

1. **Structural Validation Criteria**
   - What we know: CONTEXT.md says "structural validation before moving on (required sections, tasks, success criteria)"
   - What's unclear: Exact validation rules - is it just XML structure, or semantic checks?
   - Recommendation: Start with structure checks (frontmatter present, tasks have required elements), leave semantic validation to gsd-plan-checker

2. **Research Failure Handling**
   - What we know: CONTEXT.md says "If research fails: ask user whether to proceed with documented assumptions or retry"
   - What's unclear: What counts as research "failure"? Empty RESEARCH.md? Context7 errors?
   - Recommendation: Failure = researcher agent returns RESEARCH BLOCKED or no RESEARCH.md created. Proceed means creating plans without domain-specific patterns.

3. **Optimal Phase Batching**
   - What we know: Sequential phase planning is safe but potentially slow
   - What's unclear: Could independent phases (no inter-phase dependencies) be planned in parallel?
   - Recommendation: Start with sequential (simpler, safer), add parallel as optimization later if needed

4. **Refinement Scope**
   - What we know: User can request changes conversationally
   - What's unclear: How complex can refinement requests be? "Completely redesign phase 3"?
   - Recommendation: Support targeted changes (specific plan, specific task). For phase redesign, suggest user run `/gsd:plan-phase X` directly.

## Sources

### Primary (HIGH confidence)
- `commands/gsd/plan-phase.md` - Existing planning orchestrator pattern
- `agents/gsd-planner.md` - Plan generation logic and format
- `agents/gsd-plan-checker.md` - Plan verification methodology
- `bin/lib/state.sh` - STATE.md manipulation patterns
- `bin/lib/parse.sh` - ROADMAP.md parsing patterns
- `bin/ralph.sh` - Outer loop orchestration pattern
- `08-CONTEXT.md` - User decisions constraining implementation

### Secondary (MEDIUM confidence)
- `bin/lib/checkpoint.sh` - Git commit patterns
- `bin/lib/display.sh` - Progress display patterns
- `agents/gsd-phase-researcher.md` - Research integration points

### Tertiary (LOW confidence)
- None - all findings verified against codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all tools already in use in codebase
- Architecture: HIGH - follows established patterns from plan-phase, ralph.sh
- Pitfalls: HIGH - derived from codebase analysis and CONTEXT.md decisions
- Integration: HIGH - direct examination of existing commands and agents

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (stable domain, patterns don't change fast)
