# Testing Patterns

**Analysis Date:** 2026-02-22

## Test Framework

**Runner:**
- Node.js built-in test runner (`node:test`) via `require('node:test')` in `tests/*.test.cjs`.
- Config: Not detected (`jest.config.*` and `vitest.config.*` are absent; execution is script-driven in `package.json`).

**Assertion Library:**
- Node.js built-in `node:assert` (see `tests/commands.test.cjs`, `tests/phase.test.cjs`, `tests/state.test.cjs`).

**Run Commands:**
```bash
npm test                      # Run all tests (maps to node --test tests/*.test.cjs)
node --test tests/*.test.cjs # Direct runner invocation
Not applicable               # Watch mode command not defined in package.json
```

## Test File Organization

**Location:**
- Keep tests in a dedicated top-level `tests/` directory (separate from implementation in `get-shit-done/bin/lib/`).

**Naming:**
- Use `<domain>.test.cjs` naming per command domain (`tests/roadmap.test.cjs`, `tests/milestone.test.cjs`).
- Keep shared helpers in `tests/helpers.cjs`.

**Structure:**
```
tests/
  helpers.cjs
  commands.test.cjs
  phase.test.cjs
  roadmap.test.cjs
  state.test.cjs
  verify.test.cjs
  init.test.cjs
  milestone.test.cjs
```

## Test Structure

**Suite Organization:**
```typescript
const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('phase next-decimal command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns X.1 when no decimal phases exist', () => {
    const result = runGsdTools('phase next-decimal 06', tmpDir);
    assert.ok(result.success);
  });
});
```

**Patterns:**
- Setup pattern: provision isolated filesystem fixtures in `beforeEach` with `createTempProject()` from `tests/helpers.cjs`.
- Teardown pattern: remove temp directories in `afterEach` via `cleanup(tmpDir)` from `tests/helpers.cjs`.
- Assertion pattern: parse CLI JSON output and assert with `assert.strictEqual`, `assert.deepStrictEqual`, and `assert.ok` (for example `tests/roadmap.test.cjs`, `tests/state.test.cjs`).

## Mocking

**Framework:**
- No dedicated mocking library detected (no Sinon/Jest/Vitest mocks).

**Patterns:**
```typescript
// tests/helpers.cjs
function runGsdTools(args, cwd = process.cwd()) {
  try {
    const result = execSync(`node "${TOOLS_PATH}" ${args}`, { cwd, encoding: 'utf-8' });
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.stdout?.toString().trim() || '', error: err.stderr?.toString().trim() || err.message };
  }
}
```

**What to Mock:**
- Prefer process-level command execution through `runGsdTools(...)` instead of mocking internals; simulate state by writing real files under temp `.planning/` trees.

**What NOT to Mock:**
- Do not mock filesystem in current test style; tests intentionally exercise real `fs` interactions and command routing in `get-shit-done/bin/gsd-tools.cjs`.

## Fixtures and Factories

**Test Data:**
```typescript
const phaseDir = path.join(tmpDir, '.planning', 'phases', '03-api');
fs.mkdirSync(phaseDir, { recursive: true });
fs.writeFileSync(path.join(phaseDir, '03-01-PLAN.md'), `---\nwave: 1\n---\n## Task 1`);
```

**Location:**
- Inline fixtures are created directly inside each test file (`tests/commands.test.cjs`, `tests/phase.test.cjs`, `tests/state.test.cjs`).
- Shared fixture factory helpers live in `tests/helpers.cjs`.

## Coverage

**Requirements:** None enforced (no coverage threshold config or coverage script in `package.json`).

**View Coverage:**
```bash
Not detected: coverage command/tooling (c8/nyc/jest --coverage) is not configured
```

## Test Types

**Unit Tests:**
- Pure helper logic is tested directly when useful (for example `comparePhaseNum` and `normalizePhaseName` imported in `tests/phase.test.cjs`).

**Integration Tests:**
- Primary testing mode: command-level integration through CLI invocation plus filesystem assertions (for example `tests/commands.test.cjs`, `tests/roadmap.test.cjs`, `tests/milestone.test.cjs`).

**E2E Tests:**
- Not used as a separate framework; no Playwright/Cypress/Puppeteer detected.

## Common Patterns

**Async Testing:**
```typescript
// Predominantly synchronous tests; no async/await pattern is standard in current suite
test('example', () => {
  const result = runGsdTools('state-snapshot', tmpDir);
  assert.ok(result.success);
});
```

**Error Testing:**
```typescript
const result = runGsdTools('phase insert 99 Fix Something', tmpDir);
assert.ok(!result.success, 'should fail for missing phase');
assert.ok(result.error.includes('not found'), 'error mentions not found');
```

---

*Testing analysis: 2026-02-22*
