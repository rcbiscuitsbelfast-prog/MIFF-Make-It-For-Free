#!/usr/bin/env node
// Integrate generated characters into NPC registry and WorldManifest
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { WorldManifestPure } from '../miff/pure/WorldManifestPure/index';

const CHAR_DIR = '/workspace/assets/generated/characters';
const CHAR_REG = `${CHAR_DIR}/character_registry.json`;
const NPC_REG = `${CHAR_DIR}/npc_registry.json`;
const WORLD_DIR = '/workspace/assets/generated/world';
const WORLD_MANIFEST = `${WORLD_DIR}/manifest.json`;

function ensureDir(p: string) { try { mkdirSync(p, { recursive: true }); } catch {}
}

function main() {
  ensureDir(CHAR_DIR);
  ensureDir(WORLD_DIR);

  const charData = JSON.parse(readFileSync(CHAR_REG, 'utf-8'));
  const items: Array<{ id: string; name: string; role: string }> = charData.items || [];

  // Build NPC registry with default dialogue and quest hooks
  const npcs = items.map((c, idx) => {
    const zoneId = idx % 2 === 0 ? 'zone_city' : 'zone_outskirts';
    return {
      id: c.id,
      name: c.name,
      role: c.role,
      dialogue: {
        id: `${c.id}_dlg_root`,
        text: `Hello, I'm ${c.name}.`,
        options: [
          { text: 'Any quests?', nextNodeId: `${c.id}_dlg_quest`, action: { type: 'give_quest', target: `${c.id}_quest_intro`, value: true } },
          { text: 'Goodbye.', nextNodeId: 'end' }
        ]
      },
      quests: [ { id: `${c.id}_quest_intro`, name: `Meet ${c.name}`, type: 'intro' } ],
      party: { recruitable: idx % 10 === 0 },
      spawn: { zoneId, x: 5 + (idx % 10), y: 5 + (idx % 10) }
    };
  });

  writeFileSync(NPC_REG, JSON.stringify({ schema: 'miff.npc.registry.v1', total: npcs.length, npcs }, null, 2));

  // Create/extend world manifest with zones and spawn tiles
  const world = WorldManifestPure.create('zone_city', 'City', 64, 64);
  world.zones.push({ id: 'zone_outskirts', name: 'Outskirts', width: 64, height: 64, tiles: [], metadata: { style: 'pixel-topdown', generated: true } });

  for (const n of npcs) {
    const z = n.spawn.zoneId;
    WorldManifestPure.addTile(world, z, n.spawn.x, n.spawn.y, `npc:${n.id}`, 2);
  }

  writeFileSync(WORLD_MANIFEST, WorldManifestPure.exportJSON(world));

  console.log(JSON.stringify({ ok: true, npcRegistry: NPC_REG, worldManifest: WORLD_MANIFEST, total: npcs.length }, null, 2));
}

main();

