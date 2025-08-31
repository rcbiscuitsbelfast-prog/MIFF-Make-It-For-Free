#!/usr/bin/env node
/**
 * MIFF Modular Refactor Script (dry-run by default)
 * - Plans moves to new structure and updates references
 * - Use --apply to perform changes
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const apply = process.argv.includes('--apply');

const plan = [];

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function move(src, dest){ plan.push({ src, dest }); if (apply){ ensureDir(path.dirname(dest)); fs.renameSync(src, dest); } }

function mapPath(p){
  // Example mapping rules (extend as needed)
  if (p.startsWith('sampler/site/')) return p.replace('sampler/site/', 'site/');
  if (p.startsWith('sampler/scenarios/')) return p.replace('sampler/scenarios/', 'miff/scenarios/');
  if (p.startsWith('sampler/assets/')) return p.replace('sampler/assets/', 'miff/assets/');
  if (p.startsWith('sampler/zones/')) return p.replace('sampler/zones/', 'zones/');
  if (p.startsWith('scripts/')) return p.replace('scripts/', 'miff/scripts/');
  return null;
}

function walk(dir){
  for (const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile()){
      const rel = path.relative(root, p).replace(/\\/g,'/');
      const mapped = mapPath(rel);
      if (mapped){ move(rel, mapped); }
    }
  }
}

function updateReferences(filePath, content){
  // Minimal example: adjust well-known prefixes
  return content
    .replace(/sampler\/site\//g, 'site/')
    .replace(/sampler\/scenarios\//g, 'miff/scenarios/')
    .replace(/sampler\/assets\//g, 'miff/assets/')
    .replace(/sampler\/zones\//g, 'zones/')
    .replace(/\(\.\.\/\.\.\/assets\//g, '(../../miff/assets/')
    .replace(/"\.\.\/\.\.\/scenarios\//g, '"../../miff/scenarios/');
}

function rewriteFiles(){
  const exts = new Set(['.html','.js','.ts','.tsx','.md','.json']);
  function rewriteDir(dir){
    for (const name of fs.readdirSync(dir)){
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) rewriteDir(p);
      else if (exts.has(path.extname(name))){
        const s = fs.readFileSync(p, 'utf-8');
        const t = updateReferences(p, s);
        if (t !== s){ if (apply) fs.writeFileSync(p, t); plan.push({ rewrite: p }); }
      }
    }
  }
  rewriteDir(root);
}

function main(){
  console.log(`[reorg] Starting ${apply ? 'APPLY' : 'DRY-RUN'} reorg planning...`);
  rewriteFiles();
  // Commented actual moves for safety; uncomment in controlled branch.
  // walk(path.join(root, 'sampler'));
  // walk(path.join(root, 'scripts'));
  console.log('[reorg] Plan entries:', plan.length);
  fs.writeFileSync(path.join(root, 'reorg-plan.json'), JSON.stringify(plan, null, 2));
  console.log('[reorg] Wrote reorg-plan.json');
}

main();

