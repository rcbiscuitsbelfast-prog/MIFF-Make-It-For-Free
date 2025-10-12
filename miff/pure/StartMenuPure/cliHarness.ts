import fs from 'fs';
import { createStartMenuState, reduceStartMenuAction } from './index';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

const input = process.stdin.read?.() || '';
const configPath = process.argv[2] || 'presets/ui/startMenuConfig.json';
const cfg = SafeJSONParser.parse(fs.readFileSync(configPath, 'utf8'));
let state = createStartMenuState(cfg);
state = reduceStartMenuAction(state, { type: 'INIT' });
this.logger.info(JSON.stringify({ ok: true, state }, null, 2));

