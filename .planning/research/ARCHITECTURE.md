# Architecture Research

**Domain:** CLI workflow orchestration engine convergence (baseline + fork deltas)
**Researched:** 2026-02-22
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```text
┌──────────────────────────────────────────────────────────────────────┐
│                    Contract and Command Layer                        │
├──────────────────────────────────────────────────────────────────────┤
│  /gsd:* commands   workflow .md contracts   runtime adapters         │
│       │                   │                      │                    │
├───────┴───────────────────┴──────────────────────┴────────────────────┤
│                   Workflow Engine Facade Layer                        │
├──────────────────────────────────────────────────────────────────────┤
│  Canonical transition reducer  +  compatibility adapter (legacy/fork)│
│  (single writer, single transition authority)                         │
├──────────────────────────────────────────────────────────────────────┤
│                 Artifact Transaction and State Layer                  │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │ .planning state │  │ phase artifacts│  │ transition journal    │   │
│  │ (STATE/ROADMAP) │  │ PLAN/SUMMARY   │  │ (append-only log)     │   │
│  └─────────────────┘  └────────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Command contracts | Stable slash-command UX and workflow entrypoints | Existing `commands/gsd/*.md` + `workflows/*.md` with no breaking command renames |
| Engine facade | Normalize all transitions through one deterministic API | `get-shit-done/bin/lib/engine/` module called by workflows and tools router |
| Compatibility adapter | Translate Ralph/autopilot semantics to canonical transitions | Adapter map: fork events -> canonical events + payload transforms |
| Transition reducer | Validate legal state move and compute next state | Pure function `(state, event) => nextState` with explicit transition table |
| Artifact transaction writer | Apply multi-file updates atomically and recoverably | Temp file + flush/fsync + same-dir rename + commit marker manifest |
| Transition journal | For replay, debugging, and migration confidence | Append-only JSONL/Markdown log in `.planning/.journal/` |

## Recommended Project Structure

```text
get-shit-done/
├── bin/
│   ├── gsd-tools.cjs                  # CLI router (kept as stable entrypoint)
│   └── lib/
│       ├── engine/                    # New canonical workflow engine boundary
│       │   ├── reducer.cjs            # Deterministic transition reducer
│       │   ├── transition-table.cjs   # Legal state transitions
│       │   ├── adapter-legacy.cjs     # Baseline compatibility mapping
│       │   ├── adapter-autopilot.cjs  # Fork delta compatibility mapping
│       │   └── migrate.cjs            # State/artifact migration helpers
│       ├── io/
│       │   ├── atomic-write.cjs       # Temp-write + flush + rename primitives
│       │   └── journal.cjs            # Append/replay transition log
│       └── [existing modules].cjs     # phase/state/verify stay callable
└── workflows/
    └── *.md                           # Continue as orchestration contracts
```

### Structure Rationale

- **`lib/engine/`:** isolates transition truth from command prose and prevents split-brain logic during fork convergence.
- **`lib/io/`:** centralizes durability semantics so every artifact write uses the same atomic guarantees.

## Architectural Patterns

### Pattern 1: Facade + Strangler Adapter for Fork Convergence

**What:** keep existing command/workflow contracts, but route transition operations through a facade that can call baseline or fork adapters behind one API.
**When to use:** integrating forked engines into a live baseline where command compatibility is non-negotiable.
**Trade-offs:** adds transitional code and mapping tables, but sharply reduces destabilization risk and allows incremental cutover.

**Example:**
```typescript
type CanonicalEvent = { type: 'PLAN_STARTED' | 'PLAN_COMPLETED'; phase: string; plan?: string };

function applyEvent(state: State, event: CanonicalEvent): State {
  assertTransitionAllowed(state.status, event.type);
  return reducer(state, event);
}

function fromAutopilotEvent(evt: AutopilotEvent): CanonicalEvent {
  return autopilotAdapterMap(evt); // fork-specific shape -> canonical shape
}
```

### Pattern 2: Deterministic Transition Reducer (Pure Core, Side-Effect Shell)

**What:** encode legal state transitions in a pure reducer; perform file I/O only after state transition is accepted.
**When to use:** state models where reproducibility and replay matter more than implementation convenience.
**Trade-offs:** upfront modeling effort; pays off with easier tests and lower regression risk.

**Example:**
```typescript
const allowed = {
  READY_TO_PLAN: ['PLAN_STARTED'],
  READY_TO_EXECUTE: ['PLAN_COMPLETED', 'PHASE_COMPLETED'],
};

function transition(state: State, event: Event): State {
  if (!allowed[state.status]?.includes(event.type)) throw new Error('invalid transition');
  return reduce(state, event); // no fs, no git calls
}
```

### Pattern 3: Atomic Multi-Artifact Commit with Journal

**What:** write all changed artifacts to temp files, flush, rename into place, then record commit marker in a transition journal.
**When to use:** operations touching multiple files (`STATE.md`, `ROADMAP.md`, phase artifacts) that must never partially apply.
**Trade-offs:** slightly more code and disk operations; prevents torn writes and supports crash recovery.

**Example:**
```typescript
function commitArtifacts(txnId: string, writes: Array<{ path: string; content: string }>) {
  journal.append({ txnId, stage: 'prepare', writes: writes.map(w => w.path) });
  for (const w of writes) atomicWrite(w.path, w.content); // temp + fsync + rename
  journal.append({ txnId, stage: 'commit' });
}
```

## Data Flow

### Request Flow

```text
[User command /gsd:*]
    ↓
[Workflow markdown] → [Engine facade] → [Transition reducer] → [Artifact transaction writer]
    ↓                       ↓                     ↓                        ↓
[Response JSON] ← [Compatibility adapter] ← [Validated transition] ← [.planning artifacts + journal]
```

### State Management

```text
[Canonical state model]
    ↓ (event)
[Reducer] → [next state] → [atomic writer] → [STATE.md/ROADMAP.md/artifacts]
    ↑                                              ↓
 [replay from journal] ←──────── [transition journal append]
```

### Key Data Flows

1. **Transition execution:** command event -> adapter normalization -> reducer -> atomic artifact transaction -> success response.
2. **Recovery/replay:** on startup or failure, read journal tail, detect incomplete transaction, rollback/reapply deterministically.
3. **Compatibility routing:** legacy/fork workflow signal -> mapped canonical event -> same reducer path (no bypass writes).

## Compatibility Strategy

- Declare a **public engine API** at the facade boundary and version it semantically (MAJOR for breaking transition/event contract changes).
- Keep slash commands and workflow filenames stable; only remap internals behind adapters.
- Maintain a compatibility matrix: `command -> workflow -> adapter -> canonical event(s)` and test both baseline + autopilot paths.
- Add contract tests that replay representative baseline and fork event traces and assert identical canonical state outcomes.

## Migration Strategy

1. **Introduce passive facade:** add engine facade in shadow mode, still using current write path as source of truth.
2. **Dual-run verification:** run facade reducer in parallel, compare predicted vs actual state/artifacts, log divergences.
3. **Single-writer cutover:** switch all transition writes to atomic writer via facade; keep old path read-only for fallback.
4. **Adapter expansion:** incrementally port Ralph loop/autopilot semantics into adapter tables with fixture-based regression tests.
5. **Legacy path retirement:** remove direct writers once divergence stays at zero across milestone acceptance scenarios.

## Suggested Build Order

1. **Transition table + reducer tests first** (locks deterministic state behavior before migration).
2. **Atomic writer + journal primitives** (durability foundation before enabling new paths).
3. **Engine facade integration in `gsd-tools`** (single entrypoint for all transition mutations).
4. **Legacy adapter** (baseline parity through facade).
5. **Autopilot/Ralph adapter** (port deltas under compatibility tests).
6. **Dual-run diff harness + cutover flag** (safe rollout and rollback).
7. **Clean up old direct writers** (only after stability window).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 projects | Single-process file engine is sufficient; prioritize correctness and replay tooling. |
| 100-5k projects | Add cached phase indexes and batched reads; keep reducer pure and stateless. |
| 5k+ projects | Introduce append-only event store abstraction and optional async projection rebuilds. |

### Scaling Priorities

1. **First bottleneck:** repeated full-tree scans of `.planning/phases`; fix with incremental indexes keyed by mtime.
2. **Second bottleneck:** synchronous hook/status reads on every render; cache session-level snapshots with TTL.

## Anti-Patterns

### Anti-Pattern 1: Dual Write Authorities

**What people do:** let workflows and multiple lib modules write `.planning/*` directly.
**Why it's wrong:** creates race conditions and non-deterministic state when fork logic diverges.
**Do this instead:** enforce one mutation boundary (engine facade + atomic writer).

### Anti-Pattern 2: Transition-by-Regex Only

**What people do:** infer state transitions from markdown text shape without explicit transition model.
**Why it's wrong:** fragile parsing changes can silently alter workflow behavior.
**Do this instead:** explicit transition table + schema validation + parser hardening before format flexibility.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Git CLI | Side-effect boundary after successful artifact transaction | Keep spawn/exec calls out of reducer; migrate to arg-array process APIs where possible. |
| Runtime hosts (Claude/OpenCode/Gemini) | Contract-level integration via stable command/workflow assets | Avoid runtime-specific state logic; keep adapters in install/transform layer only. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| workflow contracts ↔ engine facade | direct function/CLI API | Contracts remain stable; behavior evolves behind facade. |
| engine facade ↔ reducer | in-process pure calls | No fs/git side effects in reducer. |
| facade ↔ atomic writer/journal | direct API | Writer is the only component allowed to mutate planning artifacts. |

## Sources

- Existing repo architecture and concerns: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md` (HIGH)
- Node.js FS docs (`fsPromises.writeFile` flush option, write safety notes, `rename`, `fsync`): https://nodejs.org/api/fs.html (HIGH)
- Martin Fowler on Strangler Fig and transitional architecture (updated 2024-08-22): https://martinfowler.com/bliki/StranglerFigApplication.html (MEDIUM)
- Semantic Versioning 2.0.0 public API compatibility rules: https://semver.org/ (HIGH)
- XState docs on deterministic machine transitions and pure transition APIs: https://stately.ai/docs/machines (MEDIUM)

---
*Architecture research for: Ralph Loop + Autopilot Port*
*Researched: 2026-02-22*
