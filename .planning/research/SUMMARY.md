# Project Research Summary

**Project:** Ralph Loop + Autopilot Port
**Domain:** Reliable, multi-runtime CLI workflow orchestration with markdown contracts
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a brownfield convergence effort: port Ralph loop and autopilot behavior into a newer baseline without breaking the existing `/gsd:*` command and workflow contract model. The research converges on a clear approach used by strong CLI orchestration systems: preserve external command/workflow contracts, introduce a canonical transition core (reducer + transition table), and treat `.planning` artifacts as transactional state rather than loose markdown files.

The recommended path is incremental, not a rewrite. Keep the current runtime shape (CLI + markdown workflows + file-state lifecycle), raise the technical baseline (Node 24 LTS, TypeScript 5.9, schema validation), and insert an engine facade with compatibility adapters for legacy and autopilot semantics. This allows safe dual-run verification before single-writer cutover, so behavior parity is proven rather than assumed.

The dominant risks are contract regression, runtime mirror drift, and state corruption from non-atomic writes. Mitigation is explicit: freeze behavioral contracts first, centralize all state transitions behind one writer boundary, enforce atomic multi-artifact commits with journaling, and gate completion through verification + gap closure loops. In short: deterministic core first, autonomy second, polish last.

## Key Findings

### Recommended Stack

The stack recommendation is to modernize the execution and validation layers while minimizing architectural churn. Node 24 LTS and TypeScript 5.9 provide a stable 2026 baseline; markdown parsing should move from regex approaches to AST-backed parsing plus schema checks; and autopilot reliability should rely on bounded concurrency, retries, and structured logs.

**Core technologies:**
- **Node.js 24 LTS**: runtime baseline for CLI/orchestration with current security/support and modern built-ins.
- **TypeScript 5.9.x**: type-safe workflow/tool/state contracts to catch drift early during fork convergence.
- **Ajv 8.18 + JSON Schema**: deterministic validation for frontmatter, command payloads, and persisted artifacts.
- **remark 15 + remark-parse 11**: AST-based markdown contract parsing, replacing brittle regex parsing.

**Critical version/compatibility notes:**
- Avoid Node 16 baseline (EOL and ecosystem incompatibility).
- Keep `chalk@5` out of remaining CommonJS surfaces until ESM migration is explicit.
- Use `better-sqlite3` only if file-state durability becomes insufficient under higher concurrency.

### Expected Features

The MVP is reliability-first autopilot convergence, not feature expansion. Users expect deterministic resume, explicit human checkpoints, bounded autonomous execution, verification-gated completion, and auditable git/artifact updates. Differentiators should be added after baseline parity is stable.

**Must have (table stakes):**
- Deterministic plan loop with resume-safe continuation from canonical planning artifacts.
- Full checkpoint protocol (`human-verify`, `decision`, `human-action`) including auth-gate handling.
- Safety rails for autopilot (iteration/time limits, stuck threshold, circuit breaker).
- Verification gates and gap-closure loops before marking tasks/phases done.
- Atomic commits plus `SUMMARY`/`STATE`/`ROADMAP` traceability updates.

**Should have (competitive):**
- Segment-aware routing (subagent for autonomous segments, main context for decision-heavy segments).
- Detached terminal autopilot launch with robust progress observability.
- Cross-runtime behavioral parity across Claude/OpenCode/Gemini.

**Defer (v2+):**
- Multi-agent cross-session orchestration teams.
- Organization-level policy/governance packs.

### Architecture Approach

Architecture research strongly favors a facade + adapter convergence pattern. Keep command/workflow assets stable, normalize all lifecycle events into canonical events, run them through a pure transition reducer, and allow only a single artifact transaction writer to mutate `.planning` files. Add an append-only transition journal for replay, crash recovery, and migration confidence.

**Major components:**
1. **Contract/Command Layer** - stable `/gsd:*` commands and workflow markdown entrypoints.
2. **Engine Facade + Compatibility Adapters** - canonical transition API that maps legacy/autopilot semantics to one event model.
3. **Transition Reducer** - pure, deterministic state transition authority with explicit legal transition table.
4. **Artifact Transaction Writer** - atomic multi-file writes (temp + fsync + rename) for `STATE/ROADMAP/PLAN/SUMMARY` consistency.
5. **Transition Journal** - append-only log for replay, auditing, and divergence debugging.

### Critical Pitfalls

1. **Behavioral contract regression during porting** - prevent with upfront contract freeze and golden output/transition tests before any cherry-pick integration.
2. **Runtime mirror drift across canonical vs mirrored trees** - prevent by generating mirrors from one source and enforcing CI parity checks.
3. **State corruption from non-atomic or concurrent writes** - prevent with one writer boundary, atomic transaction semantics, and interruption/restart tests.
4. **Parser fragility from markdown/frontmatter drift** - prevent by replacing regex assumptions with schema-backed parsing and malformed-variant fixtures.
5. **Silent failure paths masking regressions** - prevent by removing blanket catches and adding structured warning/error telemetry.

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Contract Freeze and Canonical Model
**Rationale:** Every later phase depends on stable behavior definitions; without this, parity claims are untestable.
**Delivers:** Frozen command/workflow contracts, canonical event taxonomy, transition table, reducer tests, baseline-vs-fork diff map.
**Addresses:** Deterministic resume loop, verification gate integrity, cross-runtime parity foundation.
**Avoids:** Pitfall 1 (behavioral regression), Pitfall 4 (parser-driven semantic drift).

### Phase 2: Durable State Engine Foundation
**Rationale:** Autonomy must sit on crash-safe, deterministic write semantics before loop enhancements are ported.
**Delivers:** Engine facade integration, atomic writer, transition journal, single-writer enforcement in `gsd-tools` paths.
**Uses:** Node fs atomic patterns, Ajv schema checks, structured logging primitives.
**Implements:** Facade/reducer/writer/journal architecture core.
**Avoids:** Pitfall 3 (state corruption), Pitfall 6 (hidden failures during state mutation).

### Phase 3: Autopilot Parity and Safety Rails
**Rationale:** With deterministic core in place, port autopilot loop semantics safely behind adapters and guardrails.
**Delivers:** Checkpoint protocol + auth gates, iteration/timeout/stuck/circuit limits, resume/continue flows, parity fixtures.
**Addresses:** MVP table stakes around autonomous execution safety and continuation.
**Avoids:** Pitfall 5 (config non-propagation), Pitfall 6 (silent autopilot degradation).

### Phase 4: Verification, Gap Closure, and Artifact Traceability
**Rationale:** Trust requires proving done-ness and preserving project memory after each loop.
**Delivers:** Phase/task verifier hardening, requirement traceability, structured gap remediation, atomic docs/git update pipeline.
**Addresses:** Verification-gated completion and auditability expectations.
**Avoids:** Pitfall 1 (false parity), Pitfall 8 (release artifact contamination through weak pipelines).

### Phase 5: Runtime Parity, Packaging, and Reliability Matrix
**Rationale:** Final hardening should validate behavior in real install/runtime environments, not only local command tests.
**Delivers:** Canonical-to-mirror generation, CI parity gates, cross-runtime install/hook tests, `npm pack` manifest and smoke checks.
**Addresses:** Cross-runtime contract parity differentiator and release readiness.
**Avoids:** Pitfall 2 (mirror drift), Pitfall 7 (test blind spots), Pitfall 8 (stale artifacts).

### Phase 6: Post-MVP Differentiators
**Rationale:** Add advanced routing and detached-run UX only after core reliability is proven in production-like usage.
**Delivers:** Segment-aware routing and detached terminal lifecycle improvements with observability.
**Addresses:** Competitive differentiation features (P2).
**Avoids:** Anti-feature drift into unsafe zero-confirmation automation.

### Phase Ordering Rationale

- Contract determinism precedes implementation to keep parity measurable and regression debugging tractable.
- Durability and single-writer boundaries precede autonomy because autopilot amplifies write-safety flaws.
- Verification and artifact traceability follow parity so completion claims remain evidence-based.
- Runtime/package hardening is late-stage because it validates integrated behavior after core semantics stabilize.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Autopilot Parity and Safety Rails):** nuanced checkpoint semantics and risk bounds across runtimes; likely `/gsd-research-phase` candidate.
- **Phase 5 (Runtime Parity and Packaging):** runtime-specific installer/hook edge cases and packaging constraints need targeted validation.
- **Phase 6 (Post-MVP Differentiators):** segment-aware routing quality/performance trade-offs need empirical guidance.

Phases with standard patterns (likely skip research-phase):
- **Phase 1 (Contract Freeze and Canonical Model):** established state-machine and contract-test patterns.
- **Phase 2 (Durable State Engine Foundation):** well-documented atomic-write, reducer, and journaling practices.
- **Phase 4 (Verification and Traceability):** familiar requirement-traceability and CI gating workflows.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Strong official docs and package metadata; Context7 was unavailable so confidence is slightly reduced. |
| Features | HIGH | Cross-checked with internal workflows and competitor docs; priorities are consistent and concrete. |
| Architecture | MEDIUM | Pattern quality is strong, but some guidance is architectural inference that still needs implementation validation. |
| Pitfalls | HIGH | Highly actionable, project-specific failure modes mapped to prevention phases and test strategies. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Context7 unavailability in stack research:** re-validate exact version picks and late-2026 compatibility during implementation kickoff.
- **Autopilot adapter scope granularity:** quantify which fork behaviors are parity-critical vs intentionally dropped before Phase 3 planning.
- **Mirror-generation mechanism details:** decide whether build-time generation or release-time synthesis is canonical for runtime trees.
- **Performance breakpoints under heavy `.planning` history:** validate index/caching thresholds with representative large project fixtures.

## Sources

### Primary (HIGH confidence)
- `.planning/research/STACK.md` - official Node/TypeScript/package-doc aligned stack recommendations and compatibility constraints.
- `.planning/research/FEATURES.md` - prioritized feature model (table stakes, differentiators, anti-features, dependency graph).
- `.planning/research/PITFALLS.md` - failure-mode catalog with prevention and phase mapping.
- Official docs referenced in research: Node.js docs/releases, TypeScript docs, Ajv docs, remark docs, SemVer, npm/package metadata.

### Secondary (MEDIUM confidence)
- `.planning/research/ARCHITECTURE.md` - convergence architecture pattern recommendations and migration sequencing.
- Martin Fowler Strangler Fig guidance and XState deterministic transition references.
- Competitor/runtime documentation (Claude Code, Gemini CLI, OpenHands, Aider) for feature expectation calibration.

### Tertiary (LOW confidence)
- Internal domain-experience inferences where direct benchmark data is absent (notably advanced differentiator ROI timing).

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
