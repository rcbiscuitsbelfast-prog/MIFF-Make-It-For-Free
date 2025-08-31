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
  // Enhanced mapping rules for the refactor
  if (p.startsWith('site/')) return p.replace('site/', 'site/');
  if (p.startsWith('miff/scenarios/')) return p.replace('miff/scenarios/', 'miff/scenarios/');
  if (p.startsWith('miff/assets/')) return p.replace('miff/assets/', 'miff/assets/');
  if (p.startsWith('zones/')) return p.replace('zones/', 'zones/');
  if (p.startsWith('miff/scripts/')) return p.replace('miff/scripts/', 'miff/miff/scripts/');
  if (p.startsWith('sampler/')) return p.replace('sampler/', 'miff/');
  return null;
}

function walk(dir){
  console.log(`[reorg] Walking directory: ${dir}`);
  for (const name of fs.readdirSync(dir)){
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (st.isFile()){
      const rel = path.relative(root, p).replace(/\\/g,'/');
      const mapped = mapPath(rel);
      if (mapped){ 
        console.log(`[reorg] Moving: ${rel} → ${mapped}`);
        move(rel, mapped); 
      }
    }
  }
}

function updateReferences(filePath, content){
  // Enhanced reference updating for the refactor
  const original = content;
  content = content
    .replace(/sampler\/site\//g, 'site/')
    .replace(/sampler\/scenarios\//g, 'miff/scenarios/')
    .replace(/sampler\/assets\//g, 'miff/assets/')
    .replace(/sampler\/zones\//g, 'zones/')
    .replace(/scripts\//g, 'miff/miff/scripts/')
    .replace(/\(\.\.\/\.\.\/assets\//g, '(../../miff/assets/')
    .replace(/"\.\.\/\.\.\/scenarios\//g, '"../../miff/scenarios/')
    .replace(/from ['"]\.\.\/\.\.\/sampler\//g, "from '../../miff/")
    .replace(/import ['"]\.\.\/\.\.\/sampler\//g, "import '../../miff/");
  
  if (content !== original) {
    console.log(`[reorg] Updated references in: ${filePath}`);
  }
  
  return content;
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
  // Enable actual moves when --apply is used
  if (apply) {
    walk(path.join(root, 'sampler'));
    walk(path.join(root, 'scripts'));
  }
  console.log('[reorg] Plan entries:', plan.length);
  fs.writeFileSync(path.join(root, 'reorg-plan.json'), JSON.stringify(plan, null, 2));
  console.log('[reorg] Wrote reorg-plan.json');
}

main();

