#!/usr/bin/env node
// Terminal Launcher - Cross-platform terminal window spawning
// Part of Phase 11: Terminal Launcher
//
// Detects platform, finds available terminal emulator, launches ralph.sh
// in a new window as a detached process for execution isolation.

const { spawn } = require('child_process');
const path = require('path');

// command-exists for checking terminal availability
let commandExistsSync;
try {
  commandExistsSync = require('command-exists').sync;
} catch (e) {
  // Fallback if command-exists not installed
  commandExistsSync = () => false;
}

// Terminal configurations by platform
// Order matters - first available terminal is used
const TERMINAL_CONFIG = {
  win32: [
    { name: 'wt.exe', launcher: launchWindowsTerminal },
    { name: 'cmd.exe', launcher: launchCmd },
    { name: 'powershell.exe', launcher: launchPowerShell },
    { name: 'bash.exe', launcher: launchGitBash }
  ],
  darwin: [
    { name: 'osascript', launcher: launchMacTerminal }
  ],
  linux: [
    { name: 'gnome-terminal', launcher: launchGnomeTerminal },
    { name: 'xterm', launcher: launchXterm },
    { name: 'x-terminal-emulator', launcher: launchXtermEmulator }
  ]
};

function findTerminal(platform) {
  const terminals = TERMINAL_CONFIG[platform] || [];

  for (const terminal of terminals) {
    try {
      if (commandExistsSync(terminal.name)) {
        return terminal;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
}

function launchCmd() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh').replace(/\\/g, '/');

  return spawn('cmd.exe', ['/c', 'start', 'cmd', '/k', `bash "${script}"`], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd,
    shell: false
  });
}

function launchPowerShell() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh').replace(/\\/g, '/');

  return spawn('powershell.exe', [
    '-Command', 'Start-Process', 'powershell',
    '-ArgumentList', `"-NoExit", "-Command", "cd '${cwd.replace(/'/g, "''")}'; bash '${script}'"`
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd,
    shell: false
  });
}

function launchWindowsTerminal() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh').replace(/\\/g, '/');

  return spawn('wt.exe', [
    '--title', 'GSD Ralph',
    'bash', script
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd,
    shell: false
  });
}

function launchGitBash() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh').replace(/\\/g, '/');

  return spawn('cmd.exe', [
    '/c', 'start', '""', 'bash', '--login', '-i', '-c',
    `cd "${cwd.replace(/\\/g, '/')}" && bash "${script}"`
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd,
    shell: false
  });
}

function launchMacTerminal() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh');

  // Escape for AppleScript
  const escapedCwd = cwd.replace(/"/g, '\\"');
  const escapedScript = script.replace(/"/g, '\\"');

  const appleScript = `tell application "Terminal"
    do script "cd \\"${escapedCwd}\\" && \\"${escapedScript}\\""
    activate
end tell`;

  return spawn('osascript', ['-e', appleScript], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd
  });
}

function launchGnomeTerminal() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh');

  return spawn('gnome-terminal', [
    '--window',
    '--title=GSD Ralph',
    '--',
    'bash', '-c', `cd "${cwd}" && "${script}"; exec bash`
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd
  });
}

function launchXterm() {
  const cwd = process.cwd();
  const script = path.join(cwd, 'bin', 'ralph.sh');

  return spawn('xterm', [
    '-hold',
    '-title', 'GSD Ralph',
    '-e', `cd "${cwd}" && "${script}"`
  ], {
    detached: true,
    stdio: 'ignore',
    cwd: cwd
  });
}

function launchXtermEmulator() {
  // x-terminal-emulator is a Debian alternatives symlink
  // Use same approach as xterm
  return launchXterm();
}
