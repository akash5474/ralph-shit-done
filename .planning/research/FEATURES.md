# Feature Research

**Domain:** CLI agent autopilot and loop-style workflow orchestration
**Researched:** 2026-02-22
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Deterministic plan loop with resume (`STATE.md` + first incomplete plan detection) | Long-running agent workflows fail or pause; users expect safe continuation, not restart | MEDIUM | Existing baseline already has state/roadmap lifecycle; milestone should preserve contracts and add Ralph-loop parity rather than redesign core. |
| Human checkpoints (`checkpoint:human-verify`, `checkpoint:decision`, `checkpoint:human-action`) | Modern coding agents are expected to pause at risk boundaries and unblock on explicit user input | MEDIUM | Must support auth gates as first-class checkpoints; this is critical for API/CLI integrations that require login mid-run. |
| Autonomous mode with safety rails (iteration cap, timeout, stuck threshold, circuit breaker) | "Autopilot" without guardrails is considered unsafe and unreliable | MEDIUM | This repo should keep explicit safety prompts and persisted config before unattended execution. |
| Verification gates before phase completion (task verification + phase-level verifier + gap reporting) | Users expect "done" to mean requirements verified, not just files changed | HIGH | Existing verifier/gap-closure flow is strong; convergence should ensure autopilot still routes through verification outcomes and gap loops. |
| Traceable git/doc output (atomic task commits, SUMMARY artifacts, roadmap/state updates) | Operators need auditability and rollback for autonomous changes | HIGH | Commit granularity and docs updates are necessary for trust, bisectability, and milestone continuity. |
| Dependency-aware parallelism (wave execution with explicit sequencing) | Multi-plan phases are now expected to exploit parallel agents while preserving correctness | HIGH | Parallel waves must remain optional/config-driven and degrade cleanly to sequential mode. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Segment-aware execution routing (subagent for autonomous segments, main context for decision-dependent segments) | Preserves quality and context budget on long plans while keeping humans in control at decision points | HIGH | Strong candidate from autopilot fork; should be ported with current workflow contracts, not copied verbatim. |
| Detached terminal autopilot launch with independent execution lifecycle | Lets users "press go" and leave session while run continues | MEDIUM | Valuable for long milestones; keep clear launch success/fallback UX and progress observability via planning artifacts. |
| Cross-runtime contract parity (Claude/OpenCode/Gemini command/workflow behavior alignment) | Teams can run same orchestration model across runtimes without relearning behavior | HIGH | This project's core value; prioritize stable command surface and predictable workflow semantics. |
| Integrated gap-closure feedback loop into parent artifacts (UAT/debug/session closure) | Converts verification findings into structured remediation and closes loop on project memory | MEDIUM | Already partially present in newer repo for decimal phases; convergence should preserve and extend consistency. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| "Zero-confirmation autopilot" that skips all prompts/checkpoints | Feels fast and hands-free | Increases blast radius for bad tool calls, wrong assumptions, and auth/security mistakes | Keep mode-specific automation with explicit checkpoint classes and bounded auto-approve rules. |
| Dynamic runtime rewriting of workflow contracts during execution | Sounds adaptive and self-healing | Breaks determinism, makes runs non-reproducible, and complicates postmortems | Treat workflows as versioned contracts; use deviation logging and gap plans for adaptive behavior. |
| Unlimited autonomous retries on failing tasks | Perceived resiliency | Causes runaway token/cost loops and hidden stalls | Use stuck threshold + circuit breaker + explicit user escalation. |
| Overly broad "execute everything in parallel" policy | Promises speed | Violates dependency ordering and increases merge/conflict failures | Keep wave/dependency graph with configurable parallelization per phase. |

## Feature Dependencies

```
[Deterministic state + resume]
    └──requires──> [Structured artifacts (STATE/ROADMAP/PLAN/SUMMARY)]
                        └──requires──> [Stable naming/contracts for phase/plan files]

[Checkpoint protocol]
    └──requires──> [Task execution engine that can pause/return/continue]
                        └──requires──> [User response capture and continuation wiring]

[Autonomous mode safety rails]
    └──requires──> [Config persistence + validation]
                        └──requires──> [Circuit-breaker/stuck detection in loop controller]

[Wave parallel execution]
    └──requires──> [Dependency metadata (wave index/autonomous flags)]
                        └──requires──> [Result aggregation + spot-check verification]

[Phase verification + gap closure]
    └──requires──> [Requirements traceability in plans]
                        └──requires──> [Verifier output schema + roadmap/state update hooks]

[Segment-aware routing] ──enhances──> [Autonomous execution quality and context efficiency]

[Zero-confirmation autopilot] ──conflicts──> [Checkpoint protocol + safety rails]
```

### Dependency Notes

- **Deterministic state + resume requires structured artifacts:** resume is only reliable when plan/summary/state files are canonical and machine-parseable.
- **Checkpoint protocol requires pause/continue execution engine:** without continuation mechanics, checkpoints become dead ends or force full restarts.
- **Wave parallelism requires explicit dependency metadata:** parallel execution without wave/dependency boundaries is unsafe for plan ordering.
- **Verification + gap closure requires requirement traceability:** verifier outcomes must map back to requirement IDs to avoid false "phase complete" states.
- **Zero-confirmation autopilot conflicts with safety posture:** this milestone is convergence and reliability-focused, so bypass-all-confirmations is counter to project constraints.

## MVP Definition

### Launch With (v1)

Minimum viable product for this convergence milestone.

- [ ] Resume-safe deterministic loop execution across phases/plans - preserves existing project continuity guarantees.
- [ ] Full checkpoint protocol including auth-gate handling - required for real-world unattended automation.
- [ ] Safety-bounded autopilot controls (iteration/time/circuit/stuck) - prevents runaway loops.
- [ ] Verification-gated completion + gap surfacing - keeps "done" aligned with must-have requirements.
- [ ] Atomic commit + summary/state/roadmap updates - provides auditable autonomous execution history.

### Add After Validation (v1.x)

Features to add once core convergence is stable.

- [ ] Segment-aware subagent routing - add after baseline parity is proven in production-like runs.
- [ ] Detached terminal launch UX hardening - add richer monitoring/reporting after stable core loop behavior.
- [ ] Auto-mode checkpoint policies (`human-verify` auto-approve with strict guards) - enable once false-positive risk is measured.

### Future Consideration (v2+)

Features to defer until post-convergence maturity.

- [ ] Multi-agent cross-session teams for milestone-level orchestration - defer until single-session loop reliability is saturated.
- [ ] Organization-level policy packs and governance presets - defer until runtime parity and core behavior freeze.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Deterministic resume loop | HIGH | MEDIUM | P1 |
| Checkpoint protocol + auth gates | HIGH | MEDIUM | P1 |
| Safety rails (budget/timeout/circuit/stuck) | HIGH | MEDIUM | P1 |
| Verification + gap closure integration | HIGH | HIGH | P1 |
| Atomic commit and artifact traceability | HIGH | HIGH | P1 |
| Wave-based parallel execution | MEDIUM | HIGH | P2 |
| Segment-aware routing | MEDIUM | HIGH | P2 |
| Detached terminal autopilot UX | MEDIUM | MEDIUM | P2 |
| Advanced auto-approve checkpoint policies | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A (Claude Code) | Competitor B (Gemini CLI) | Our Approach |
|---------|-----------------------------|---------------------------|--------------|
| Subagent delegation and specialization | Built-in + custom subagents with scoped tools/permissions | Agentic CLI with tools and extensibility, but less workflow-contract centric | Keep role-specialized agents and enforce workflow contracts per phase/plan. |
| Hooks and policy control | Rich lifecycle hooks with allow/deny/ask decisions | Extensible via settings and tooling; less hook granularity in primary docs | Preserve deterministic hook-like gates at workflow level, add targeted runtime hooks where needed. |
| Checkpoint/restore | Session rewind and checkpointing of Claude tool edits | Optional checkpointing with `/restore` and shadow git snapshots | Combine checkpoint semantics with file-based planning artifacts for explicit resume points. |
| Automation/headless usage | CLI + programmatic/agent SDK support | Non-interactive scripting modes with JSON outputs | Keep command/workflow surfaces scriptable while preserving human checkpoints where risk is high. |

## Sources

- Internal project context: `.planning/PROJECT.md` (scope/constraints), `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONVENTIONS.md`.
- Internal workflow baselines: `get-shit-done/workflows/execute-phase.md`, `../get-shit-done-autopilot/get-shit-done/workflows/execute-plan.md`, `../get-shit-done-autopilot/commands/gsd/autopilot.md`. (HIGH)
- Claude Code docs: overview, subagents, hooks, checkpointing (`https://code.claude.com/docs/en/overview.md`, `https://code.claude.com/docs/en/sub-agents.md`, `https://code.claude.com/docs/en/hooks.md`, `https://code.claude.com/docs/en/checkpointing.md`). (HIGH)
- Gemini CLI docs/readme + checkpointing doc (`https://github.com/google-gemini/gemini-cli`, `https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/checkpointing.md`). (MEDIUM-HIGH)
- OpenHands CLI docs (`https://docs.openhands.dev/openhands/usage/run-openhands/cli-mode`). (MEDIUM)
- Aider docs (usage + git integration) (`https://aider.chat/docs/usage.html`, `https://aider.chat/docs/git.html`). (MEDIUM)

---
*Feature research for: CLI autopilot/loop orchestration ecosystem*
*Researched: 2026-02-22*
