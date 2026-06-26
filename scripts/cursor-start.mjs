// Silent self-healing dev launcher for Cursor's folder-open task.
//
// Purpose: when the miozuki-web folder is opened in Cursor, the local site must
// come up at http://localhost:3000 with zero interaction and nothing technical
// shown. This script is what the hidden "Start Dev Server" task runs.
//
// It guards against the two failure modes that produce a "connection refused"
// at localhost:3000 (the dev server never actually started):
//   1. Stale packages after a code pull -> `next dev` crashes on a missing
//      module. Fix: run an install first. It is idempotent and a ~1-2s no-op
//      when everything is already in sync.
//   2. A stale process still holding port 3000 -> `next dev` quietly moves to
//      3001, so localhost:3000 answers nobody. Fix: free port 3000 first.
//
// Cross-platform (Windows / macOS / Linux) so it behaves the same on Ting's
// machine and Ryo's. Best-effort throughout: if a step fails it still launches
// the dev server rather than leaving nothing running.

import { spawn, spawnSync } from 'node:child_process';
import { platform } from 'node:os';

const isWindows = platform() === 'win32';
const PORT = 3000;

// npm is launched through the shell as a single command string. This resolves
// npm.cmd on Windows automatically and avoids Node's DEP0190 warning (which
// fires when args are passed alongside shell:true). The commands are fixed
// constants, so there is no untrusted input to escape.
function log(message) {
  console.log(`[cursor-start] ${message}`);
}

// 1. Sync dependencies (idempotent; near-instant when already installed).
log('checking dependencies...');
const install = spawnSync('npm install --no-audit --no-fund', {
  stdio: 'inherit',
  shell: true,
});
if (install.status !== 0) {
  log('install step did not complete cleanly; launching anyway.');
}

// 2. Free port 3000 if a stale process is holding it.
freePort(PORT);

// 3. Launch the dev server. Output streams through so the task's background
//    matcher still sees "> next dev" and "Ready in".
log(`starting dev server on http://localhost:${PORT}`);
const dev = spawn('npm run dev', {
  stdio: 'inherit',
  shell: true,
});
dev.on('exit', (code) => process.exit(code ?? 0));

function freePort(port) {
  try {
    if (isWindows) {
      const out = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
      if (out.status !== 0 || !out.stdout) return;
      const pids = new Set();
      for (const line of out.stdout.split('\n')) {
        if (line.includes(`:${port}`) && line.includes('LISTENING')) {
          const pid = line.trim().split(/\s+/).pop();
          if (pid && pid !== '0') pids.add(pid);
        }
      }
      for (const pid of pids) {
        log(`freeing port ${port} (stale process ${pid})`);
        spawnSync('taskkill', ['/PID', pid, '/F'], { stdio: 'ignore' });
      }
    } else {
      const out = spawnSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' });
      if (out.status !== 0 || !out.stdout) return;
      for (const pid of out.stdout.split('\n').map((s) => s.trim()).filter(Boolean)) {
        log(`freeing port ${port} (stale process ${pid})`);
        spawnSync('kill', ['-9', pid], { stdio: 'ignore' });
      }
    }
  } catch {
    // Best-effort: if the port cannot be freed, next dev falls back to 3001.
  }
}
