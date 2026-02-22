# Pitfalls Research

**Domain:** Fork-behavior port into a moving upstream baseline (Ralph loop + autopilot)
**Researched:** 2026-02-22
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Behavioral Contract Regression During Cherry-Pick Porting

**What goes wrong:**
Ported loop/autopilot logic appears to work, but it breaks existing workflow contracts (phase gates, command outputs, plan-state transitions) relied on by current users.

**Why it happens:**
Developers port implementation details from the sibling fork without first freezing and validating the baseline's external behavior contracts.

**How to avoid:**
Define contract tests before porting: command surface snapshots, workflow gate invariants, and state transition assertions. Treat current baseline behavior as canonical unless intentionally changed.

**Warning signs:**
Existing tests pass only on happy path, while users report "same command, different behavior"; JSON output shape drifts; roadmap/phase progression differs after autopilot runs.

**Phase to address:**
Phase 1 - Contract freeze and fork diff mapping.

---

### Pitfall 2: Compatibility Drift Between Canonical and Runtime-Mirrored Trees

**What goes wrong:**
Fixes land in one tree (`get-shit-done/` or `agents/`) but not mirrored runtime paths (`.opencode/...`), causing runtime-specific divergence.

**Why it happens:**
Mirrored source trees are hand-maintained during fast porting and milestone pressure.

**How to avoid:**
Pick a single canonical source and generate mirrors automatically in build/release. Add a parity check that fails CI when mirrored files diverge.

**Warning signs:**
Behavior differs across Claude/OpenCode/Gemini; same command output differs by runtime; bug fix "works locally" but not in another runtime installation.

**Phase to address:**
Phase 2 - Runtime parity and packaging pipeline hardening.

---

### Pitfall 3: State Corruption From Non-Atomic or Concurrent Planning Writes

**What goes wrong:**
Loop/autopilot updates partially written `.planning/` artifacts, inconsistent `STATE.md`, or conflicting phase files that block recovery.

**Why it happens:**
Ported logic adds write paths without preserving atomic write semantics, lock discipline, or deterministic transition ordering.

**How to avoid:**
Enforce write-through-temp-then-rename for all state docs, define one writer per state transition, and add invariants validated after every autopilot step.

**Warning signs:**
Malformed frontmatter after interruption, duplicate/inconsistent phase numbering, "cannot determine current phase" errors after loop restart.

**Phase to address:**
Phase 3 - State durability and transaction semantics.

---

### Pitfall 4: Parser Fragility From Markdown/Frontmatter Shape Drift

**What goes wrong:**
Verification and roadmap extraction silently misread valid files because regex parsing fails on format variants introduced by ported behavior.

**Why it happens:**
Workflow-critical parsing depends on heading/frontmatter shape assumptions rather than schema-backed parsing.

**How to avoid:**
Replace ad-hoc parsing with YAML + explicit schema validation, keep templates synchronized with parser expectations, and add malformed-but-valid fixture coverage.

**Warning signs:**
False pass/fail in `verify`; intermittent "missing must_haves" on files that contain them; behavior changes when heading capitalization/spacing changes.

**Phase to address:**
Phase 4 - Parser hardening and document schema enforcement.

---

### Pitfall 5: Workflow Config Drift and Flag Non-Propagation

**What goes wrong:**
Ported autopilot controls ignore configured flags (for example `workflow.*`), creating behavior mismatch versus documented controls.

**Why it happens:**
Config loading and init rendering paths diverge during incremental porting; new flags are read in one command path but not another.

**How to avoid:**
Create a single config contract module, add exhaustive propagation tests for all workflow flags, and block merges on missing config parity.

**Warning signs:**
Config values present in `.planning/config.json` but absent in generated phase/init artifacts; toggles appear to do nothing.

**Phase to address:**
Phase 5 - Configuration contract unification.

---

### Pitfall 6: Silent Failure Paths Hide Porting Regressions

**What goes wrong:**
Critical failures are swallowed by broad catch blocks, so autopilot/loop degradation appears as missing behavior instead of visible errors.

**Why it happens:**
Legacy defensive coding patterns use empty catches to keep hooks/commands running without user-facing failures.

**How to avoid:**
Replace blanket catches with structured warnings and debug telemetry, assign failure classes, and test failure-observability paths.

**Warning signs:**
"Nothing happened" bug reports; missing hook outputs with no logs; non-deterministic behavior that cannot be reproduced from traces.

**Phase to address:**
Phase 6 - Observability and failure surfacing.

---

### Pitfall 7: Test Blind Spots Around Installer, Hooks, and Cross-Runtime Paths

**What goes wrong:**
Port appears stable in local CLI tests but fails in install/uninstall, hook execution, or runtime-specific file placement.

**Why it happens:**
Current tests are mostly command-level happy-path integration tests without coverage gates or release artifact validation.

**How to avoid:**
Add test matrix across runtimes/platforms, include installer + hook integration tests, and enforce minimum coverage on changed critical modules.

**Warning signs:**
Regression only appears in packaged/npm flow; runtime-specific install bugs; hot-path hooks fail despite green unit suite.

**Phase to address:**
Phase 7 - Reliability test matrix and CI gating.

---

### Pitfall 8: Release Artifact Contamination and Stale Generated Assets

**What goes wrong:**
Deprecated hook artifacts or backup files ship in package output and overwrite expected behavior during installation.

**Why it happens:**
Build pipeline copies generated assets without pre-cleaning and without package sanity assertions.

**How to avoid:**
Add clean-before-build for generated dirs, assert package file manifest in CI, and run installation smoke tests from packed tarball.

**Warning signs:**
Unexpected deprecated files in `npm pack` output; users seeing old hook behavior after upgrade.

**Phase to address:**
Phase 8 - Release hardening and distribution verification.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Direct cherry-pick without contract tests | Fast initial port progress | Hidden behavioral regressions and expensive backtracking | Never on critical workflow paths |
| Hand-maintaining runtime mirrors | No build-system work upfront | Drift and inconsistent runtime behavior | Only as a one-time emergency hotfix |
| Regex parsing for core workflow files | Quick implementation | Fragile verification and state inference | Temporary only behind schema migration plan |
| Empty catch blocks in automation paths | Fewer hard stops in demo flows | Silent failures, low diagnosability | Never for state mutation or gate logic |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Git command execution | Shell-string composition with manual quoting | Use argument-array process APIs and strict path handling |
| npm packaging/publish | Packing without cleaning generated output | Clean, rebuild, manifest-check, then pack and smoke-test |
| Multi-runtime installer | Assuming identical paths/permissions across runtimes | Runtime-specific adapters with contract tests per runtime |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-render synchronous status scans | Slow statusline and UI jitter | Cache todo metadata with mtime checks | Noticeable at larger phase/todo trees |
| Full planning-history rescans on each command | Latency spikes in verify/history commands | Incremental indexes + cached metadata | Around multi-milestone projects with many phase artifacts |
| Per-session forced registry checks | Startup lag and flaky offline behavior | TTL-based update checks and background retries | Frequent in constrained network or CI environments |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Building shell commands from interpolated strings | Command injection and path-escaping bugs | Use `spawnSync`/`execFileSync` with args arrays |
| Encouraging broad "skip permissions" defaults | Unsafe automation surface expansion | Default docs to least-privilege mode with explicit warnings |
| Trusting generated/mirrored files as authoritative | Supply-chain style drift and unnoticed tampering | Verify generated artifacts and hash/manifest checks in CI |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Non-deterministic autopilot messages | Users cannot trust next-step guidance | Deterministic state transitions with explicit reason logs |
| Hidden fallback behavior on failure | Confusion and repeated retries | Visible warnings plus actionable remediation text |
| Runtime-specific command semantics | Team workflows break across environments | Contract-level parity with runtime adapters |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Loop parity:** Same behavior only on one runtime - verify Claude/OpenCode/Gemini parity with fixture projects.
- [ ] **State durability:** Happy-path writes pass - verify interruption-safe atomic write and restart recovery.
- [ ] **Config controls:** New flags parse - verify every `workflow.*` flag propagates to all command outputs.
- [ ] **Release readiness:** Local tests pass - verify `npm pack` manifest and post-install smoke tests.
- [ ] **Verification integrity:** `verify` succeeds on canonical files - verify malformed/variant frontmatter cases fail correctly.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Behavioral contract regression | HIGH | Re-run contract suite, bisect offending port commit set, reintroduce behind feature gate, and backfill parity tests |
| State corruption in `.planning/` | HIGH | Restore from last known-good snapshot, replay deterministic transitions, add corruption detector before resume |
| Runtime drift between mirrored trees | MEDIUM | Regenerate mirror from canonical source, run parity diff checks, and republish fixed package |
| Config flag non-propagation | MEDIUM | Centralize config read path, add table-driven propagation tests, and patch init/plan renderers |
| Silent failures | MEDIUM | Add structured logs and failure counters, reproduce with debug mode, and promote critical warnings to hard failures |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Behavioral contract regression | Phase 1 - Contract freeze and fork diff mapping | Golden command-output snapshots + workflow gate parity tests |
| Runtime mirror compatibility drift | Phase 2 - Runtime parity and packaging pipeline hardening | Canonical-vs-mirror diff check in CI |
| State corruption | Phase 3 - State durability and transaction semantics | Crash/interruption simulation with successful resume |
| Parser fragility | Phase 4 - Parser hardening and schema enforcement | Variant/malformed fixture suite for verify/roadmap parsers |
| Config drift | Phase 5 - Configuration contract unification | Exhaustive `workflow.*` propagation test matrix |
| Silent failures | Phase 6 - Observability and failure surfacing | Failure-path tests assert warning/error telemetry |
| Test blind spots | Phase 7 - Reliability test matrix and CI gating | Cross-runtime install/hook integration tests required in CI |
| Release artifact contamination | Phase 8 - Release hardening and distribution verification | Clean build + `npm pack` manifest assertion + install smoke test |

## Sources

- `.planning/PROJECT.md` (project scope, constraints, compatibility requirements)
- `.planning/codebase/CONCERNS.md` (known bugs, fragile areas, test gaps, security/performance concerns)
- `.planning/codebase/TESTING.md` (current test patterns and coverage limitations)
- Internal domain experience: fork-port convergence projects with workflow/stateful CLI tooling (confidence: MEDIUM)

---
*Pitfalls research for: Ralph loop + autopilot port into moving baseline*
*Researched: 2026-02-22*
