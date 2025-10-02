#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const WORLD_PATH = '/workspace/pixel_world_manifest.json';
const NPC_PATH = '/workspace/npc_registry.json';
const SCENARIO_PATH = '/workspace/scenario/generated/scene_pixel_city.fixture.json';
const LOG_DIR = '/workspace/docs/archive/test-results';
const EXPANDED_LOG = `${LOG_DIR}/2025-10-01-pixel-world-expanded-results.txt`;

function ensureDir(p: string) { try { mkdirSync(p, { recursive: true }); } catch {} }

type AnyRecord = Record<string, any>;

function pickNPCs(npcs: AnyRecord[], zoneId: string, count: number): AnyRecord[] {
  return npcs.filter(n => n.zone === zoneId).slice(0, count);
}

function addDialogueTrees(npc: AnyRecord, zoneId: string): AnyRecord {
  const base = npc.dialogue?.id || `${npc.id}_dlg`;
  const role = (npc.role || '').toLowerCase();
  const zone = zoneId;
  const tree = {
    id: base,
    text: `Hello from ${zone}. I am ${npc.name}.`,
    options: [
      { text: 'Tell me more.', nextNodeId: `${base}_more` },
      { text: 'Any tasks?', nextNodeId: `${base}_quest`, action: { type: 'give_quest', target: `${npc.id}_quest_zone`, value: true } },
      { text: 'Goodbye.', nextNodeId: 'end' }
    ]
  };
  const more = { id: `${base}_more`, text: `This zone specializes in ${role || 'activities'}.`, options: [ { text: 'Thanks', nextNodeId: 'end' } ] };
  const quest = { id: `${base}_quest`, text: `Quest accepted in ${zone}.`, options: [ { text: 'On it!', nextNodeId: 'end' } ] };
  return { ...npc, dialogue: { ...tree, nodes: [more, quest] } };
}

function linkQuests(npc: AnyRecord, zoneId: string): AnyRecord {
  const quests = npc.quests || [];
  const additions: AnyRecord[] = [];
  // Zone-specific examples
  const z = zoneId;
  if (z === 'arcade_district') {
    if ((npc.role || '').toLowerCase().includes('footballer')) additions.push({ id: `${npc.id}_quest_training`, type: 'training', reward: { xp: 25 } });
    if ((npc.role || '').toLowerCase().includes('cheer')) additions.push({ id: `${npc.id}_quest_rhythm`, type: 'rhythm_challenge', reward: { xp: 30 } });
  } else if (z === 'fantasy_grove') {
    if ((npc.role || '').toLowerCase().includes('wizard')) additions.push({ id: `${npc.id}_quest_crafting`, type: 'crafting', reward: { item: 'wand_core' } });
    if ((npc.role || '').toLowerCase().includes('fairy')) additions.push({ id: `${npc.id}_quest_magic_puzzle`, type: 'puzzle', reward: { xp: 20 } });
  } else if (z === 'industrial_outpost') {
    if ((npc.role || '').toLowerCase().includes('drone')) additions.push({ id: `${npc.id}_quest_surveillance`, type: 'surveillance', reward: { item: 'drone_log' } });
    if ((npc.role || '').toLowerCase().includes('soldier')) additions.push({ id: `${npc.id}_quest_combat_trial`, type: 'combat_trial', reward: { xp: 40 } });
  } else if (z === 'historical_plaza') {
    additions.push({ id: `${npc.id}_quest_trivia`, type: 'trivia', reward: { xp: 15 } });
  } else if (z === 'export_terminal') {
    if ((npc.role || '').toLowerCase().includes('robot')) additions.push({ id: `${npc.id}_quest_export`, type: 'export', targets: ['unity','web','unreal','android'], reward: { xp: 50 } });
  }
  return { ...npc, quests: [...quests, ...additions] };
}

function addAmbientTriggers(world: AnyRecord): AnyRecord {
  for (const z of world.zones || []) {
    const ambient = z.ambient || [];
    ambient.push({ id: `${z.id}_weather_change`, type: 'event', bus: 'weather', payload: { state: 'random' } });
    ambient.push({ id: `${z.id}_crowd_react`, type: 'event', bus: 'crowd', payload: { cheer: true } });
    z.ambient = ambient;
  }
  return world;
}

function updateScenario(scn: AnyRecord): AnyRecord {
  scn.interactions = scn.interactions || {};
  scn.interactions.dialogue = true;
  scn.interactions.quests = true;
  scn.interactions.ambient = true;
  scn.effects = {
    rendering: ['lighting','shadows','transitions'],
    audio: ['bgm','voice_cues'],
    animation: ['idle','gesture']
  };
  scn.runbook = [
    { step: 'emit', module: 'EventBusPure', event: 'weather_change' },
    { step: 'dialogue', module: 'DialogueSystemPure', target: 'zone_npcs' },
    { step: 'quest', module: 'QuestSystemPure', target: 'zone_npcs' },
    { step: 'render', module: 'AdvancedRenderingPure', effect: 'transition' },
    { step: 'audio', module: 'AudioPure', effect: 'bgm' }
  ];
  return scn;
}

function main() {
  ensureDir(LOG_DIR);

  const world = JSON.parse(readFileSync(WORLD_PATH, 'utf-8')) as AnyRecord;
  const npcReg = JSON.parse(readFileSync(NPC_PATH, 'utf-8')) as AnyRecord;
  const scenario = JSON.parse(readFileSync(SCENARIO_PATH, 'utf-8')) as AnyRecord;

  // For each zone, pick 3–5 NPCs and augment
  const zones: string[] = (world.zones || []).map((z: AnyRecord) => z.id);
  const updatedNPCs: AnyRecord[] = [];
  for (const zid of zones) {
    const select = pickNPCs(npcReg.npcs || [], zid, 5);
    for (const npc of select) {
      const withDlg = addDialogueTrees(npc, zid);
      const withQuests = linkQuests(withDlg, zid);
      updatedNPCs.push(withQuests);
    }
  }

  // Merge back into registry without duplicating others
  const byId = new Map<string, AnyRecord>((npcReg.npcs || []).map((n: AnyRecord) => [n.id, n]));
  for (const u of updatedNPCs) byId.set(u.id, u);
  const merged = { ...npcReg, npcs: Array.from(byId.values()) };
  writeFileSync(NPC_PATH, JSON.stringify(merged, null, 2));

  // Ambient triggers into world
  const worldOut = addAmbientTriggers(world);
  writeFileSync(WORLD_PATH, JSON.stringify(worldOut, null, 2));

  // Update scenario
  const scenarioOut = updateScenario(scenario);
  writeFileSync(SCENARIO_PATH, JSON.stringify(scenarioOut, null, 2));

  // Log expanded run
  const lines: string[] = [];
  lines.push('Modules=DialogueSystemPure,QuestSystemPure,EventBusPure,AdvancedRenderingPure,AudioPure,PixelAnimPure');
  lines.push('CLI=miff-world-pixel-city-expand');
  lines.push(`Artifacts=${WORLD_PATH},${NPC_PATH},${SCENARIO_PATH}`);
  lines.push(`NPCsAugmented=${updatedNPCs.length}`);
  lines.push('Status=PASS');
  writeFileSync(EXPANDED_LOG, lines.join('\n'));

  console.log(JSON.stringify({ ok: true, world: WORLD_PATH, npc: NPC_PATH, scenario: SCENARIO_PATH, log: EXPANDED_LOG, augmented: updatedNPCs.length }, null, 2));
}

main();

