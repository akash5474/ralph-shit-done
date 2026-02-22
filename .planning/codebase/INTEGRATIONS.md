# External Integrations

**Analysis Date:** 2026-02-22

## APIs & External Services

**Search API:**
- Brave Search API - optional web search enrichment for planning/research commands.
  - SDK/Client: native `fetch` in `get-shit-done/bin/lib/commands.cjs` (`cmdWebsearch`).
  - Auth: `BRAVE_API_KEY` (header `X-Subscription-Token`), with optional key-file fallback at `~/.gsd/brave_api_key` (`get-shit-done/bin/lib/init.cjs`, `get-shit-done/bin/lib/config.cjs`).

**Package Registry:**
- npm Registry - package update detection and version checks.
  - Client: `npm view get-shit-done-cc version` subprocess in `hooks/gsd-check-update.js`.
  - Auth: Not required for read-only version check.

**Source Control Platform:**
- GitHub Actions API - issue auto-labeling automation.
  - SDK/Client: `actions/github-script@v7` in `.github/workflows/auto-label-issues.yml`.
  - Auth: GitHub-provided workflow token (`permissions: issues: write` in `.github/workflows/auto-label-issues.yml`).

## Data Storage

**Databases:**
- Not detected.
  - Connection: Not applicable.
  - Client: Not applicable.

**File Storage:**
- Local filesystem only via Node `fs` in `bin/install.js`, `get-shit-done/bin/lib/*.cjs`, and `hooks/*.js`.

**Caching:**
- Local file cache only (`~/.claude/cache/gsd-update-check.json`) in `hooks/gsd-check-update.js`.

## Authentication & Identity

**Auth Provider:**
- Custom/none (CLI-level configuration and environment-variable based access).
  - Implementation: API key header auth only for Brave API in `get-shit-done/bin/lib/commands.cjs`; no user identity provider integration detected.

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/Bugsnag integrations).

**Logs:**
- Local stdout/stderr logging and silent-fail hook behavior in `hooks/gsd-context-monitor.js`, `hooks/gsd-statusline.js`, and `bin/install.js`.

## CI/CD & Deployment

**Hosting:**
- npm package distribution for local CLI usage (`package.json`, `README.md`).

**CI Pipeline:**
- GitHub Actions workflow exists for issue triage only (`.github/workflows/auto-label-issues.yml`); no build/test/deploy workflow detected.

## Environment Configuration

**Required env vars:**
- `BRAVE_API_KEY` (optional external search integration) in `get-shit-done/bin/lib/commands.cjs`.
- `CLAUDE_CONFIG_DIR`, `GEMINI_CONFIG_DIR`, `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME` (runtime install/config path resolution) in `bin/install.js`.

**Secrets location:**
- Environment variables at runtime.
- Optional local key-file path for Brave Search: `~/.gsd/brave_api_key` (existence checked, contents not read in mapping docs).

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- None detected for webhook-style callbacks.
- One outbound REST call pattern exists to Brave Search (`https://api.search.brave.com/res/v1/web/search`) in `get-shit-done/bin/lib/commands.cjs`.

---

*Integration audit: 2026-02-22*
