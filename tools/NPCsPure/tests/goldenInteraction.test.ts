import { readFileSync } from 'fs';
import { interact } from '../cliHarness';
import { validateNPC } from '../schema';

const npc = JSON.parse(readFileSync(require.resolve('../fixtures/sampleNPC.json'), 'utf-8'));
if (!validateNPC(npc)) throw new Error('Invalid NPC');
const out = interact(npc, 0);
const golden = `[NPC] Greeter (seed=0)\nGreeter: Welcome!\nFlags: MetGreeter,Codex_Greeter\n`;
if (out !== golden) {
  console.error('Golden mismatch');
  console.error('Expected:\n' + golden);
  console.error('Actual:\n' + out);
  process.exit(1);
}
console.log('OK');
