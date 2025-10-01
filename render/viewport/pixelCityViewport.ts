#!/usr/bin/env node
import { execFileSync } from 'child_process';

function runTS(path: string): any {
  const out = execFileSync('npx', ['--yes', 'tsx', path], { stdio: ['ignore','pipe','pipe'] }).toString('utf-8');
  const start = out.indexOf('{');
  const end = out.lastIndexOf('}');
  const json = start >= 0 && end > start ? out.slice(start, end + 1) : '{}';
  return JSON.parse(json);
}

function main() {
  const menu = runTS('/workspace/render/startMenu.ts');
  if (menu.selected === 'Start Game' || menu.selected === 'Select Character') {
    const sel = runTS('/workspace/render/characterSelect.ts');
    const world = runTS('/workspace/cli/miff-world-pixel-city.ts');
    console.log(JSON.stringify({ ok: true, flow: 'menu->select->world', menu, sel, world }, null, 2));
  } else {
    console.log(JSON.stringify({ ok: true, flow: 'menu->exit', menu }, null, 2));
  }
}

main();

