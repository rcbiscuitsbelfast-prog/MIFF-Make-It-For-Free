import fs from 'fs';
import { createGameMenuState, reduceGameMenuAction } from './index';
import { InputSanitizer } from '../shared/security/InputSanitizer.ts';

// SECURITY: Validate all inputs
const configPath = InputSanitizer.getSafeArg(2, {
  type: 'path',
  required: false,
  pattern: /\.json$/i,
  maxLength: 500
}, 'presets/ui/gameMenuConfig.json');
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let state = createGameMenuState(cfg);
state = reduceGameMenuAction(state, { type: 'INIT' });
state = reduceGameMenuAction(state, { type: 'OPEN' });
console.log(JSON.stringify({ ok: true, state }, null, 2));

