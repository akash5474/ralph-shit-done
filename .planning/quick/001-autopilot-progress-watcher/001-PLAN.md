---
quick: 001-autopilot-progress-watcher
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - bin/lib/progress-watcher.js
  - bin/lib/terminal-launcher.js
autonomous: true

must_haves:
  truths:
    - "User sees live progress updates when autopilot runs"
    - "Progress watcher consumes zero API tokens"
    - "Watcher auto-starts when autopilot launches"
  artifacts:
    - path: "bin/lib/progress-watcher.js"
      provides: "File-watching CLI for live progress display"
      exports: ["watchProgress"]
  key_links:
    - from: "bin/lib/terminal-launcher.js"
      to: "bin/lib/progress-watcher.js"
      via: "spawn detached process"
      pattern: "spawn.*progress-watcher"
---

<objective>
Add a live progress watcher for autopilot mode that displays real-time progress updates without consuming API tokens.

Purpose: Allow users to monitor autopilot execution in a separate terminal window without incurring API costs - pure file watching and display.

Output: A Node.js CLI tool that watches .planning/STATE.md and .planning/ralph.log for changes and displays formatted progress in real-time. Auto-launched when autopilot starts.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@bin/lib/terminal-launcher.js (pattern for Node.js CLI tools)
@bin/lib/display.sh (progress display patterns - ANSI colors, formatting)
@hooks/gsd-statusline.js (pattern for reading files and formatting output)
@bin/ralph.sh (logs to .planning/ralph.log with iteration/status/task/summary)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create progress-watcher.js CLI tool</name>
  <files>bin/lib/progress-watcher.js</files>
  <action>
Create a standalone Node.js CLI tool that:

1. Uses fs.watch() or fs.watchFile() to monitor:
   - .planning/STATE.md (for phase/plan/status/progress bar)
   - .planning/ralph.log (for iteration results)

2. On file change, read and parse:
   - From STATE.md: Current Position section (Phase X of Y, Plan, Status), Progress bar line
   - From ralph.log: Latest iteration entry (Iteration, Status, Task, Duration, Summary)

3. Display formatted output:
   - Clear screen and redraw on each update (use ANSI escape codes)
   - Show header: "GSD Progress Watcher" with timestamp
   - Show current position from STATE.md
   - Show progress bar (parse from STATE.md's Progress: line)
   - Show last 3-5 iterations from ralph.log
   - Color-code status: SUCCESS=green, FAILURE=red, RETRY=yellow

4. Handle graceful shutdown:
   - Trap SIGINT (Ctrl+C)
   - Clean up watchers before exit

Follow patterns from gsd-statusline.js for ANSI colors and file reading.
Use only Node.js built-in modules (fs, path, os) - no external dependencies.

Make executable with #!/usr/bin/env node shebang.
  </action>
  <verify>
    node bin/lib/progress-watcher.js --help shows usage
    node bin/lib/progress-watcher.js runs and displays current state (exits cleanly with Ctrl+C)
  </verify>
  <done>
    Progress watcher displays live STATE.md and ralph.log updates with color-coded output
  </done>
</task>

<task type="auto">
  <name>Task 2: Auto-start watcher from terminal-launcher</name>
  <files>bin/lib/terminal-launcher.js</files>
  <action>
Modify terminal-launcher.js to spawn progress-watcher.js in a SECOND terminal window after launching ralph.sh.

1. Add a new function launchProgressWatcher() that:
   - Uses same terminal detection logic as launchTerminal()
   - Spawns: node "$HOME/.claude/get-shit-done/bin/lib/progress-watcher.js"
   - Sets window title to "GSD Progress" (where supported)
   - Detaches process (subprocess.unref())

2. Modify existing launchTerminal() to:
   - Launch ralph.sh first (existing behavior)
   - Then call launchProgressWatcher() to spawn watcher in second window
   - Return combined result with both PIDs

3. Update console output to inform user:
   - "Launched ralph.sh in new terminal"
   - "Launched progress watcher in second terminal"

Use the same platform-specific launcher patterns (launchWindowsTerminal, launchMacTerminal, etc.) but with the watcher script path instead.
  </action>
  <verify>
    Run terminal-launcher.js directly: node bin/lib/terminal-launcher.js
    Verify TWO terminal windows open: one running ralph.sh, one running progress-watcher.js
  </verify>
  <done>
    Autopilot launch spawns both ralph.sh and progress watcher in separate terminals
  </done>
</task>

<task type="auto">
  <name>Task 3: Add watcher to install.js deployment</name>
  <files>bin/install.js</files>
  <action>
The progress-watcher.js file is already in bin/lib/ which gets copied during install (lines 350-375 copy bin/lib/* to ~/.claude/get-shit-done/bin/lib/).

Verify the existing install logic handles this correctly:
1. Check that bin/lib/* copy includes .js files (line 362-365 shows it copies all files)
2. No changes needed to install.js - the existing logic already copies all files from bin/lib/

This task is verification only - confirm the install path works by checking the code.
  </action>
  <verify>
    Read bin/install.js lines 350-375 and confirm bin/lib/* files are copied
    After local install (npx get-shit-done-cc --local), verify .claude/get-shit-done/bin/lib/progress-watcher.js exists
  </verify>
  <done>
    progress-watcher.js is deployed to user's .claude directory during install
  </done>
</task>

</tasks>

<verification>
1. Fresh install works: npx get-shit-done-cc --global installs progress-watcher.js
2. Manual test: node ~/.claude/get-shit-done/bin/lib/progress-watcher.js displays current state
3. Autopilot test: /gsd:autopilot spawns both ralph.sh and progress watcher windows
4. No API calls: watcher only reads files, never invokes Claude
</verification>

<success_criteria>
- progress-watcher.js exists and runs standalone
- Displays live updates from STATE.md and ralph.log
- Uses zero API tokens (pure file watching)
- Auto-starts when autopilot launches
- Works on Windows (Git Bash), macOS, and Linux
</success_criteria>

<output>
After completion, create `.planning/quick/001-autopilot-progress-watcher/001-SUMMARY.md`
</output>
