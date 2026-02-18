---
phase: 3-include-co-planner-settings-in-the-setti
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - commands/gsd/settings.md
autonomous: true
must_haves:
  truths:
    - "Running /gsd:settings shows co-planner toggle, agent selection, and per-checkpoint override questions"
    - "Co-planner config values are read from and written to .planning/config.json"
    - "Settings confirmation table includes co-planner rows"
  artifacts:
    - path: "commands/gsd/settings.md"
      provides: "Settings command with co-planner support"
      contains: "co_planners"
  key_links:
    - from: "commands/gsd/settings.md"
      to: ".planning/config.json"
      via: "config merge logic"
      pattern: "co_planners"
---

<objective>
Ensure the settings command (`/gsd:settings`) includes co-planner configuration options.

Purpose: The source file `commands/gsd/settings.md` already contains full co-planner UI and config merge logic, but the installed version at `~/.claude/commands/gsd/settings.md` is outdated and missing these sections. This plan verifies the source is correct and reinstalls to propagate.
Output: Updated installed settings.md with co-planner support active.
</objective>

<execution_context>
@/Users/zpyoung/.claude/get-shit-done/workflows/execute-plan.md
@/Users/zpyoung/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@commands/gsd/settings.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify source settings.md has complete co-planner support</name>
  <files>commands/gsd/settings.md</files>
  <action>
Read `commands/gsd/settings.md` and verify it contains ALL of the following co-planner sections. The source file should already have these — this task is a verification pass, not a creation pass.

**Section 2 (Read Current Config):** Must list these co-planner config keys:
- `co_planners.enabled` — co-planner toggle (default: `false`)
- `co_planners.agents` — globally configured agents (default: `[]`)
- `co_planners.checkpoints` — per-checkpoint agent overrides (default: `{}`)

**Section 3 (Present Settings):** Must include these AskUserQuestion entries:
- "Enable external co-planners?" toggle (always shown)
- "Which external agents to use as default?" multi-select with codex/gemini/opencode (shown if co-planners = Yes)
- CLI detection step using `node ~/.claude/get-shit-done/bin/gsd-tools.cjs coplanner detect`
- "Use different agents at specific checkpoints?" toggle (shown if co-planners = Yes)
- Per-checkpoint agent selection for requirements/roadmap/plan/verification (shown if overrides = Yes)

**Section 4 (Update Config):** Must include `co_planners` in the JSON schema with:
- `enabled`, `timeout_ms`, `agents`, `checkpoints` fields
- Co-Planner merge rules (preserve timeout_ms, handle enabled toggle, handle per-checkpoint overrides)

**Section 5 (Confirm Changes):** Must include these rows in the confirmation table:
- `Co-Planners` row showing On/Off
- `Co-Planner Agents` row showing selected agents
- `Checkpoint Overrides` row showing Yes/No with details

**allowed-tools:** Must include `Bash` (needed for CLI detection via gsd-tools.cjs).

**success_criteria:** Must reference up to 15 settings and mention co_planners section.

If any of these are missing, add them to match the expected structure. The source at `commands/gsd/settings.md` in the repo should already have all of this — confirm it does.
  </action>
  <verify>
Run: `grep -c "co_planners" commands/gsd/settings.md` — should return 5+ matches.
Run: `grep "Bash" commands/gsd/settings.md` — should show Bash in allowed-tools.
Run: `grep "coplanner detect" commands/gsd/settings.md` — should find the CLI detection command.
Run: `grep "Co-Planners" commands/gsd/settings.md` — should find confirmation table row.
  </verify>
  <done>Source settings.md contains complete co-planner UI questions, config parsing, config merge logic, confirmation display, Bash in allowed-tools, and updated success criteria referencing 15 settings and co_planners.</done>
</task>

<task type="auto">
  <name>Task 2: Reinstall to propagate settings.md to installed location</name>
  <files>commands/gsd/settings.md</files>
  <action>
Run the installer to propagate the updated source to the installed location:

```bash
node bin/install.js --claude --local
```

This copies `commands/gsd/settings.md` (and all other files) from the repo to `~/.claude/commands/gsd/settings.md`.

After installation, diff the source and installed versions to confirm they match (accounting for any path replacements the installer performs).
  </action>
  <verify>
Run: `diff <(grep "co_planners" commands/gsd/settings.md) <(grep "co_planners" ~/.claude/commands/gsd/settings.md)` — should show no differences for co_planner content.
Run: `grep -c "co_planners" ~/.claude/commands/gsd/settings.md` — should return 5+ matches (same as source).
Run: `grep "Bash" ~/.claude/commands/gsd/settings.md` — should show Bash in allowed-tools of installed version.
  </verify>
  <done>Installed settings.md at ~/.claude/commands/gsd/settings.md contains identical co-planner support as the source. Running /gsd:settings will now present co-planner configuration options.</done>
</task>

</tasks>

<verification>
1. Source `commands/gsd/settings.md` has all co-planner sections (UI, config parse, config merge, confirmation display)
2. Installed `~/.claude/commands/gsd/settings.md` matches source for co-planner content
3. `Bash` is in allowed-tools of both source and installed versions
4. CLI detection command (`coplanner detect`) is present in both versions
</verification>

<success_criteria>
- Source settings.md verified to contain complete co-planner support
- Installed settings.md updated via reinstall
- Both versions contain matching co-planner content
- /gsd:settings will now present co-planner toggle, agent selection, per-checkpoint overrides, and updated confirmation table
</success_criteria>

<output>
After completion, create `.planning/quick/3-include-co-planner-settings-in-the-setti/3-SUMMARY.md`
</output>
