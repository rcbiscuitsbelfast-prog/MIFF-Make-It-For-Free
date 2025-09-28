#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const required = [
  'docs/index.html',
  'docs/sampler/index.html',
  'docs/studio/index.html',
  'docs/docs-site/index.html'
];

function check(p) {
  const ok = fs.existsSync(path.join(root, p));
  console.log(`${ok ? '✅' : '❌'} ${p}`);
  return ok;
}

function grep(file, needles) {
  const s = fs.readFileSync(path.join(root, file), 'utf8');
  for (const n of needles) {
    if (!s.includes(n)) {
      console.error(`❌ ${file} missing: ${n}`);
      return false;
    }
  }
  console.log(`✅ ${file} content checks passed`);
  return true;
}

let pass = true;
for (const p of required) pass = check(p) && pass;

pass = grep('docs/index.html', ['assets/style.css', 'MIFF Sampler', 'MIFF Studio', 'RenderWorld', 'Documentation']) && pass;
pass = grep('docs/sampler/index.html', ['MIFF Sampler', 'assets/style.css']) && pass;
pass = grep('docs/studio/index.html', ['MIFF Studio', 'assets/style.css']) && pass;
pass = grep('docs/docs-site/index.html', ['MIFF Documentation', 'assets/style.css']) && pass;

if (!pass) process.exit(1);
console.log('🎉 Site validation passed.');
