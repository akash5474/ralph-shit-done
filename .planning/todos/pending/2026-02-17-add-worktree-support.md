---
created: 2026-02-17T19:48:26.193Z
title: Add worktree support
area: general
files: []
---

## Problem

GSD currently operates in a single working directory. Adding worktree support would allow parallel phase execution across multiple git worktrees, enabling faster milestone completion and isolated environments for concurrent work.

The key architectural question is how to share and persist context across worktrees — the planning state, accumulated decisions, and session memory need to be accessible from any worktree.

## Solution

TBD — needs research into storage/sync approaches:

- **Vector DB** — Could enable semantic search across planning artifacts and session history. Pros: rich querying. Cons: new dependency, operational complexity.
- **Hindsight** — Already familiar tool for memory persistence. Could extend existing memory patterns. Pros: proven pattern. Cons: may not scale to multi-worktree coordination.
- **Shared `.planning/` via symlinks or git worktree shared refs** — Simplest approach using git's native worktree capabilities. Pros: zero dependencies. Cons: potential merge conflicts on state files.
- **Other** — File-based coordination (lock files, event logs), or a lightweight SQLite store.

Research needed before committing to an approach.
