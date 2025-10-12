import fs from 'fs';
import { createGameMenuState, reduceGameMenuAction } from './index';
import { SafeJSONParser } from '../shared/security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

const configPath = process.argv[2] || 'presets/ui/gameMenuConfig.json';
const cfg = SafeJSONParser.parse(fs.readFileSync(configPath, 'utf8'));
let state = createGameMenuState(cfg);
state = reduceGameMenuAction(state, { type: 'INIT' });
state = reduceGameMenuAction(state, { type: 'OPEN' });
this.logger.info(JSON.stringify({ ok: true, state }, null, 2));

