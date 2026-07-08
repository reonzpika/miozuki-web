// Silent self-healing dev launcher for Cursor's folder-open task.
//
// Purpose: when the miozuki-web folder is opened in Cursor, the local site must
// come up at http://127.0.0.1:3000 with zero interaction and nothing technical
// shown. This script is what the hidden "Start Dev Server" task runs.
//
// It guards against the two failure modes that produce a "connection refused"
// at 127.0.0.1:3000 (the dev server never actually started):
//   1. Stale packages after a code pull -> `next dev` crashes on a missing
//      module. Fix: run an install first. It is idempotent and a ~1-2s no-op
//      when everything is already in sync.
//   2. A stale process still holding port 3000 -> `next dev` quietly moves to
//      3001, so 127.0.0.1:3000 answers nobody. Fix: free port 3000 first.
//
// Cross-platform (Windows / macOS / Linux) so it behaves the same on Ting's
// machine and Ryo's. Best-effort throughout: if a step fails it still launches
// the dev server rather than leaving nothing running.

import http from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { platform } from 'node:os';

const isWindows = platform() === 'win32';
const HOST = '127.0.0.1';
const PORT = 3000;
const HEALTH_PATH = '/pages/bespoke-order';
const HEALTH_TIMEOUT_MS = 90_000;
const HEALTH_RETRY_MS = 2_000;
const DEV_COMMAND = `npm run dev -- --hostname ${HOST} --port ${PORT}`;

// npm is launched through the shell as a single command string. This resolves
// npm.cmd on Windows automatically and avoids Node's DEP0190 warning (which
// fires when args are passed alongside shell:true). The commands are fixed
// constants, so there is no untrusted input to escape.
function log(message) {
  console.log(`[cursor-start] ${message}`);
}

// 1. Ensure dependencies exist. Avoid running install on every Cursor open:
// it is slow, and newer npm versions can rewrite package-lock.json.
if (existsSync('node_modules')) {
  log('dependencies present.');
} else {
  runInstall('dependencies missing; installing from package lock...');
}

// 2. Free port 3000 if a stale process is holding it.
freePort(PORT);

// 3. Launch the dev server. Output streams through so the task's background
//    matcher still sees "> next dev" and "Ready in".
let didRepairDependencies = false;
let didRepairPort = false;
let didStartHealthCheck = false;
let sawAddressInUse = false;
launchDev();

function launchDev() {
  didStartHealthCheck = false;
  sawAddressInUse = false;
  log(`starting dev server on http://${HOST}:${PORT}`);

  const dev = spawn(DEV_COMMAND, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  dev.stdout.on('data', (chunk) => handleDevOutput(chunk, process.stdout));
  dev.stderr.on('data', (chunk) => handleDevOutput(chunk, process.stderr));

  dev.on('exit', (code) => {
    if (!didStartHealthCheck && sawAddressInUse && !didRepairPort) {
      didRepairPort = true;
      log(`port ${PORT} is busy; freeing it and restarting once...`);
      freePort(PORT);
      launchDev();
      return;
    }

    if (!didStartHealthCheck && !didRepairDependencies) {
      didRepairDependencies = true;
      log('dev server stopped before it was ready; refreshing dependencies once...');
      runInstall('refreshing dependencies from package lock...');
      freePort(PORT);
      launchDev();
      return;
    }

    process.exit(code ?? 0);
  });
}

function handleDevOutput(chunk, stream) {
  const text = chunk.toString();
  stream.write(text);
  if (text.includes('EADDRINUSE')) {
    sawAddressInUse = true;
  }
  if (!didStartHealthCheck && text.includes('Ready in')) {
    didStartHealthCheck = true;
    void waitForPreview();
  }
}

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

function runInstall(message) {
  log(message);
  const install = spawnSync('npm install --no-audit --no-fund', {
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    log('dependency refresh did not complete cleanly; launching anyway.');
  }
}

async function waitForPreview() {
  const startedAt = Date.now();
  const url = `http://${HOST}:${PORT}${HEALTH_PATH}`;

  while (Date.now() - startedAt < HEALTH_TIMEOUT_MS) {
    if (await previewResponds(HEALTH_PATH)) {
      log(`preview ready: ${url}`);
      return;
    }
    await delay(HEALTH_RETRY_MS);
  }

  log(`preview did not answer at ${url}`);
  log('If the browser says "connection refused", the local preview server is not running correctly.');
  log('Ryo: check the Cursor task output, network access for Google fonts, and whether another process is holding port 3000.');
}

function previewResponds(path) {
  return new Promise((resolve) => {
    const req = http.get({ host: HOST, port: PORT, path, timeout: HEALTH_RETRY_MS }, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
