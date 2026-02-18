---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - get-shit-done/workflows/discuss-phase.md
autonomous: true
must_haves:
  truths:
    - "Recommendation rationale is visible while user is selecting an answer"
    - "Rationale text appears in option description, not as pre-question output"
    - "Recommended option is still placed first with (Recommended) suffix in label"
  artifacts:
    - path: "get-shit-done/workflows/discuss-phase.md"
      provides: "discuss_areas step with inline option descriptions"
      contains: "description"
  key_links:
    - from: "discuss-phase.md discuss_areas step"
      to: "AskUserQuestion option descriptions"
      via: "recommendation rationale in description field"
      pattern: "description.*reason|rationale"
---

<objective>
Fix the discuss-phase workflow so recommendation rationale is visible while the user is selecting an answer, not hidden as text output before the question UI appears.

Purpose: Currently the rationale text ("I'd recommend X -- reason") is output before AskUserQuestion, so it scrolls away when the question UI renders. Moving the rationale into the option `description` field keeps it visible during selection.

Output: Updated `get-shit-done/workflows/discuss-phase.md` with corrected instructions.
</objective>

<execution_context>
@/Users/zpyoung/.claude/get-shit-done/workflows/execute-plan.md
@/Users/zpyoung/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@get-shit-done/workflows/discuss-phase.md
@get-shit-done/workflows/new-project.md (reference for option description pattern)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move recommendation rationale into AskUserQuestion option descriptions</name>
  <files>get-shit-done/workflows/discuss-phase.md</files>
  <action>
In `get-shit-done/workflows/discuss-phase.md`, replace lines 295-306 in the `discuss_areas` step.

Current (broken) pattern:
```
3. **Ask questions** via AskUserQuestion:
   - header: "[Area]"
   - question: Specific decision
   - **Before each question:** Analyze the options, form a recommendation, and show rationale:
     ```
     I'd recommend [option] — [brief reason based on phase context].
     ```
   - header: "[Area]"
   - question: Specific decision
   - options: 2-3 concrete choices. Place recommended option FIRST with "(Recommended)" suffix in label.
   - AskUserQuestion adds "Other" automatically
   - NEVER include "You decide", "Claude decides", "Let Claude choose", or any delegation option
```

Replace with this corrected pattern:
```
3. **Ask questions** via AskUserQuestion:
   - header: "[Area]"
   - question: Specific decision
   - options: 2-3 concrete choices as `{ label, description }` objects:
     - Place recommended option FIRST with "(Recommended)" suffix in label
     - Put the recommendation rationale in the recommended option's `description` (e.g., "Best for this phase because [reason]")
     - Give non-recommended options a brief `description` explaining their tradeoff
   - AskUserQuestion adds "Other" automatically
   - NEVER include "You decide", "Claude decides", "Let Claude choose", or any delegation option
   - Do NOT output recommendation text before the question — rationale must be IN the option descriptions so it remains visible while the user is selecting
```

Also remove the duplicate `- header:` and `- question:` lines (lines 296-297 are duplicated at 302-303 in the current version). The corrected version should have header and question listed once each.

Follow the existing `{ label: "...", description: "..." }` pattern already used in `get-shit-done/workflows/new-project.md` (lines 97-99) for consistency.
  </action>
  <verify>
Read the modified file and confirm:
1. No "Before each question" instruction remains
2. The word "description" appears in the options instruction for discuss_areas step
3. "(Recommended)" suffix pattern is preserved
4. "Do NOT output recommendation text before the question" anti-pattern warning is present
5. header and question are not duplicated
  </verify>
  <done>
The discuss_areas step instructs Claude to put recommendation rationale in the AskUserQuestion option description field, not as pre-question text output. The rationale will be visible while the user is actively selecting an answer.
  </done>
</task>

</tasks>

<verification>
- Read `get-shit-done/workflows/discuss-phase.md` and confirm the `discuss_areas` step (around line 295) no longer instructs "Before each question" text output
- Confirm option instructions reference `{ label, description }` objects with rationale in `description`
- Confirm no other references to pre-question rationale output exist in the file
</verification>

<success_criteria>
- discuss-phase.md `discuss_areas` step instructs placing rationale in option descriptions
- No instruction to output rationale text before AskUserQuestion call
- Pattern matches existing `{ label, description }` convention from new-project.md
</success_criteria>

<output>
After completion, create `.planning/quick/1-fix-discuss-phase-option-explanation-vis/1-SUMMARY.md`
</output>
