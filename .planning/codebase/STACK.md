# Technology Stack

**Analysis Date:** 2026-02-22

## Languages

**Primary:**
- JavaScript (CommonJS) - CLI/runtime logic in `bin/install.js`, `get-shit-done/bin/gsd-tools.cjs`, and `get-shit-done/bin/lib/*.cjs`.
- Markdown - Command, workflow, and template definitions in `commands/gsd/*.md`, `get-shit-done/workflows/*.md`, and `get-shit-done/templates/**/*.md`.

**Secondary:**
- YAML - GitHub workflow automation in `.github/workflows/auto-label-issues.yml`.
- JSON - Package/config manifests in `package.json`, `package-lock.json`, `get-shit-done/templates/config.json`, and `.opencode/package.json`.

## Runtime

**Environment:**
- Node.js >=16.7.0 (declared in `package.json`).
- Uses Node built-ins (`fs`, `path`, `os`, `child_process`) across `get-shit-done/bin/lib/*.cjs` and hooks in `hooks/*.js`.

**Package Manager:**
- npm (primary): publish/install/test flow defined in `package.json` and locked with `package-lock.json` (lockfile v3).
- bun (runtime-specific OpenCode plugin workspace): lockfile present in `.opencode/bun.lock`.
- Lockfile: present (`package-lock.json`, `.opencode/bun.lock`).

## Frameworks

**Core:**
- Not detected (no web/app framework; this is a Node CLI plus markdown command system).

**Testing:**
- Node.js built-in test runner via `node --test tests/*.test.cjs` in `package.json`.

**Build/Dev:**
- esbuild `^0.24.0` (resolved to `0.24.2` in `package-lock.json`) for hook build tooling (`scripts/build-hooks.js`, `package.json` `build:hooks`).

## Key Dependencies

**Critical:**
- `esbuild` - required for the hook build/publish path before release (`package.json` `prepublishOnly`, `scripts/build-hooks.js`).

**Infrastructure:**
- `@opencode-ai/plugin` (`.opencode/package.json`) - OpenCode runtime plugin dependency for local runtime integration.
- Node built-in `fetch` - used for Brave Search API calls in `get-shit-done/bin/lib/commands.cjs`.

## Configuration

**Environment:**
- Project runtime and workflow config is file-based in `.planning/config.json` (created/managed via `get-shit-done/bin/lib/config.cjs`).
- Runtime location/config resolution uses environment variables in `bin/install.js`: `CLAUDE_CONFIG_DIR`, `GEMINI_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`.
- Optional Brave Search key is resolved from `BRAVE_API_KEY` (and filesystem fallback `~/.gsd/brave_api_key`) in `get-shit-done/bin/lib/commands.cjs`, `get-shit-done/bin/lib/init.cjs`, and `get-shit-done/bin/lib/config.cjs`.

**Build:**
- Build/publish behavior is driven by `package.json` scripts and `scripts/build-hooks.js`.
- Hook runtime artifacts are copied into `hooks/dist/` by `scripts/build-hooks.js`.

## Platform Requirements

**Development:**
- Node.js >=16.7.0 and npm (from `package.json`).
- Git CLI expected at runtime for workflow operations (`get-shit-done/bin/lib/core.cjs` uses `git` subprocess calls).

**Production:**
- Distributed as an npm package (`get-shit-done-cc`) and executed locally via `npx` (`README.md` usage).
- Installs into Claude/OpenCode/Gemini config directories via `bin/install.js`; no server deployment target detected.

---

*Stack analysis: 2026-02-22*
