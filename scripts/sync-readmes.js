#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function listModuleReadmes(root){
  const base = path.resolve(root);
  const entries = fs.readdirSync(base, { withFileTypes: true });
  const out = [];
  for (const e of entries){
    if (!e.isDirectory()) continue;
    const mod = e.name;
    const readme = path.join(base, mod, 'README.md');
    if (fs.existsSync(readme)) out.push({ mod, readme });
  }
  return out;
}

function ensureDir(dir){ fs.mkdirSync(dir, { recursive: true }); }

function main(){
  const modulesRoot = process.argv[2] || 'miff/pure';
  const outDir = process.argv[3] || 'docs/modules';
  ensureDir(outDir);
  const mods = listModuleReadmes(modulesRoot);
  for (const m of mods){
    const dst = path.join(outDir, `${m.mod}.md`);
    const src = fs.readFileSync(m.readme, 'utf-8');
    const banner = `<!-- Auto-synced from ${path.relative(process.cwd(), m.readme)} -->\n\n`;
    fs.writeFileSync(dst, banner + src);
  }
  // write index
  const index = [
    '# MIFF Modules (Auto-synced)',
    '',
    ...mods.map(m => `- [${m.mod}](./${m.mod}.md)`)
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'README.md'), index + '\n');
  console.log(`Synced ${mods.length} module READMEs to ${outDir}`);
}

main();

