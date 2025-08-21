#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

type Command = { op: 'add'|'remove'|'inspect', id?: string, qty?: number };

function run(cmds: Command[]) {
  const log: string[] = [];
  const inv = new Map<string, number>();
  const add = (id: string, q=1) => { const n=(inv.get(id)||0)+q; inv.set(id,n); log.push(`ADD ${id} x${q} -> ${n}`); };
  const rem = (id: string, q=1) => { const n=(inv.get(id)||0); if (n<q) { log.push(`REM ${id} x${q} -> FAILED (have ${n})`); return; } const nn=n-q; inv.set(id,nn); log.push(`REM ${id} x${q} -> ${nn}`); };
  for (const c of cmds) {
    if (c.op==='add' && c.id) add(c.id, c.qty ?? 1);
    else if (c.op==='remove' && c.id) rem(c.id, c.qty ?? 1);
    else if (c.op==='inspect') log.push(`INV ${JSON.stringify(Array.from(inv.entries()))}`);
  }
  return { log, inventory: Array.from(inv.entries()).map(([id,quantity])=>({id,quantity})) };
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage: cliHarness.ts <commands.json>'); process.exit(1); }
  const cmds: Command[] = JSON.parse(fs.readFileSync(file,'utf-8'));
  const out = run(cmds);
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();