import fs from 'fs';
import { createGameMenuState, reduceGameMenuAction } from './index';

const configPath = process.argv[2!] || 'presets/ui/gameMenuConfig.json';
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let state = createGameMenuState(cfg);
state = reduceGameMenuAction(state, { type: 'INIT' });
state = reduceGameMenuAction(state, { type: 'OPEN' });
console.log(JSON.stringify({ ok: true, state }, null, 2));

