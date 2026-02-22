# Requirements: Ralph Loop + Autopilot Port

**Defined:** 2026-02-22
**Core Value:** Port and unify Ralph loop + autopilot capabilities into this repo without breaking existing workflows or execution reliability.

## v1 Requirements

Requirements for this convergence release. Each maps to exactly one roadmap phase.

### Contract Parity

- [ ] **CONT-01**: Maintainer can run existing `/gsd:*` commands with unchanged expected behavior after porting.
- [ ] **CONT-02**: Maintainer can compare baseline vs fork behavior through documented parity fixtures and diff mapping.
- [ ] **CONT-03**: Maintainer can integrate autopilot/ralph-loop deltas without breaking current workflow gate semantics.

### Loop and Resume

- [ ] **LOOP-01**: Maintainer can resume interrupted execution from canonical `.planning` state without restarting the phase.
- [ ] **LOOP-02**: System determines next executable unit deterministically from first incomplete plan/task state.
- [ ] **LOOP-03**: Maintainer can continue loop execution after pause checkpoints with no duplicate artifact writes.

### Checkpoints and Safety

- [ ] **SAFE-01**: System pauses at `human-verify`, `decision`, and `human-action` checkpoints with explicit continuation paths.
- [ ] **SAFE-02**: Autopilot mode enforces iteration, timeout, stuck-threshold, and circuit-breaker limits.
- [ ] **SAFE-03**: Auth-required operations are surfaced as first-class checkpoints instead of silent failures.

### Verification and Traceability

- [ ] **VERI-01**: Phase completion is blocked until verification/gap checks pass or documented gap loop completes.
- [ ] **VERI-02**: Requirement-to-phase traceability is preserved across plan, execution, summary, and state artifacts.
- [ ] **VERI-03**: Autonomous runs produce auditable updates (atomic commits plus synchronized `SUMMARY/ROADMAP/STATE` changes).

### Integration Quality

- [ ] **INTG-01**: Maintainer can identify and port relevant commits from `../get-shit-done-autopilot` with rationale for include/update/drop decisions.
- [ ] **INTG-02**: Ported behavior follows current repo best practices for deterministic transitions and durable state writes.
- [ ] **INTG-03**: Regression test coverage exists for critical loop, checkpoint, and verifier flows.

## v2 Requirements

Deferred until convergence stability is proven.

### Advanced Autopilot

- **AUTO-01**: System supports segment-aware routing between subagent execution and main-context execution.
- **AUTO-02**: Maintainer can launch detached terminal autopilot sessions with robust progress observability.
- **AUTO-03**: System supports stricter auto-approve policy profiles for low-risk checkpoint classes.

## Out of Scope

Explicit exclusions for this release.

| Feature | Reason |
|---------|--------|
| Full rewrite of command/workflow architecture | High migration risk and low short-term value compared with incremental convergence |
| Cross-repo feature expansion unrelated to ralph loop/autopilot parity | Dilutes focus and increases regression surface |
| Zero-checkpoint autonomous mode | Conflicts with required safety and verification posture |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TBD | TBD | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 0
- Unmapped: 15

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after initial definition*
