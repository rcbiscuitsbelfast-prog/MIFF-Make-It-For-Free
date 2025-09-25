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

// Minimal window/document polyfills for modules that assume browser APIs
if (typeof global.window === 'undefined') {
  global.window = global;
}
if (typeof global.window.addEventListener !== 'function') {
  global.window.addEventListener = () => {};
  global.window.removeEventListener = () => {};
}
if (typeof global.document === 'undefined') {
  global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    createElement: () => ({ style: {} })
  };
}

global.testUtils = {
  runCLI: (cliPath, args = []) => {
    const resolved = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
    // Execute TypeScript CLI using ts-node
    const out = execFileSync('npx', [
      'tsx',
      resolved,
      ...args
    ], { encoding: 'utf-8' });
    return out;
  }
};

