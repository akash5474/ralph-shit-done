# Coding Conventions

**Analysis Date:** 2026-02-22

## Naming Patterns

**Files:**
- Use lowercase CommonJS filenames with `.cjs` for CLI libraries in `get-shit-done/bin/lib/*.cjs` (for example `get-shit-done/bin/lib/state.cjs`, `get-shit-done/bin/lib/frontmatter.cjs`).
- Use `.test.cjs` suffix for test files in `tests/*.test.cjs` (for example `tests/phase.test.cjs`, `tests/commands.test.cjs`).
- Use descriptive kebab-case for top-level scripts in `bin/` and `scripts/` (for example `bin/install.js`, `scripts/build-hooks.js`).

**Functions:**
- Use `cmd`-prefixed camelCase names for command handlers exported from library modules (for example `cmdStateLoad` in `get-shit-done/bin/lib/state.cjs`, `cmdVerifySummary` in `get-shit-done/bin/lib/verify.cjs`).
- Use lower camelCase for internal helpers (for example `normalizePhaseName` in `get-shit-done/bin/lib/core.cjs`, `extractFrontmatter` in `get-shit-done/bin/lib/frontmatter.cjs`).

**Variables:**
- Use `camelCase` for locals and object keys (for example `phaseInfo`, `checkCount`, `incompletePlans` in `get-shit-done/bin/lib/*.cjs`).
- Use `UPPER_SNAKE_CASE` for true constants (for example `MODEL_PROFILES` in `get-shit-done/bin/lib/core.cjs`, `TOOLS_PATH` in `tests/helpers.cjs`, `HOOKS_TO_COPY` in `scripts/build-hooks.js`).

**Types:**
- Not applicable: repository code is JavaScript CommonJS (`.cjs`/`.js`) and does not define TypeScript types.

## Code Style

**Formatting:**
- Tool used: Not detected (no `.prettierrc*`, `prettier.config.*`, or Biome config present in repository root).
- Apply existing style manually: 2-space indentation, semicolons, single quotes, and trailing commas in multiline arrays/objects (see `get-shit-done/bin/lib/commands.cjs` and `get-shit-done/bin/lib/init.cjs`).

**Linting:**
- Tool used: Not detected (no `.eslintrc*` or `eslint.config.*` present in repository root).
- Follow in-file patterns and keep changes consistent with existing modules instead of introducing new lint styles.

## Import Organization

**Order:**
1. Node built-ins first (`fs`, `path`, `child_process`) as in `get-shit-done/bin/lib/verify.cjs`.
2. Internal local modules second (`./core.cjs`, `./frontmatter.cjs`) as in `get-shit-done/bin/lib/phase.cjs`.
3. External npm packages last or omitted; current runtime modules are mostly built-ins (see `get-shit-done/bin/lib/*.cjs`).

**Path Aliases:**
- Not detected; use relative imports (`./...`) within `get-shit-done/bin/lib/` and direct relative requires in tests (`tests/helpers.cjs`).

## Error Handling

**Patterns:**
- Use centralized hard-fail for invalid CLI inputs via `error(message)` from `get-shit-done/bin/lib/core.cjs`.
- Use graceful JSON error outputs for expected runtime states (for example missing files in `cmdSummaryExtract` in `get-shit-done/bin/lib/commands.cjs`).
- Use defensive `try { ... } catch {}` around optional filesystem reads and continue with defaults (common across `get-shit-done/bin/lib/state.cjs`, `get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/verify.cjs`).

## Logging

**Framework:** console (`process.stdout.write`, `process.stderr.write`, `console.log`, `console.warn`).

**Patterns:**
- Prefer structured command output via `output(result, raw, rawValue)` in `get-shit-done/bin/lib/core.cjs`.
- Use direct `console.log` only for installer UX in `bin/install.js` and build progress in `scripts/build-hooks.js`.

## Comments

**When to Comment:**
- Keep short module headers and section separators for large command files (see `get-shit-done/bin/gsd-tools.cjs` and `get-shit-done/bin/lib/phase.cjs`).
- Add focused comments for non-obvious parsing, regex, or migration logic (see `parseJsonc` in `bin/install.js`, `extractFrontmatter` in `get-shit-done/bin/lib/frontmatter.cjs`).

**JSDoc/TSDoc:**
- Use JSDoc selectively for reusable utility functions in larger scripts (extensive in `bin/install.js`).
- Avoid mandatory JSDoc for every command handler; most `cmd*` functions rely on descriptive names in `get-shit-done/bin/lib/*.cjs`.

## Function Design

**Size:**
- Keep single-purpose command handlers small to medium where possible (`cmdCurrentTimestamp` in `get-shit-done/bin/lib/commands.cjs`).
- Allow large orchestrator functions when needed, but segment by clear sections (`main()` in `get-shit-done/bin/gsd-tools.cjs`, `install()` in `bin/install.js`).

**Parameters:**
- Pass `(cwd, ...options, raw)` to command handlers for consistent path resolution and output mode (pattern across `get-shit-done/bin/lib/*.cjs`).
- Pass options as objects for multi-flag commands (for example `cmdStateRecordMetric(cwd, options, raw)` in `get-shit-done/bin/lib/state.cjs`).

**Return Values:**
- Use `output(...)`/`error(...)` side effects instead of returning values from command handlers (see all exports in `get-shit-done/bin/lib/commands.cjs`).
- Internal helpers return plain values (`findPhaseInternal`, `generateSlugInternal`) in `get-shit-done/bin/lib/core.cjs`.

## Module Design

**Exports:**
- Export explicit object maps via `module.exports = { ... }` at file end (consistent in `get-shit-done/bin/lib/state.cjs`, `get-shit-done/bin/lib/verify.cjs`, `tests/helpers.cjs`).
- Keep each library module grouped by domain (`state`, `phase`, `roadmap`, `verify`) under `get-shit-done/bin/lib/`.

**Barrel Files:**
- Not used. Import modules directly from explicit file paths (for example `require('./lib/phase.cjs')` in `get-shit-done/bin/gsd-tools.cjs`).

---

*Convention analysis: 2026-02-22*
