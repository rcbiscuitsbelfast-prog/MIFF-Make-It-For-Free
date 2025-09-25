const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure build directory exists for tests that expect it
try { fs.mkdirSync(path.resolve(process.cwd(), 'build'), { recursive: true }); } catch {}

// Polyfill requestAnimationFrame for Node environment
if (typeof global.requestAnimationFrame === 'undefined') {
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);
}

global.testUtils = {
  runCLI: (cliPath, args = []) => {
    const resolved = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
    // Execute TypeScript CLI using ts-node
    const out = execFileSync('npx', [
      'ts-node',
      '--transpile-only',
      '--compiler-options', '{"module":"commonjs"}',
      resolved,
      ...args
    ], { encoding: 'utf-8' });
    return out;
  }
};

