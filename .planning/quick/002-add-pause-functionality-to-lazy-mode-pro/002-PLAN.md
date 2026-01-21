---
quick: 002-add-pause-functionality-to-lazy-mode-pro
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - bin/lib/progress-watcher.js
  - bin/ralph.sh
autonomous: true

must_haves:
  truths:
    - "User can press 'p' in progress watcher to pause ralph.sh"
    - "User can press 'r' in progress watcher to resume execution"
    - "Ralph.sh pauses between iterations when pause signal exists"
    - "Progress watcher displays current pause state"
  artifacts:
    - path: "bin/lib/progress-watcher.js"
      provides: "Keyboard input handling for pause/resume/quit"
      exports: ["watchProgress"]
    - path: "bin/ralph.sh"
      provides: "Pause file detection at iteration start"
  key_links:
    - from: "bin/lib/progress-watcher.js"
      to: ".planning/.pause"
      via: "file creation/deletion"
      pattern: "writeFileSync.*\\.pause|unlinkSync.*\\.pause"
    - from: "bin/ralph.sh"
      to: ".planning/.pause"
      via: "file existence check"
      pattern: "test -f.*\\.pause|\\[ -f.*\\.pause"
---

<objective>
Add pause functionality to lazy mode by allowing the progress watcher to send a pause signal that ralph.sh respects.

Purpose: Let users temporarily halt autopilot execution to review progress, make manual changes, or take a break - then resume without losing state.

Output: Modified progress-watcher.js with keyboard input handling (p=pause, r=resume, q=quit) and modified ralph.sh that checks for .planning/.pause file at each iteration.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@bin/lib/progress-watcher.js (existing progress watcher to modify)
@bin/ralph.sh (existing outer loop to modify)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add keyboard input handling to progress-watcher.js</name>
  <files>bin/lib/progress-watcher.js</files>
  <action>
Modify progress-watcher.js to handle keyboard input for pause/resume/quit:

1. Enable raw mode on stdin to capture single keystrokes:
   - process.stdin.setRawMode(true) at start
   - process.stdin.resume()
   - process.stdin.on('data', handler)

2. Handle key events:
   - 'p' or 'P': Create .planning/.pause file (touch)
   - 'r' or 'R': Delete .planning/.pause file (rm)
   - 'q' or 'Q' or Ctrl+C: Clean up and exit

3. Track pause state:
   - Add isPaused variable (check if .planning/.pause exists on startup)
   - Update on key press
   - Display in UI

4. Update displayProgress() function:
   - After the status line, add: "Mode: [PAUSED] or [RUNNING]"
   - Show key hints: "Keys: [p]ause  [r]esume  [q]uit"
   - Use yellow color for PAUSED, green for RUNNING

5. Update cleanup() function:
   - Reset stdin raw mode before exit: process.stdin.setRawMode(false)

IMPORTANT: Pause file path is relative to projectRoot, not cwd.
Example: path.join(projectRoot, '.planning', '.pause')

Do NOT auto-delete .pause file on watcher exit - let user control it.
  </action>
  <verify>
    node bin/lib/progress-watcher.js runs and shows "Keys: [p]ause  [r]esume  [q]uit"
    Press 'p' creates .planning/.pause file
    Press 'r' deletes .planning/.pause file
    Press 'q' exits cleanly
  </verify>
  <done>
    Progress watcher responds to p/r/q keys and manages .planning/.pause file
  </done>
</task>

<task type="auto">
  <name>Task 2: Add pause file detection to ralph.sh</name>
  <files>bin/ralph.sh</files>
  <action>
Modify ralph.sh to check for pause signal at the start of each iteration:

1. Add pause file constant near LOG_FILE:
   PAUSE_FILE="${PAUSE_FILE:-.planning/.pause}"

2. Add check_pause() function after logging functions:
   ```bash
   # check_pause - Wait while pause file exists
   # Returns when pause file is removed or loop is interrupted
   check_pause() {
       if [[ -f "$PAUSE_FILE" ]]; then
           echo -e "${YELLOW}=== PAUSED ===${RESET}"
           echo -e "Pause file detected: $PAUSE_FILE"
           echo -e "Waiting for resume (delete $PAUSE_FILE or press 'r' in progress watcher)..."
           while [[ -f "$PAUSE_FILE" ]]; do
               sleep 2
           done
           echo -e "${GREEN}=== RESUMED ===${RESET}"
       fi
   }
   ```

3. Call check_pause at start of main loop, right after incrementing iteration:
   - Add after line: iteration=$((iteration + 1))
   - Add: check_pause

4. Also check pause at the safe point (end of iteration):
   - Add check_pause call near the check_interrupted call (around line 505)
   - This catches pause requests that arrive during execution

This allows pause to happen:
- Before starting a new iteration (main check)
- After completing an iteration (safe point check)
  </action>
  <verify>
    touch .planning/.pause && ./bin/ralph.sh shows "=== PAUSED ===" message
    rm .planning/.pause causes ralph.sh to continue
    Normal operation works when .pause file doesn't exist
  </verify>
  <done>
    Ralph.sh waits when .planning/.pause exists and continues when removed
  </done>
</task>

</tasks>

<verification>
1. Progress watcher keyboard test: Run watcher, press 'p', verify .planning/.pause created
2. Progress watcher display test: Watcher shows PAUSED/RUNNING mode indicator
3. Ralph.sh pause test: Create .pause file, start ralph.sh, verify it waits
4. Integration test: Start autopilot, press 'p' in watcher, verify ralph pauses between iterations
5. Resume test: Press 'r' in watcher, verify ralph continues
</verification>

<success_criteria>
- progress-watcher.js handles p/r/q keyboard input
- .planning/.pause file controls pause state
- ralph.sh waits when pause file exists
- Mode indicator shows PAUSED or RUNNING in watcher
- Works seamlessly with existing autopilot workflow
</success_criteria>

<output>
After completion, create `.planning/quick/002-add-pause-functionality-to-lazy-mode-pro/002-SUMMARY.md`
</output>
