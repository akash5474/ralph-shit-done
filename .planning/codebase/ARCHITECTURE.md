# Architecture

**Analysis Date:** 2026-02-22

## Pattern Overview

**Overall:** Template-driven CLI orchestration with file-based state and multi-agent execution contracts

**Key Characteristics:**
- Slash-command markdown files in `commands/gsd/*.md` define orchestration intent and delegate procedural logic to workflow files in `get-shit-done/workflows/*.md`.
- Operational mutations of `.planning/` artifacts are centralized in `get-shit-done/bin/gsd-tools.cjs` and `get-shit-done/bin/lib/*.cjs`.
- Runtime installation compiles/copies command, workflow, agent, and hook assets into host runtime config directories through `bin/install.js`.

## Layers

**Distribution and Runtime-Adapter Layer:**
- Purpose: Install GSD assets into Claude/OpenCode/Gemini runtime directories and adapt format/tool metadata per runtime.
- Location: `bin/install.js`, `scripts/build-hooks.js`, `hooks/dist/`
- Contains: installer argument parsing, runtime path resolution, command/agent frontmatter conversion, hook registration and cleanup logic.
- Depends on: source assets in `commands/`, `agents/`, `get-shit-done/`, and hook scripts in `hooks/*.js`.
- Used by: end users invoking `npx get-shit-done-cc` (entry declared in `package.json`).

**Orchestration Contract Layer:**
- Purpose: Define command intents, workflow steps, and agent responsibilities.
- Location: `commands/gsd/*.md`, `get-shit-done/workflows/*.md`, `agents/*.md`
- Contains: orchestrator prompts, workflow state machines, focus-specific agent instructions, and handoff contracts.
- Depends on: CLI utilities in `get-shit-done/bin/gsd-tools.cjs`, templates in `get-shit-done/templates/`, and references in `get-shit-done/references/`.
- Used by: Claude-style runtime command execution and spawned subagents.

**Execution Engine Layer:**
- Purpose: Provide deterministic file/git/phase/config operations consumed by workflows.
- Location: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/*.cjs`
- Contains: command router, JSON output contract, phase/roadmap/state CRUD, verification checks, frontmatter parsing, scaffolding, milestone lifecycle.
- Depends on: Node built-ins (`fs`, `path`, `child_process`) and on-disk `.planning/` artifacts.
- Used by: workflow markdown commands that shell out to `node ~/.claude/get-shit-done/bin/gsd-tools.cjs ...`.

**Hook and Session Feedback Layer:**
- Purpose: Surface session status and context pressure signals during runtime execution.
- Location: `hooks/gsd-statusline.js`, `hooks/gsd-context-monitor.js`, `hooks/gsd-check-update.js`
- Contains: status line rendering, temp-file bridge metrics, PostToolUse warnings, and background npm update checks.
- Depends on: runtime hook registration in runtime `settings.json` (written by `bin/install.js`) and temp/cache files.
- Used by: interactive runtime sessions to keep the user and agent synchronized on context and update state.

## Data Flow

**Install and Materialization Flow:**

1. User runs the package bin (`package.json` -> `bin/install.js`).
2. Installer resolves runtime target directories and converts assets (for example, Claude frontmatter to OpenCode/Gemini variants) in `bin/install.js`.
3. Installer copies command/workflow/template/agent/hook files into runtime folders and writes/patches runtime settings.

**Command Orchestration Flow:**

1. Runtime invokes a command file in `commands/gsd/*.md` (for example `commands/gsd/plan-phase.md`).
2. Command loads workflow instructions from `get-shit-done/workflows/*.md` and orchestrates subagents described in `agents/*.md`.
3. Workflow calls `get-shit-done/bin/gsd-tools.cjs`, which routes to domain modules in `get-shit-done/bin/lib/*.cjs` that read/write `.planning/*` files and git state.

**State Management:**
- Durable workflow state is file-based under `.planning/` (`.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/phases/*`).
- Runtime install/update state is file-based under runtime config dirs via `gsd-file-manifest.json`, `gsd-local-patches/`, and hook cache/temp files managed in `bin/install.js` and `hooks/*.js`.

## Key Abstractions

**Phase Artifact Model:**
- Purpose: Represent execution lifecycle as repeatable PLAN/SUMMARY/VERIFICATION/UAT artifacts.
- Examples: `.planning/phases/*/*-PLAN.md`, `.planning/phases/*/*-SUMMARY.md`, `.planning/phases/*/*-VERIFICATION.md`, `.planning/phases/*/*-UAT.md`
- Pattern: File-based contract progression (planning -> execution -> verification) with frontmatter as machine-readable metadata.

**Init Context Snapshot:**
- Purpose: Provide workflows with precomputed environment/phase/config metadata in one call.
- Examples: `get-shit-done/bin/lib/init.cjs` (`cmdInitPlanPhase`, `cmdInitExecutePhase`, `cmdInitMapCodebase`)
- Pattern: Compound initializer returning stable JSON payloads consumed by markdown workflows.

**Goal-Backward Verification Contract:**
- Purpose: Encode expected truths/artifacts/key links before and after execution.
- Examples: `must_haves` parsing in `get-shit-done/bin/lib/frontmatter.cjs`, verification handlers in `get-shit-done/bin/lib/verify.cjs`, verifier agent contract in `agents/gsd-verifier.md`.
- Pattern: Declarative requirements in frontmatter verified against disk and wiring patterns.

## Entry Points

**Installer Entry Point:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc` and `get-shit-done-cc` bin resolution from `package.json`.
- Responsibilities: runtime selection, file installation/uninstallation, hook registration, settings mutation, runtime-specific command conversion.

**Tools CLI Entry Point:**
- Location: `get-shit-done/bin/gsd-tools.cjs`
- Triggers: workflow shell calls inside `get-shit-done/workflows/*.md`.
- Responsibilities: dispatching state/phase/roadmap/verify/template/frontmatter/milestone operations to lib modules.

**Command Contract Entry Points:**
- Location: `commands/gsd/*.md`
- Triggers: slash commands in supported runtimes.
- Responsibilities: objective declaration, execution context loading, and workflow routing (not heavy mutation).

## Error Handling

**Strategy:** Fail-fast for invalid required inputs, tolerant no-op behavior for optional or absent files, and structured JSON responses for workflow automation.

**Patterns:**
- Core hard failures use `error()` in `get-shit-done/bin/lib/core.cjs` for deterministic non-zero exits and explicit messages.
- File-parsing optionality uses guarded `try/catch` and fallback values in modules such as `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/state.cjs`, and `get-shit-done/bin/lib/init.cjs`.

## Cross-Cutting Concerns

**Logging:** Console-oriented status output in installer/hook scripts (`bin/install.js`, `hooks/*.js`) and structured JSON output helpers in `get-shit-done/bin/lib/core.cjs`.
**Validation:** Plan/frontmatter/consistency health checks in `get-shit-done/bin/lib/verify.cjs` and `get-shit-done/bin/lib/frontmatter.cjs`.
**Authentication:** Runtime auth prerequisites are detected as checkpoint gates in execution contracts (`agents/gsd-executor.md`) and represented as human-action pauses rather than silent failures.

---

*Architecture analysis: 2026-02-22*
