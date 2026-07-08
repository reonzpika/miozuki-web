// Shared local dev launcher for Cursor (folder-open task) and Codex/agent restarts.
//
// Single owner for http://127.0.0.1:3000. Do not run `npm run dev` directly when
// this launcher is in use; call startDevServer() or restartDevServer() instead.

import http from 'node:http';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { platform } from 'node:os';
import { runSafeSync, startPeriodicSafeSync } from './ting-safe-sync.mjs';

const isWindows = platform() === 'win32';
const HOST = '127.0.0.1';
const PORT = 3000;
const FALLBACK_PORT = 3001;
const HEALTH_PATH = '/pages/bespoke-order';
const HEALTH_TIMEOUT_MS = 90_000;
const HEALTH_RETRY_MS = 2_000;
const DEV_COMMAND = `npm run dev -- --hostname ${HOST} --port ${PORT}`;
const DEPS_STAMP_PATH = '.cursor/deps-stamp';
const DEV_LOCK_PATH = '.next/dev/lock';
const LOG_PATH = '.next/dev/cursor-start.log';

const state = {
  didRepairDependencies: false,
  didRepairPort: false,
  didStartHealthCheck: false,
  sawAddressInUse: false,
  sawWrongPort: false,
  devProcess: null,
};

export async function startDevServer() {
  resetRepairFlags();
  await runSafeSync('silent');
  startPeriodicSafeSync();
  prepareAndLaunch();
}

export async function restartDevServer() {
  log('restart requested.');
  resetRepairFlags();
  await runSafeSync('silent');
  startPeriodicSafeSync();
  killDevProcess();
  freePort(PORT);
  freePort(FALLBACK_PORT);
  removeStaleDevLock();
  prepareAndLaunch();
}

function resetRepairFlags() {
  state.didRepairDependencies = false;
  state.didRepairPort = false;
}

function prepareAndLaunch() {
  ensureDependencies();
  freePort(PORT);
  removeStaleDevLock();
  launchDev();
}

function log(message) {
  const line = `[cursor-start] ${message}`;
  console.log(line);
  try {
    mkdirSync('.next/dev', { recursive: true });
    appendFileSync(LOG_PATH, `${new Date().toISOString()} ${line}\n`);
  } catch {
    // Best-effort logging only.
  }
}

function lockfileHash() {
  return createHash('sha256').update(readFileSync('package-lock.json')).digest('hex');
}

function needsDependencySync() {
  if (!existsSync('node_modules')) return true;
  if (!existsSync('package-lock.json')) return false;
  if (!existsSync(DEPS_STAMP_PATH)) return true;
  try {
    return readFileSync(DEPS_STAMP_PATH, 'utf8').trim() !== lockfileHash();
  } catch {
    return true;
  }
}

function writeDepsStamp() {
  mkdirSync('.cursor', { recursive: true });
  writeFileSync(DEPS_STAMP_PATH, lockfileHash());
}

function ensureDependencies() {
  if (!needsDependencySync()) {
    log('dependencies in sync.');
    return;
  }
  runInstall(
    existsSync('node_modules')
      ? 'package lock changed; syncing dependencies...'
      : 'dependencies missing; installing from package lock...',
  );
}

function runInstall(message) {
  log(message);
  const install = spawnSync('npm install --no-audit --no-fund', {
    stdio: 'inherit',
    shell: true,
  });
  if (install.status !== 0) {
    log('dependency sync did not complete cleanly; launching anyway.');
    return;
  }
  writeDepsStamp();
}

function launchDev() {
  state.didStartHealthCheck = false;
  state.sawAddressInUse = false;
  state.sawWrongPort = false;
  log(`starting dev server on http://${HOST}:${PORT}`);

  const dev = spawn(DEV_COMMAND, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });
  state.devProcess = dev;

  dev.stdout.on('data', (chunk) => handleDevOutput(chunk, process.stdout));
  dev.stderr.on('data', (chunk) => handleDevOutput(chunk, process.stderr));

  dev.on('exit', (code) => {
    if (state.devProcess === dev) {
      state.devProcess = null;
    }

    if (!state.didStartHealthCheck && state.sawAddressInUse && !state.didRepairPort) {
      state.didRepairPort = true;
      log(`port ${PORT} is busy; freeing it and restarting once...`);
      freePort(PORT);
      freePort(FALLBACK_PORT);
      removeStaleDevLock();
      launchDev();
      return;
    }

    if (!state.didStartHealthCheck && !state.didRepairDependencies) {
      state.didRepairDependencies = true;
      log('dev server stopped before it was ready; syncing dependencies once...');
      runInstall('refreshing dependencies from package lock...');
      freePort(PORT);
      freePort(FALLBACK_PORT);
      removeStaleDevLock();
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
    state.sawAddressInUse = true;
  }

  const localMatch = text.match(/Local:\s+(https?:\/\/[^\s]+)/);
  if (localMatch) {
    try {
      const boundPort = Number(new URL(localMatch[1]).port || String(PORT));
      if (boundPort !== PORT) {
        state.sawWrongPort = true;
      }
    } catch {
      // Ignore malformed Local URL lines.
    }
  }

  if (!state.didStartHealthCheck && text.includes('Ready in')) {
    state.didStartHealthCheck = true;
    void waitForPreview();
  }
}

function killDevProcess() {
  const { devProcess } = state;
  if (!devProcess || devProcess.killed) return;

  try {
    if (isWindows) {
      spawnSync('taskkill', ['/PID', String(devProcess.pid), '/T', '/F'], {
        stdio: 'ignore',
      });
    } else {
      devProcess.kill('SIGTERM');
    }
  } catch {
    // Best-effort shutdown.
  }
  state.devProcess = null;
}

function freePort(port) {
  try {
    if (isWindows) {
      const out = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
      if (out.status !== 0 || !out.stdout) return;
      const pids = new Set();
      for (const line of out.stdout.split('\n')) {
        if (!line.includes('LISTENING')) continue;
        if (!line.includes(`:${port}`)) continue;
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== '0') pids.add(pid);
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
    // Best-effort port cleanup.
  }
}

function removeStaleDevLock() {
  if (!existsSync(DEV_LOCK_PATH)) return;
  try {
    unlinkSync(DEV_LOCK_PATH);
    log('removed stale dev lock.');
  } catch {
    // Another live dev process may hold the lock.
  }
}

async function waitForPreview() {
  if (state.sawWrongPort && !state.didRepairPort) {
    state.didRepairPort = true;
    log(`dev server bound to the wrong port; freeing ports and restarting once...`);
    killDevProcess();
    freePort(PORT);
    freePort(FALLBACK_PORT);
    removeStaleDevLock();
    launchDev();
    return;
  }

  const startedAt = Date.now();
  const url = `http://${HOST}:${PORT}${HEALTH_PATH}`;

  while (Date.now() - startedAt < HEALTH_TIMEOUT_MS) {
    if (await previewResponds(PORT)) {
      log(`preview ready: ${url}`);
      return;
    }
    await delay(HEALTH_RETRY_MS);
  }

  if (!state.didRepairPort && (await previewResponds(FALLBACK_PORT))) {
    state.didRepairPort = true;
    log(`preview answered on port ${FALLBACK_PORT} instead of ${PORT}; freeing ports and restarting once...`);
    killDevProcess();
    freePort(PORT);
    freePort(FALLBACK_PORT);
    removeStaleDevLock();
    launchDev();
    return;
  }

  log(`preview did not answer at ${url}`);
  log('If the browser says "connection refused", the local preview server is not running correctly.');
  log('Ryo: check .next/dev/cursor-start.log, then run: node scripts/dev-restart.mjs');
}

function previewResponds(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: HOST, port, path: HEALTH_PATH, timeout: HEALTH_RETRY_MS },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      },
    );
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
