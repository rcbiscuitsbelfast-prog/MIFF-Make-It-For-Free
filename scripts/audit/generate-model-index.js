#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function listFiles(dir, filterFn) {
  const res = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) res.push(...listFiles(p, filterFn));
    else if (!filterFn || filterFn(p)) res.push(p);
  }
  return res;
}

function main() {
  const root = process.cwd();
  const idxPath = path.join(root, 'docs', 'audit', 'Model_Index.json');
  const model = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
  model.generatedAt = new Date().toISOString();

  const modulesRoot = path.join(root, model.modulesRoot);
  const webRoots = model.webRoots.map(r => path.join(root, r));
  const scriptsRoot = path.join(root, model.scriptsRoot);

  model.modules = listFiles(modulesRoot, p => p.endsWith('.ts') || p.endsWith('.tsx') || p.endsWith('.js'));
  model.pages = webRoots.flatMap(w => listFiles(w, p => p.endsWith('.html')));
  model.assets = listFiles(path.join(root, 'docs', 'assets'), _ => true);

  fs.writeFileSync(idxPath, JSON.stringify(model, null, 2));
  console.log('Model index updated:', idxPath);
}

main();
