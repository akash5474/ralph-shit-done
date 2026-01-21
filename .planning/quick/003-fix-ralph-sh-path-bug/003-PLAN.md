---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - bin/lib/terminal-launcher.js
autonomous: true
must_haves:
  truths:
    - "ralph.sh can be found when spawning new terminal via wt.exe"
    - "ralph.sh can be found when spawning new terminal via cmd.exe"
    - "progress-watcher.js can be found when spawning new terminal"
  artifacts:
    - path: "bin/lib/terminal-launcher.js"
      provides: "Cross-platform terminal spawning with correct path resolution"
      contains: "os.homedir()"
  key_links:
    - from: "terminal-launcher.js"
      to: "ralph.sh"
      via: "absolute path constructed with os.homedir() and toGitBashPath()"
      pattern: "path\\.join.*homedir"
---

<objective>
Fix ralph.sh path resolution bug in terminal-launcher.js

Purpose: ralph.sh is not found when terminal-launcher.js spawns a new terminal window because the code uses literal `$HOME` strings instead of resolving absolute paths.

Output: Working terminal spawning that correctly locates ralph.sh and progress-watcher.js on all platforms.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/todos/bug-ralph-path-resolution.md
@bin/lib/terminal-launcher.js
@bin/ralph.sh
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix path resolution in launchTerminal and launchProgressWatcher</name>
  <files>bin/lib/terminal-launcher.js</files>
  <action>
The bug is on lines 389 and 345 where literal `$HOME` strings are used:
- Line 389: `const ralphPath = '$HOME/.claude/get-shit-done/bin/ralph.sh';`
- Line 345: `const watcherPath = '$HOME/.claude/get-shit-done/bin/lib/progress-watcher.js';`

The `$HOME` shell variable is NOT expanded before being passed to terminals, especially on Windows where $HOME may not even exist as an environment variable.

Fix by using Node.js path resolution with os.homedir():

1. In `launchTerminal()` function (around line 378), replace:
   ```javascript
   const ralphPath = '$HOME/.claude/get-shit-done/bin/ralph.sh';
   ```
   with:
   ```javascript
   // Resolve absolute path, then convert to Git Bash format on Windows
   const ralphPathAbs = path.join(os.homedir(), '.claude', 'get-shit-done', 'bin', 'ralph.sh');
   const ralphPath = process.platform === 'win32' ? toGitBashPath(ralphPathAbs) : ralphPathAbs;
   ```

2. In `launchProgressWatcher()` function (around line 334), replace:
   ```javascript
   const watcherPath = '$HOME/.claude/get-shit-done/bin/lib/progress-watcher.js';
   ```
   with:
   ```javascript
   // Resolve absolute path, then convert to Git Bash format on Windows
   const watcherPathAbs = path.join(os.homedir(), '.claude', 'get-shit-done', 'bin', 'lib', 'progress-watcher.js');
   const watcherPath = process.platform === 'win32' ? toGitBashPath(watcherPathAbs) : watcherPathAbs;
   ```

This ensures:
- Absolute paths are resolved at runtime using the actual home directory
- Windows paths are converted to Git Bash format (/c/Users/... instead of C:\Users\...)
- Unix/Mac paths remain as standard absolute paths
  </action>
  <verify>
Run the terminal-launcher.js directly to test:
```bash
cd /c/Users/Jameson/Downloads/get-everything-done/get-shit-done
node bin/lib/terminal-launcher.js
```
A new terminal window should open and ralph.sh should be found (not "ralph.sh not found" error).

Also verify the path conversion logic:
```bash
node -e "const path = require('path'); const os = require('os'); console.log(path.join(os.homedir(), '.claude', 'get-shit-done', 'bin', 'ralph.sh'))"
```
Should output an absolute path like `C:\Users\Jameson\.claude\get-shit-done\bin\ralph.sh`
  </verify>
  <done>
- launchTerminal() uses os.homedir() + path.join() to build absolute path to ralph.sh
- launchProgressWatcher() uses os.homedir() + path.join() to build absolute path to progress-watcher.js
- Windows paths are converted via toGitBashPath() before passing to bash
- Terminal spawning successfully locates ralph.sh without "not found" errors
  </done>
</task>

<task type="auto">
  <name>Task 2: Update showManualInstructions to show resolved path</name>
  <files>bin/lib/terminal-launcher.js</files>
  <action>
The `showManualInstructions()` function (lines 295-327) uses `RALPH_SCRIPT` which is the relative path (`path.join(__dirname, '..', 'ralph.sh')`). This is already a resolved absolute path, which is good.

However, the display on line 308 shows `script` which is `RALPH_SCRIPT` - this is fine and already works correctly.

No changes needed to showManualInstructions() - the existing code correctly shows the absolute path because RALPH_SCRIPT uses path.join with __dirname.

Verify that RALPH_SCRIPT (line 15) resolves correctly - it should already work since it uses `__dirname`.
  </action>
  <verify>
```bash
node -e "const path = require('path'); console.log(path.join('/c/Users/Jameson/Downloads/get-everything-done/get-shit-done/bin/lib', '..', 'ralph.sh'))"
```
Should show the resolved path.
  </verify>
  <done>
- Confirmed showManualInstructions() already uses resolved absolute path via RALPH_SCRIPT
- No code changes needed for this function
  </done>
</task>

</tasks>

<verification>
1. Run terminal-launcher.js test mode:
   ```bash
   node bin/lib/terminal-launcher.js
   ```
   A new terminal should spawn and ralph.sh should execute without "not found" error.

2. Verify the fix conceptually:
   - `os.homedir()` returns actual home directory (e.g., `C:\Users\Jameson`)
   - `path.join()` builds full path (e.g., `C:\Users\Jameson\.claude\get-shit-done\bin\ralph.sh`)
   - `toGitBashPath()` converts to bash format (e.g., `/c/Users/Jameson/.claude/get-shit-done/bin/ralph.sh`)
   - Bash receives a valid absolute path it can execute
</verification>

<success_criteria>
- terminal-launcher.js spawns new terminal without "ralph.sh not found" error
- Path resolution uses os.homedir() instead of literal $HOME string
- Windows paths are converted to Git Bash format
- Works on Windows Terminal (wt.exe), cmd.exe, PowerShell, and Git Bash
</success_criteria>

<output>
After completion, create `.planning/quick/003-fix-ralph-sh-path-bug/003-SUMMARY.md`
</output>
