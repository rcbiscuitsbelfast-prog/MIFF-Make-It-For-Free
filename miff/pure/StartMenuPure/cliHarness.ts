import fs from 'fs';
import { createStartMenuState, reduceStartMenuAction } from './index';
import { InputSanitizer } from '../shared/security/InputSanitizer.js';

const input = process.stdin.read?.() || '';

// SECURITY: Validate all inputs
const configPath = InputSanitizer.getSafeArg(2, {
  type: 'path',
  required: false,
  pattern: /\.json$/i,
  maxLength: 500
}, 'presets/ui/startMenuConfig.json');
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let state = createStartMenuState(cfg);
state = reduceStartMenuAction(state, { type: 'INIT' });
console.log(JSON.stringify({ ok: true, state }, null, 2));

