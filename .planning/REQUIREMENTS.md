# Requirements: GSD Lazy Mode

**Defined:** 2026-01-19
**Core Value:** Plan once, walk away, wake up to done. No human needed at the computer after planning.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Core Loop

- [ ] **LOOP-01**: Retry loop with configurable max iterations
- [ ] **LOOP-02**: Fresh context per iteration (spawn new Claude instance each time)
- [ ] **LOOP-03**: Circuit breaker pattern (pause after N consecutive failures)
- [ ] **LOOP-04**: Intelligent stuck detection (analyze WHY stuck, try alternative approach)

### Exit Conditions

- [ ] **EXIT-01**: Test-based success criteria (all tests pass = milestone complete)
- [ ] **EXIT-02**: Stuck loop detection (3+ failures on same task triggers exit)
- [ ] **EXIT-03**: Dual-exit gate (both completion markers AND explicit exit signal required)

### Safety

- [ ] **SAFE-01**: Hard iteration cap (configurable maximum)
- [ ] **SAFE-02**: Fail-fast error handling (surface failures immediately, don't continue silently)

### Upfront Planning

- [ ] **PLAN-01**: Generate ALL PLAN.md files for ALL phases before execution starts
- [ ] **PLAN-02**: LLM-guided phase structure determination
- [ ] **PLAN-03**: Dependency analysis across phases
- [ ] **PLAN-04**: Interactive refinement during planning session

### State & Persistence

- [ ] **STATE-01**: State file persistence (STATE.md tracks iteration count, current phase, outcomes)
- [ ] **STATE-02**: Git commits as checkpoints (atomic commit each iteration)
- [ ] **STATE-03**: Progress indicator updated each iteration
- [ ] **STATE-04**: Learnings propagation (discovered patterns written to AGENTS.md or equivalent)

### Commands

- [ ] **CMD-01**: Mode selection at GSD startup (Interactive vs Lazy)
- [ ] **CMD-02**: `/gsd:plan-milestone-all` command for upfront planning
- [ ] **CMD-03**: `/gsd:ralph` command to configure retry loop (enable/disable, max iterations)
- [ ] **CMD-04**: `/gsd:run-milestone` command to start autonomous execution
- [ ] **CMD-05**: All base GSD commands available in lazy mode (new-project, map-codebase, progress, etc.)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Monitoring

- **MON-01**: Cost tracking (tokens per iteration, cumulative spend)
- **MON-02**: Time-based cap (max run duration limit)
- **MON-03**: Progress notifications (email/webhook on completion/failure)

### Advanced Recovery

- **REC-01**: Multi-model verification (critic agent reviews work before exit)
- **REC-02**: Checkpointing with resume (serialize full execution state beyond git)
- **REC-03**: Parallel phase execution (independent phases run simultaneously)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Per-agent ralph loops | Coordination complexity explodes. Milestone-level loop is simpler. |
| Real-time dashboard/UI | User walks away. Dashboard unseen. Wasted effort. |
| Token cost estimation | Highly variable. Inaccurate estimates frustrate users. |
| Automatic rollback | "Forward-only" is simpler. Rollback requires understanding causality. |
| Human intervention points | Defeats "fire and forget." Use Interactive mode for checkpoints. |
| Complex scheduling | "Run at 2am" adds cron-like complexity. User starts when ready. |
| Multi-milestone orchestration | One milestone is enough scope. Chaining adds failure modes. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOOP-01 | TBD | Pending |
| LOOP-02 | TBD | Pending |
| LOOP-03 | TBD | Pending |
| LOOP-04 | TBD | Pending |
| EXIT-01 | TBD | Pending |
| EXIT-02 | TBD | Pending |
| EXIT-03 | TBD | Pending |
| SAFE-01 | TBD | Pending |
| SAFE-02 | TBD | Pending |
| PLAN-01 | TBD | Pending |
| PLAN-02 | TBD | Pending |
| PLAN-03 | TBD | Pending |
| PLAN-04 | TBD | Pending |
| STATE-01 | TBD | Pending |
| STATE-02 | TBD | Pending |
| STATE-03 | TBD | Pending |
| STATE-04 | TBD | Pending |
| CMD-01 | TBD | Pending |
| CMD-02 | TBD | Pending |
| CMD-03 | TBD | Pending |
| CMD-04 | TBD | Pending |
| CMD-05 | TBD | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 0
- Unmapped: 22

---
*Requirements defined: 2026-01-19*
*Last updated: 2026-01-19 after initial definition*
