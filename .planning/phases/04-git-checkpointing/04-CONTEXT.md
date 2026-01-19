# Phase 4: Git Checkpointing - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Use atomic git commits as progress checkpoints during autonomous execution. Each successful iteration creates a commit. Progress can be recovered from git history if STATE.md is lost. Partial/failed work is not committed.

</domain>

<decisions>
## Implementation Decisions

### Commit triggers
- Commit only after successful task completion — failed iterations leave no commit
- Include whatever Claude staged during iteration, plus always stage STATE.md
- If no staged changes after success, skip commit and log warning (don't commit empty)

### Message format
- Simple descriptive format: `Ralph checkpoint: 04-01 complete`
- Task ID and title only — no iteration number or duration in subject
- Include body with brief outcome summary of what was accomplished
- Use user's git config for author (normal git behavior)

### Recovery behavior
- Validate STATE.md against git history automatically on every ralph.sh startup
- Keep recovery simple — just find last completed task from most recent checkpoint commit
- If STATE.md and git history conflict, warn user and ask which to trust
- Silent unless conflict — no output when validation passes

### Edge case handling
- Abort with warning if working tree has uncommitted changes at startup
- If git commit fails (hooks, permissions, disk), abort ralph immediately — can't checkpoint = can't continue safely
- If not in a git repo, offer to git init
- If HEAD is detached, continue anyway — commits still work

### Claude's Discretion
- Exact git commands for staging and committing
- How to parse task ID from checkpoint commit messages
- Warning message wording

</decisions>

<specifics>
## Specific Ideas

- Recovery should be simple — just identify last completed task, not full history reconstruction
- "Can't checkpoint = can't continue safely" — commit failure is fatal, not retryable

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-git-checkpointing*
*Context gathered: 2026-01-19*
