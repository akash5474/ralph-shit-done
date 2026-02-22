# Roadmap: Ralph Loop + Autopilot Port

## Overview

This roadmap delivers a safe convergence of Ralph loop and autopilot behavior into the current `ralph-shit-done` baseline by proving parity first, then hardening deterministic loop execution, adding checkpoint safety controls, enforcing verification/traceability gates, and finishing with compatibility and regression confidence.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Parity Baseline and Port Mapping** - Freeze behavioral baseline and decide exactly what fork deltas to bring, revise, or drop.
- [ ] **Phase 2: Deterministic Loop and Resume Core** - Port loop execution so resume and next-step selection are deterministic and durable.
- [ ] **Phase 3: Checkpoint and Autopilot Safety Controls** - Implement explicit checkpoint handling and autonomous safety limits without gate regressions.
- [ ] **Phase 4: Verification and Artifact Traceability** - Enforce verifier/gap gates and synchronized traceability across planning artifacts.
- [ ] **Phase 5: Compatibility and Regression Hardening** - Validate unchanged command behavior and lock in regression coverage for critical flows.

## Phase Details

### Phase 1: Parity Baseline and Port Mapping
**Goal**: Maintainers can see an explicit, testable parity baseline and a justified include/update/drop integration map before code convergence.
**Depends on**: Nothing (first phase)
**Requirements**: CONT-02, INTG-01
**Success Criteria** (what must be TRUE):
  1. Maintainer can review a documented baseline-vs-fork behavior map tied to parity fixtures for key loop/autopilot workflows.
  2. Maintainer can trace each relevant `../get-shit-done-autopilot` candidate commit to an include/update/drop decision with rationale.
  3. Maintainer can run the parity fixture set and reproduce the expected baseline outputs before ported behavior is enabled.
**Plans**: TBD

### Phase 2: Deterministic Loop and Resume Core
**Goal**: Loop execution resumes safely from canonical state and always selects the next executable unit deterministically.
**Depends on**: Phase 1
**Requirements**: LOOP-01, LOOP-02, LOOP-03, INTG-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can interrupt an active run and resume from `.planning` state without restarting the phase.
  2. System consistently picks the same next executable plan/task from first incomplete state across repeated resumes.
  3. Maintainer can continue after pause checkpoints without duplicate artifact writes in `.planning` outputs.
  4. Ported loop behavior uses deterministic transitions and durable write patterns aligned with current repo conventions.
**Plans**: TBD

### Phase 3: Checkpoint and Autopilot Safety Controls
**Goal**: Autonomous execution is bounded and explicit, with all required human gates and auth steps surfaced predictably.
**Depends on**: Phase 2
**Requirements**: CONT-03, SAFE-01, SAFE-02, SAFE-03
**Success Criteria** (what must be TRUE):
  1. System pauses at `human-verify`, `decision`, and `human-action` checkpoints and shows a clear continuation path each time.
  2. Autopilot mode stops or pauses when iteration, timeout, stuck-threshold, or circuit-breaker limits are hit, with visible reason.
  3. Auth-required operations appear as explicit checkpoint prompts rather than silent failures.
  4. Existing workflow gate semantics remain intact while new checkpoint handling is active.
**Plans**: TBD

### Phase 4: Verification and Artifact Traceability
**Goal**: Completion claims are evidence-based through mandatory verification/gap loops and synchronized requirement traceability artifacts.
**Depends on**: Phase 3
**Requirements**: VERI-01, VERI-02, VERI-03
**Success Criteria** (what must be TRUE):
  1. Phase completion cannot be marked done until verification and gap checks pass or a documented gap loop is completed.
  2. Maintainer can trace each requirement-to-phase link consistently in plan, execution summary, roadmap, and state artifacts.
  3. Autonomous runs produce auditable updates with atomic commit boundaries and synchronized `SUMMARY`, `ROADMAP`, and `STATE` changes.
**Plans**: TBD

### Phase 5: Compatibility and Regression Hardening
**Goal**: Existing users keep expected `/gsd:*` behavior after convergence, protected by regression tests for critical flows.
**Depends on**: Phase 4
**Requirements**: CONT-01, INTG-03
**Success Criteria** (what must be TRUE):
  1. Maintainer can execute existing `/gsd:*` commands and observe unchanged expected behavior after the port.
  2. Regression tests cover critical loop, checkpoint, and verifier flows and pass in the target runtime matrix.
  3. Any detected behavior drift is captured as explicit regression failures before release readiness is declared.
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Parity Baseline and Port Mapping | 0/TBD | Not started | - |
| 2. Deterministic Loop and Resume Core | 0/TBD | Not started | - |
| 3. Checkpoint and Autopilot Safety Controls | 0/TBD | Not started | - |
| 4. Verification and Artifact Traceability | 0/TBD | Not started | - |
| 5. Compatibility and Regression Hardening | 0/TBD | Not started | - |
