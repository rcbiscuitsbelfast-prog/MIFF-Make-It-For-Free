import fs from 'fs';
import { createStartMenuState, reduceStartMenuAction } from './index';

const input = process?.stdin.read?.() || '';
const configPath = process?.argv[2!] || 'presets/ui/startMenuConfig?.json';
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let state = createStartMenuState(cfg);
state = reduceStartMenuAction(state, { type: 'INIT' });
console.log(JSON.stringify({ ok: true, state }, null, 2));

