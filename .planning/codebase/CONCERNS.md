# Codebase Concerns

**Analysis Date:** 2026-02-22

## Tech Debt

**Monolithic installer and mixed responsibilities:**
- Issue: `bin/install.js` combines CLI parsing, runtime selection, file transforms, hook setup, permission editing, uninstall, and migration logic in one ~1.8k-line script.
- Files: `bin/install.js`
- Impact: small installer changes have high regression risk across Claude/OpenCode/Gemini install paths.
- Fix approach: split `bin/install.js` into focused modules (argument parsing, filesystem copy, hook wiring, runtime adapters) and keep one thin CLI entrypoint.

**Regex-driven parsing instead of structured parsers:**
- Issue: workflow-critical parsing relies on ad-hoc regex/manual parsing for YAML and Markdown instead of robust parsers.
- Files: `get-shit-done/bin/lib/frontmatter.cjs`, `get-shit-done/bin/lib/verify.cjs`, `get-shit-done/bin/lib/roadmap.cjs`, `get-shit-done/bin/lib/state.cjs`
- Impact: valid-but-unexpected formatting can silently break automation (plan extraction, must_haves checks, phase detection).
- Fix approach: replace manual frontmatter/section parsing with a YAML parser plus explicit schema validation for plan and summary documents.

**Runtime mirrors create duplication and drift risk:**
- Issue: repository contains a second runtime-specific tree in `.opencode/` that overlaps functional content with main source trees.
- Files: `.opencode/agents/`, `.opencode/get-shit-done/`, `agents/`, `get-shit-done/`
- Impact: fixes can land in one tree and miss the other, producing inconsistent behavior across runtimes.
- Fix approach: generate `.opencode/` artifacts during build/release from canonical sources and avoid hand-maintaining mirrored content.

## Known Bugs

**Nyquist validation config is dropped before plan workflow:**
- Symptoms: `init plan-phase` omits `nyquist_validation_enabled` even when `workflow.nyquist_validation` is set in config.
- Files: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/init.cjs`, `get-shit-done/workflows/plan-phase.md`
- Trigger: set `workflow.nyquist_validation` in `.planning/config.json`, then run `node get-shit-done/bin/gsd-tools.cjs init plan-phase <phase>`; output does not include the expected field.
- Workaround: Not applicable; behavior requires code fix in config loading (`loadConfig`) to expose `nyquist_validation`.

**Stale hook artifacts can be shipped in npm package:**
- Symptoms: deprecated intel hooks remain in packaged output and can be copied during install.
- Files: `scripts/build-hooks.js`, `hooks/dist/gsd-intel-index.js`, `hooks/dist/gsd-intel-prune.js`, `hooks/dist/gsd-intel-session.js`, `bin/install.js`
- Trigger: run release flow (`prepublishOnly` -> `npm run build:hooks` -> `npm pack`); build copies current hooks but does not clean `hooks/dist/` first.
- Workaround: manually delete stale files in `hooks/dist/` before packing/publishing.

## Security Considerations

**Shell command composition in git helpers:**
- Risk: commands are built as shell strings and executed with `execSync`, increasing injection and quoting fragility compared with spawn-style argument arrays.
- Files: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/init.cjs`
- Current mitigation: partial sanitization/quoting (`targetPath.replace(...)` and manual quote escaping).
- Recommendations: migrate to `spawnSync`/`execFileSync` with argument arrays for git and filesystem detection commands.

**Documentation steers users toward broad execution permissions:**
- Risk: guidance explicitly recommends `claude --dangerously-skip-permissions`, reducing guardrails for automated command execution.
- Files: `README.md`
- Current mitigation: alternative granular permissions are documented in same file.
- Recommendations: make least-privilege mode the default recommendation and move skip-permissions guidance behind stronger warnings.

## Performance Bottlenecks

**Statusline hook does repeated filesystem scans per render:**
- Problem: every statusline render scans and stats todo files, reads JSON, and writes context bridge data.
- Files: `hooks/gsd-statusline.js`
- Cause: synchronous `readdirSync` + `statSync` + `readFileSync` hot path without caching.
- Improvement path: cache latest todo file per session with mtime checks and batch less-frequent bridge writes.

**Session-start update check always hits npm registry:**
- Problem: each session triggers a background `npm view get-shit-done-cc version` call.
- Files: `hooks/gsd-check-update.js`
- Cause: no TTL-based skip logic before spawning the network check.
- Improvement path: read cache timestamp first and skip network check until a configured refresh interval expires.

## Fragile Areas

**Health/consistency verification relies on markdown shape assumptions:**
- Files: `get-shit-done/bin/lib/verify.cjs`, `get-shit-done/bin/lib/roadmap.cjs`, `get-shit-done/bin/lib/frontmatter.cjs`
- Why fragile: workflow logic depends on specific heading formats, plan naming, and frontmatter indentation styles.
- Safe modification: keep canonical templates aligned with parser expectations, then expand parser coverage before allowing format variants.
- Test coverage: parser edge cases around `must_haves.artifacts` and `must_haves.key_links` are not directly tested in `tests/`.

**Silent catch blocks mask operational failures:**
- Files: `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`, `get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/verify.cjs`, `get-shit-done/bin/lib/phase.cjs`
- Why fragile: broad empty catches convert real failures into missing behavior without diagnostics.
- Safe modification: replace blanket catches with structured warnings/debug logs where failure should be observable.
- Test coverage: current tests validate happy-path outputs but do not assert failure telemetry paths.

## Scaling Limits

**Linear scans of planning history at read time:**
- Current capacity: acceptable for small-to-medium `.planning/phases/*` trees.
- Limit: command latency increases as phase and summary files grow because tools repeatedly read directories/files synchronously.
- Scaling path: add cached indexes for phase metadata and incremental updates instead of full rescans in commands like `history-digest`, `validate consistency`, and progress calculations.

## Dependencies at Risk

**Not detected:**
- Risk: no high-risk third-party dependency cluster is evident from `package.json` (minimal dependency surface).
- Impact: Not applicable.
- Migration plan: continue minimizing dependencies; prioritize internal parser hardening over adding new runtime dependencies unless needed for correctness.

## Missing Critical Features

**No CI gate for tests/lint/release artifact checks:**
- Problem: repository automation only contains issue labeling workflow; test and package validation are not enforced in CI.
- Blocks: regressions in parser/install behavior can merge without automated detection.
- Files: `.github/workflows/auto-label-issues.yml`, `package.json`

**No automated packaging sanity check for release artifacts:**
- Problem: publish path includes generated `hooks/dist/*` and command files but lacks automated checks for stale artifacts/backups.
- Blocks: accidental publication of deprecated hooks and backup files.
- Files: `package.json`, `scripts/build-hooks.js`, `commands/gsd/new-project.md.bak`

## Test Coverage Gaps

**Installer and hook runtime paths are untested:**
- What's not tested: install/uninstall behavior, statusline/update hooks, and cross-runtime file placement.
- Files: `bin/install.js`, `hooks/gsd-statusline.js`, `hooks/gsd-check-update.js`, `hooks/gsd-context-monitor.js`
- Risk: platform-specific regressions and release-only failures can pass local unit tests.
- Priority: High

**Verification edge cases for must_haves are untested:**
- What's not tested: `verify artifacts` and `verify key-links` behavior against nested and malformed frontmatter.
- Files: `get-shit-done/bin/lib/verify.cjs`, `get-shit-done/bin/lib/frontmatter.cjs`
- Risk: false positives/negatives in plan verification undermine trust in execution gates.
- Priority: High

**Config loading parity across workflow flags is partially untested:**
- What's not tested: propagation of all `workflow.*` flags from `.planning/config.json` into `init` outputs.
- Files: `get-shit-done/bin/lib/core.cjs`, `get-shit-done/bin/lib/init.cjs`, `tests/init.test.cjs`
- Risk: silently ignored settings lead to behavior drift from documented workflow controls.
- Priority: Medium

---

*Concerns audit: 2026-02-22*
