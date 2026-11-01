import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('\x1b[36m%s\x1b[0m', '=====================================================');
console.log('\x1b[36m%s\x1b[0m', '  🚀 Starting SAHELI Full-Stack Platform in Real Time');
console.log('\x1b[36m%s\x1b[0m', '=====================================================');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const nodeCmd = process.execPath;

// 1. Start Backend Server
const backend = spawn(nodeCmd, ['backend/src/server.js'], {
  cwd: projectRoot,
  stdio: 'pipe',
  env: { ...process.env, PORT: '5000' },
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line) console.log('\x1b[32m[backend]\x1b[0m', line);
  }
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line) console.error('\x1b[31m[backend error]\x1b[0m', line);
  }
});

// 2. Start Frontend Server (Vite)
const frontend = isWindows
  ? spawn('npm', ['run', 'dev', '--workspace=frontend'], {
      cwd: projectRoot,
      stdio: 'pipe',
      shell: true,
      env: process.env,
    })
  : spawn('npm', ['run', 'dev', '--workspace=frontend'], {
      cwd: projectRoot,
      stdio: 'pipe',
      env: process.env,
    });

frontend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line) console.log('\x1b[34m[frontend]\x1b[0m', line);
  }
});

frontend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  for (const line of lines) {
    if (line) console.error('\x1b[33m[frontend]\x1b[0m', line);
  }
});

function cleanup() {
  console.log('\nShutting down SAHELI services...');
  if (backend && !backend.killed) {
    try {
      if (isWindows) {
        spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t']);
      } else {
        backend.kill('SIGINT');
      }
    } catch {}
  }
  if (frontend && !frontend.killed) {
    try {
      if (isWindows) {
        spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t']);
      } else {
        frontend.kill('SIGINT');
      }
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
backend.on('close', (code) => {
  if (code !== 0 && code !== null) console.log(`Backend process exited with code ${code}`);
});
frontend.on('close', (code) => {
  if (code !== 0 && code !== null) console.log(`Frontend process exited with code ${code}`);
});
