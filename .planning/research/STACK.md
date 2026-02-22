# Stack Research

**Domain:** Reliable agentic CLI orchestration with markdown command/workflow contracts
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH (Context7 unavailable in this environment; recommendations validated against official docs and upstream package metadata)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Node.js | 24 LTS | Primary runtime for CLI and orchestration engine | 2026-safe LTS baseline; modern built-ins (`fetch`, stable test runner improvements, current security support window); avoids maintaining polyfills for legacy Node 16. |
| TypeScript | 5.9.x | Strongly typed workflow/tool contracts and orchestration state models | Best-practice for large multi-step orchestrators: catches contract drift early (especially run-result and planner state schemas) while still compiling to current CJS-compatible output during migration. |
| JSON Schema + Ajv | Ajv 8.18.x | Strict validation of workflow frontmatter, command payloads, and tool IO | Fast compiled validators, supports modern JSON Schema drafts, and provides deterministic schema validation for markdown-driven contracts. |
| unified/remark pipeline | `remark` 15.x + `remark-parse` 11.x | Parse markdown command/workflow files into AST, not ad-hoc text parsing | Robust, plugin-driven AST processing is safer for long-lived contract files than regex parsing; supports frontmatter/GFM extensions when needed. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `commander` | 14.0.3 | CLI argument parsing and subcommand routing | Use for `gsd-tools` command surface cleanup and explicit option validation; keep bin entry thin and delegate logic to modules. |
| `execa` | 9.6.1 | Safe subprocess execution for git/runtime/tool calls | Use instead of ad-hoc `child_process` wrappers when you need better errors, cancellation, and cross-platform behavior. |
| `p-retry` | 7.1.1 | Retry policy with backoff for flaky external actions | Use around network and transient API/tool calls only; do not wrap deterministic local file mutations. |
| `p-limit` | 7.3.0 | Concurrency control for spawned agents/tools | Use to cap parallel worker calls and avoid context-window/resource spikes in autopilot loops. |
| `zod` | 4.3.6 | Dev-friendly runtime schemas + TypeScript inference | Use for internal module boundaries and DTO typing; export JSON Schema to Ajv for persisted/on-disk contract validation. |
| `pino` | 10.3.1 | Structured JSON logging | Use for machine-readable execution logs and later ingestion/tracing correlation; keep CLI pretty output separate from durable logs. |
| `better-sqlite3` | 12.6.2 | Optional durable local state/checkpoint store | Use only if `.planning` file-state and lock discipline become insufficient for autopilot crash recovery/replay. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Node built-in test runner (`node --test`) | Contract/unit tests for core CLI libs | Keep as default: zero external harness overhead, already in repo, strong fit for Node-only package. |
| Vitest | 4.0.18 | Optional richer DX for TypeScript-heavy unit suites | Use only if team needs watch UX/mocking ergonomics beyond Node test runner; requires Node >=20 and Vite >=6. |
| Changesets | 2.x | Safer release/versioning for multi-runtime install package | Use to track semver changes while porting autopilot deltas incrementally; avoids accidental breaking publish. |

## Installation

```bash
# Core
npm install ajv remark remark-parse commander execa p-retry p-limit zod pino

# Optional durability layer (only if moving beyond file-only state)
npm install better-sqlite3

# Dev dependencies
npm install -D typescript @types/node @changesets/cli vitest
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Markdown AST contracts via `remark` | Parser-generator DSLs (e.g., nearley) | Use nearley only if markdown contracts are replaced by a custom formal language; for markdown files, remark is lower friction and better ecosystem fit. |
| In-process orchestrator + file/SQLite durability | Temporal workflows | Use Temporal when you need distributed workers, multi-service durability, and multi-year mission-critical execution at larger scale. |
| Direct CLI orchestrator primitives (`execa`, `p-limit`, `p-retry`) | LangGraph / full agent frameworks | Use LangGraph when graph-native orchestration, HITL primitives, and hosted observability are core product requirements (not just internal CLI automation). |
| Node built-in test runner | Vitest as primary | Make Vitest primary only if browser-like test env or advanced test-project matrix is required. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Node 16 baseline (`>=16.7.0`) | EOL; blocks adoption of current ecosystem packages that require Node >=20 and increases security/compat burden | Move project baseline to Node 24 LTS (or minimum Node 20 during transition). |
| Regex/string-split markdown parsing for contracts | Fragile against frontmatter/GFM edge cases and hard to evolve safely | Parse contracts with `remark` AST + schema validation. |
| `chalk@5` in CJS modules | Chalk v5 is ESM-only; causes friction in current CommonJS-heavy code paths | Keep plain text or use CJS-compatible coloring strategy until ESM migration is complete. |
| `node-sqlite3` for local durability | Async API pattern + weaker ergonomics/perf for this use case | Prefer `better-sqlite3` if SQLite durability is added. |
| Monolithic framework rewrite during delta port | High regression risk and delayed parity with fork capabilities | Incremental port on current architecture, then selectively modernize internal modules. |

## Stack Patterns by Variant

**If priority is fast, low-risk fork delta port (recommended now):**
- Keep runtime shape (CLI + markdown contracts + file-state) and upgrade minimum Node/typing/validation stack.
- Because this preserves behavior compatibility while reducing hidden failure modes.

**If priority shifts to high-concurrency autonomous runs:**
- Add `better-sqlite3` checkpointing + idempotency keys + bounded worker concurrency (`p-limit`) and structured replay logs (`pino`).
- Because file-only state eventually becomes fragile under heavy parallel loop execution.

**If team needs hosted/distributed orchestration later:**
- Evaluate Temporal or LangGraph as an outer orchestration layer, keeping markdown contracts as source-of-truth interface.
- Because current repo already has a strong deterministic contract model worth preserving.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `node@24.x` | `commander@14`, `remark-parse@11`, `ajv@8`, `p-retry@7`, `p-limit@7`, `better-sqlite3@12` | All align with current Node >=20+ ecosystem trend; Node 24 LTS is safest 2026 baseline. |
| `typescript@5.9.x` | `zod@4.3.6` | Zod 4 docs state support tested against TS 5.5+ and recommend `strict` mode. |
| `vitest@4.0.18` | `node>=20`, `vite>=6` | Keep optional unless broader test infrastructure justifies additional toolchain. |
| `chalk@5.6.x` | ESM-only projects | Do not adopt in remaining CommonJS surfaces without migration plan. |

## Sources

- Context7: unavailable in this run (quota blocked) - confidence adjusted accordingly.
- https://nodejs.org/en/about/previous-releases - verified current/LTS release lines (Node 24 active LTS, Node 16 EOL).
- https://nodejs.org/en/learn/getting-started/fetch - verified Node built-in fetch/Undici positioning.
- https://nodejs.org/en/learn/test-runner/using-test-runner - verified built-in test runner capabilities and modern usage.
- https://www.typescriptlang.org/docs/ - verified current TS track (5.9 available, 6.0 beta listed).
- https://zod.dev/ - verified Zod 4 stability and TS 5.5+ requirement.
- https://ajv.js.org/ - verified JSON Schema/JTD support and compiled-validator positioning.
- https://github.com/remarkjs/remark - verified markdown AST/plugin approach and CommonMark/GFM posture.
- https://github.com/sindresorhus/execa - verified process execution features and current release metadata.
- https://github.com/sindresorhus/p-retry - verified retry semantics (`AbortError`, retry controls).
- https://github.com/pinojs/pino - verified low-overhead structured logging posture and current release metadata.
- https://github.com/WiseLibs/better-sqlite3 - verified local SQLite performance model, WAL recommendation, and release currency.
- https://docs.temporal.io/workflows - verified durable workflow model and deterministic workflow constraints.
- https://docs.langchain.com/oss/python/langgraph/overview - verified LangGraph positioning as low-level agent orchestration framework.
- https://modelcontextprotocol.io/specification/2025-06-18 - verified MCP scope and protocol model for tool/context interoperability.
- npm registry metadata (`npm view`) for versions/engines on 2026-02-22:
  - `commander@14.0.3`, `zod@4.3.6`, `execa@9.6.1`, `pino@10.3.1`, `better-sqlite3@12.6.2`, `ajv@8.18.0`, `p-retry@7.1.1`, `p-limit@7.3.0`, `remark-parse@11.0.0`, `gray-matter@4.0.3`, `vitest@4.0.18`, `typescript@5.9.3`, `@openai/agents@0.4.15`.

---
*Stack research for: reliable agentic CLI orchestration with markdown contracts*
*Researched: 2026-02-22*
