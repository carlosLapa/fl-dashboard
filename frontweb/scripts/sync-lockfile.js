const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Regenerates package-lock.json using the same node/npm version as
// Dockerfile.frontend (node:20-alpine), since a different local npm
// version can resolve optional peer dependencies differently and
// produce a lockfile that fails `npm ci` in the Docker build.
//
// Runs against a clean temp directory containing only package.json /
// package-lock.json — never the project directory itself — so a local
// node_modules (built with a different node/npm version) can't leak into
// the container and silently corrupt the resolved lockfile.

const projectDir = process.cwd();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lockfile-sync-'));

try {
  fs.copyFileSync(
    path.join(projectDir, 'package.json'),
    path.join(tmpDir, 'package.json')
  );
  const lockPath = path.join(projectDir, 'package-lock.json');
  if (fs.existsSync(lockPath)) {
    fs.copyFileSync(lockPath, path.join(tmpDir, 'package-lock.json'));
  }

  const result = spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '-v',
      `${tmpDir}:/app`,
      '-w',
      '/app',
      'node:20-alpine',
      'npm',
      'install',
      '--package-lock-only',
    ],
    { stdio: 'inherit' }
  );

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  fs.copyFileSync(
    path.join(tmpDir, 'package-lock.json'),
    path.join(projectDir, 'package-lock.json')
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
