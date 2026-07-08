// Silent, conservative Git sync for Ting's website workflow.
//
// Default/background mode never pushes, never stashes, and never creates merge
// commits. It only fast-forwards a clean, behind checkout. Results are written
// under .git/ so routine sync is invisible to Ting and never committed.

import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GIT_DIR = resolve(REPO_ROOT, '.git');
const LOG_PATH = resolve(GIT_DIR, 'miozuki-safe-sync.log');
const STATE_PATH = resolve(GIT_DIR, 'miozuki-safe-sync.json');
const DEFAULT_REMOTE = 'origin';
const DEFAULT_BRANCH = 'master';
const PERIODIC_MS = 10 * 60 * 1000;
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';

let periodicTimer = null;

export async function runSafeSync(mode = 'silent') {
  const result = {
    ok: false,
    mode,
    repo: REPO_ROOT,
    timestamp: new Date().toISOString(),
    action: 'none',
    state: 'unknown',
    message: '',
    branch: '',
    upstream: '',
    ahead: 0,
    behind: 0,
  };

  try {
    ensureGitLogDir();

    if (!existsSync(GIT_DIR)) {
      result.state = 'not_git_repo';
      result.message = 'Website folder is not a Git repository.';
      return finish(result);
    }

    git(['fetch', DEFAULT_REMOTE]);

    result.branch = git(['branch', '--show-current']).stdout.trim() || DEFAULT_BRANCH;
    result.upstream = upstreamForCurrentBranch() || `${DEFAULT_REMOTE}/${result.branch}`;
    const dirty = git(['status', '--porcelain']).stdout.trim();
    const counts = aheadBehind(result.upstream);
    result.ahead = counts.ahead;
    result.behind = counts.behind;

    if (dirty) {
      result.ok = true;
      result.state = 'work_in_progress';
      result.message = 'Local website changes are in progress; background sync did not touch them.';
      return finish(result);
    }

    if (result.behind === 0 && result.ahead === 0) {
      result.ok = true;
      result.state = 'up_to_date';
      result.message = 'Website is already up to date.';
      return finish(result);
    }

    if (result.behind > 0 && result.ahead === 0) {
      git(['merge', '--ff-only', result.upstream]);
      result.ok = true;
      result.action = 'fast_forward';
      result.state = 'updated';
      result.message = `Updated website from ${result.upstream}.`;
      return finish(result);
    }

    if (mode === 'publish' && result.behind === 0 && result.ahead > 0) {
      runChecksAndPush(result.branch);
      result.ok = true;
      result.action = 'push';
      result.state = 'published';
      result.message = 'Saved website work was made live.';
      return finish(result);
    }

    if (result.behind === 0 && result.ahead > 0) {
      result.ok = true;
      result.state = 'saved_unpublished_work';
      result.message = 'Saved website work exists locally and has not been made live.';
      return finish(result);
    }

    if (mode === 'silent') {
      result.ok = true;
      result.state = 'needs_supervised_merge';
      result.message = 'Local and GitHub website changes both exist; background sync left them alone.';
      return finish(result);
    }

    git(['merge', '--no-edit', result.upstream]);

    if (mode === 'publish') {
      runChecksAndPush(result.branch);
      result.ok = true;
      result.action = 'merge_and_push';
      result.state = 'published';
      result.message = 'Merged GitHub changes and made saved website work live.';
      return finish(result);
    }

    result.ok = true;
    result.action = 'merge';
    result.state = 'merged';
    result.message = `Merged ${result.upstream} into local website work.`;
    return finish(result);
  } catch (error) {
    result.ok = false;
    result.state = 'failed';
    result.message = error instanceof Error ? error.message : String(error);
    return finish(result);
  }
}

export function startPeriodicSafeSync() {
  if (periodicTimer) return;
  periodicTimer = setInterval(() => {
    void runSafeSync('silent');
  }, PERIODIC_MS);
  periodicTimer.unref?.();
}

function upstreamForCurrentBranch() {
  const res = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], {
    check: false,
  });
  return res.status === 0 ? res.stdout.trim() : '';
}

function aheadBehind(upstream) {
  const res = git(['rev-list', '--left-right', '--count', `HEAD...${upstream}`], {
    check: false,
  });
  if (res.status !== 0) return { ahead: 0, behind: 0 };
  const [aheadRaw, behindRaw] = res.stdout.trim().split(/\s+/);
  return {
    ahead: Number(aheadRaw || 0),
    behind: Number(behindRaw || 0),
  };
}

function git(args, options = {}) {
  const res = spawnSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GCM_INTERACTIVE: 'never',
    },
  });

  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  const status = res.status ?? 1;

  if (options.check === false || status === 0) {
    log(`git ${args.join(' ')} -> ${status}`);
    if (stderr.trim()) log(stderr.trim());
    return { status, stdout, stderr };
  }

  const detail = stderr.trim() || stdout.trim() || `git ${args.join(' ')} failed`;
  log(`git ${args.join(' ')} -> ${status}`);
  log(detail);
  throw new Error(detail);
}

function runChecksAndPush(branch) {
  command(NPM, ['run', 'lint'], 120_000);
  command(NPM, ['run', 'build'], 10 * 60_000);
  git(['push', DEFAULT_REMOTE, branch || DEFAULT_BRANCH]);
}

function command(file, args, timeout) {
  const res = spawnSync(file, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout,
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
      GCM_INTERACTIVE: 'never',
    },
  });

  const stdout = res.stdout || '';
  const stderr = res.stderr || '';
  const status = res.status ?? 1;
  log(`${file} ${args.join(' ')} -> ${status}`);
  if (res.error) log(res.error.message);
  if (stdout.trim()) log(stdout.trim());
  if (stderr.trim()) log(stderr.trim());
  if (status !== 0) {
    throw new Error(`${file} ${args.join(' ')} failed`);
  }
}

function finish(result) {
  log(`${result.mode}: ${result.state}: ${result.message}`);
  writeFileSync(STATE_PATH, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

function log(message) {
  ensureGitLogDir();
  appendFileSync(LOG_PATH, `${new Date().toISOString()} ${message}\n`);
}

function ensureGitLogDir() {
  mkdirSync(GIT_DIR, { recursive: true });
}

function parseMode() {
  const arg = process.argv.find((value) => value.startsWith('--mode='));
  return arg ? arg.slice('--mode='.length) : 'silent';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = parseMode();
  const result = await runSafeSync(mode);
  if (mode !== 'silent') {
    console.log(result.message);
  }
  process.exit(result.ok ? 0 : 1);
}
