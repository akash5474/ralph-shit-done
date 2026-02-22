# Codebase Structure

**Analysis Date:** 2026-02-22

## Directory Layout

```
ralph-shit-done/
├── bin/                  # Installer executable entrypoint
├── commands/             # Runtime slash-command definitions
├── agents/               # Subagent role contracts
├── get-shit-done/        # Core workflow assets and tools CLI
├── hooks/                # Runtime hook scripts and distributable copies
├── tests/                # Node test suite for gsd-tools behavior
├── docs/                 # User and feature documentation
├── scripts/              # Build scripts (hook packaging)
├── assets/               # Media used by docs/readme
├── .planning/            # Project-local planning/state artifacts
├── package.json          # NPM manifest and scripts
└── opencode.json         # OpenCode MCP configuration
```

## Directory Purposes

**`bin/`:**
- Purpose: Runtime installation and uninstallation entrypoint.
- Contains: Node executable scripts.
- Key files: `bin/install.js`.

**`commands/gsd/`:**
- Purpose: Slash command contracts invoked by runtime.
- Contains: One markdown command file per command.
- Key files: `commands/gsd/plan-phase.md`, `commands/gsd/execute-phase.md`, `commands/gsd/map-codebase.md`.

**`agents/`:**
- Purpose: Specialized prompt contracts for spawned subagents.
- Contains: `gsd-*.md` files declaring responsibilities, tool access, and output structure.
- Key files: `agents/gsd-planner.md`, `agents/gsd-executor.md`, `agents/gsd-codebase-mapper.md`.

**`get-shit-done/`:**
- Purpose: Core reusable system assets copied into runtime config directories.
- Contains: tools CLI, workflow specs, templates, and references.
- Key files: `get-shit-done/bin/gsd-tools.cjs`, `get-shit-done/workflows/plan-phase.md`, `get-shit-done/templates/summary.md`.

**`get-shit-done/bin/lib/`:**
- Purpose: Domain-specific operational modules for `gsd-tools`.
- Contains: `*.cjs` modules split by concern (state, phase, roadmap, verify, template, frontmatter, milestone, init, config).
- Key files: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/phase.cjs`, `get-shit-done/bin/lib/verify.cjs`.

**`hooks/`:**
- Purpose: Runtime session UX and monitoring hooks.
- Contains: hook scripts plus copied distributables in `hooks/dist/`.
- Key files: `hooks/gsd-statusline.js`, `hooks/gsd-context-monitor.js`, `hooks/gsd-check-update.js`.

**`tests/`:**
- Purpose: Regression coverage for tools CLI operations.
- Contains: Node `node:test` suites and shared helper utilities.
- Key files: `tests/helpers.cjs`, `tests/init.test.cjs`, `tests/phase.test.cjs`.

## Key File Locations

**Entry Points:**
- `bin/install.js`: Package bin entry used by `get-shit-done-cc` to install/uninstall assets.
- `get-shit-done/bin/gsd-tools.cjs`: Operational CLI router used by workflows.
- `commands/gsd/*.md`: Runtime-invoked slash command entry contracts.

**Configuration:**
- `package.json`: scripts, bin mapping, package metadata.
- `opencode.json`: OpenCode MCP server registrations.
- `.planning/config.json`: Active project workflow/config defaults for this workspace.

**Core Logic:**
- `get-shit-done/bin/lib/core.cjs`: shared helpers, config loading, git wrappers, phase search.
- `get-shit-done/bin/lib/init.cjs`: compound init payload builders for workflows.
- `get-shit-done/bin/lib/state.cjs`: `.planning/STATE.md` lifecycle updates.
- `get-shit-done/bin/lib/phase.cjs`: phase CRUD/renumber/complete operations.
- `get-shit-done/bin/lib/verify.cjs`: plan/phase/health verification engine.

**Testing:**
- `tests/*.test.cjs`: command-level behavior tests.
- `tests/helpers.cjs`: temp project scaffolding and command runner.

## Naming Conventions

**Files:**
- Command and workflow specs use kebab-case markdown names (example: `commands/gsd/plan-phase.md`, `get-shit-done/workflows/verify-work.md`).
- Agent specs use `gsd-` prefix plus role name (example: `agents/gsd-plan-checker.md`).
- Tools modules use lowercase concern names with `.cjs` extension (example: `get-shit-done/bin/lib/frontmatter.cjs`).

**Directories:**
- Resource directories are lowercase and hyphen-safe where needed (example: `get-shit-done/`, `get-shit-done/templates/codebase/`).
- Command namespaces are grouped by product in subdirectories (example: `commands/gsd/`).

## Where to Add New Code

**New Feature:**
- Primary code: add workflow contract in `get-shit-done/workflows/<feature>.md` and command surface in `commands/gsd/<feature>.md`.
- Tests: add/extend behavior tests in `tests/<domain>.test.cjs` and helper calls through `tests/helpers.cjs`.

**New Component/Module:**
- Implementation: add operations module in `get-shit-done/bin/lib/<domain>.cjs` and route it from `get-shit-done/bin/gsd-tools.cjs`.

**Utilities:**
- Shared helpers: extend `get-shit-done/bin/lib/core.cjs` for cross-module helpers and keep feature logic in dedicated lib modules.

## Special Directories

**`get-shit-done/templates/`:**
- Purpose: Source-of-truth templates used during planning/execution document generation.
- Generated: No.
- Committed: Yes.

**`hooks/dist/`:**
- Purpose: Installable hook copies built by `scripts/build-hooks.js`.
- Generated: Yes.
- Committed: Yes.

**`.planning/`:**
- Purpose: Runtime state, roadmap, requirements, and generated analysis docs.
- Generated: Yes.
- Committed: Project-config dependent (`commit_docs` behavior in `get-shit-done/bin/lib/config.cjs` and `get-shit-done/bin/lib/commands.cjs`).

**`node_modules/`:**
- Purpose: Installed package dependencies.
- Generated: Yes.
- Committed: No.

---

*Structure analysis: 2026-02-22*
