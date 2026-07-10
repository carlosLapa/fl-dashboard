const { spawnSync } = require('child_process');

// Regenerates package-lock.json using the same node/npm version as
// Dockerfile.frontend (node:20-alpine), since a different local npm
// version can resolve optional peer dependencies differently and
// produce a lockfile that fails `npm ci` in the Docker build.
const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '-v',
    `${process.cwd()}:/app`,
    '-w',
    '/app',
    'node:20-alpine',
    'npm',
    'install',
    '--package-lock-only',
  ],
  { stdio: 'inherit' }
);

process.exit(result.status ?? 1);
