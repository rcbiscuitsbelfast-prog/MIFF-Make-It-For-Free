import { readFileSync } from 'fs';
import seedrandom from 'seedrandom';
import { NPCData, validateNPC } from './schema';

function interact(npc: NPCData, seed: number) {
  const rng = seedrandom(String(seed));
  const lines = npc.dialogue ?? [];
  const picked = lines.length > 0 ? lines[Math.floor(rng() * lines.length)] : undefined;
  const setFlags = new Set<string>(npc.questFlagsToSet ?? []);
  for (const f of npc.codexUnlockFlags ?? []) setFlags.add(f);
  let log = `[NPC] ${npc.name} (seed=${seed})\n`;
  if (picked) log += `${picked.speaker}: ${picked.text}\n`;
  if (setFlags.size > 0) log += `Flags: ${Array.from(setFlags).join(',')}\n`;
  return log;
}

if (require.main === module) {
  const [,, path, seedArg] = process.argv;
  const seed = Number(seedArg ?? 0);
  const json = readFileSync(path, 'utf-8');
  const npc = JSON.parse(json);
  if (!validateNPC(npc)) throw new Error('Invalid NPC');
  process.stdout.write(interact(npc, seed));
}

export { interact };
