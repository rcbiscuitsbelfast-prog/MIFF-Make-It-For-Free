#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function main() {
  const date = process.env.DATE || new Date().toISOString().slice(0, 10);
  const outDir = path.resolve('docs/archive/test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const out = path.join(outDir, `${date}-cli-audit.txt`);

  const cliDir = path.resolve('cli');
  const entries = fs.readdirSync(cliDir).filter(f => f.endsWith('.ts') || f.endsWith('.cjs') || f.endsWith('.js'));
  const lines = [ `# CLI Audit ${date}`, `Root: ${path.relative(process.cwd(), cliDir)}` ];

  for (const file of entries) {
    const p = path.join(cliDir, file);
    const src = fs.readFileSync(p, 'utf8');
    const esModule = /export\s+|import\s+/.test(src) || /type:\s*"module"/.test(src);
    const shebang = src.startsWith('#!');
    const hasCommander = /from\s+'commander'|require\(['"]commander['"]\)/.test(src);
    lines.push(`\n## ${file}`);
    lines.push(`- Shebang: ${shebang ? 'yes' : 'no'}`);
    lines.push(`- ES Module syntax: ${esModule ? 'yes' : 'no'}`);
    lines.push(`- Uses commander: ${hasCommander ? 'yes' : 'no'}`);
    lines.push(`- Executable: ${shebang || file.endsWith('.cjs') || file.endsWith('.js') ? 'likely' : 'ts via tsx'}`);
  }

  fs.writeFileSync(out, lines.join('\n'));
  process.stdout.write(`Wrote ${path.relative(process.cwd(), out)}\n`);
}

if (require.main === module) main();

