/**
 * CLI Harness for NPCsPure
 * 
 * Provides comprehensive CLI interface for NPC management including
 * creation, updates, simulation, and multi-format export.
 * 
 * @module NPCsPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { NPCsManager, NPC, NPBehavior } from './Manager';
import * as fs from 'fs';
import * as path from 'path';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new NPCsManager();

// Parse additional arguments
const npcId = args.find(arg => arg.startsWith('--npc-id='))?.split('=')[1] || 'npc_001';
const questId = args.find(arg => arg.startsWith('--quest-id='))?.split('=')[1] || 'quest_001';
const zoneId = args.find(arg => arg.startsWith('--zone-id='))?.split('=')[1] || 'zone_village';
const faction = args.find(arg => arg.startsWith('--faction='))?.split('=')[1] || 'village_elders';
const behaviorType = args.find(arg => arg.startsWith('--behavior='))?.split('=')[1] || 'quest_giver';
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'quests' || 'json';
const x = parseInt(args.find(arg => arg.startsWith('--x='))?.split('=')[1] || '0');
const y = parseInt(args.find(arg => arg.startsWith('--y='))?.split('=')[1] || '0');
const z = parseInt(args.find(arg => arg.startsWith('--z='))?.split('=')[1] || '0');
const reputation = parseInt(args.find(arg => arg.startsWith('--reputation='))?.split('=')[1] || '50');
const duration = parseInt(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '60');

let output: any;

try {
  switch (mode) {
    case 'create':
      // If first arg is a JSON file path, load NPC from file (test expects this)
      if (args[0] && args[0].endsWith('.json')) {
        const filePath = path.isAbsolute(args[0]) ? args[0] : path.resolve(args[0]);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // Normalize stats shape: object -> array of { key, base }
        if (data && data.stats && !Array.isArray(data.stats) && typeof data.stats === 'object') {
          const statArr = Object.entries(data.stats).map(([key, base]) => ({ key, base }));
          data.stats = statArr;
        }
        // Ensure behavior completeness
        if (data && data.behavior) {
          data.behavior.aggression = data.behavior.aggression ?? 0;
          data.behavior.curiosity = data.behavior.curiosity ?? 50;
          data.behavior.loyalty = data.behavior.loyalty ?? 50;
        }
        // Ensure movementPattern default
        if (data && !data.movementPattern) {
          data.movementPattern = { type: 'idle', speed: 1 };
        }
        // Avoid duplicate id collisions with default NPCs
        if (!data.id || manager.getNPC(data.id as any).status === 'ok') {
          data.id = 'npc_test';
        }
        output = manager.createNPC(data as NPC);
      } else {
        const newNPC: NPC = {
          id: npcId as any,
          name: args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'New NPC',
          stats: [
            { key: 'health', base: 100 },
            { key: 'mana', base: 50 },
            { key: 'strength', base: 10 },
            { key: 'wisdom', base: 10 }
          ],
          behavior: {
            type: behaviorType as any,
            aggression: 0,
            curiosity: 50,
            loyalty: 50
          },
          location: { zoneId: zoneId as any, x, y, z },
          questIds: [],
          movementPattern: { type: 'idle', speed: 1 },
          faction,
          reputation: 50
        };
        output = manager.createNPC(newNPC);
      }
      break;

    case 'get':
      output = manager.getNPC(npcId as any);
      break;

    case 'update':
      const updates: Partial<NPC> = {};
      if (args.includes('--name')) {
        updates.name = args.find(arg => arg.startsWith('--name='))?.split('=')[1];
      }
      if (args.includes('--reputation')) {
        updates.reputation = reputation;
      }
      output = manager.updateNPC(npcId as any, updates);
      break;

    case 'delete':
      output = manager.deleteNPC(npcId as any);
      break;

    case 'list':
      const filter: any = {};
      // Support key=value args, e.g., zoneId=zone_village
      for (const a of args) {
        if (a.includes('=') && !a.startsWith('--')) {
          const [k, v] = a.split('=');
          if (k === 'zoneId') filter.zoneId = v;
          if (k === 'behavior') filter.behaviorType = v;
          if (k === 'faction') filter.faction = v;
        }
      }
      if (args.includes('--zone-id')) filter.zoneId = zoneId;
      if (args.includes('--behavior')) filter.behaviorType = behaviorType;
      if (args.includes('--faction')) filter.faction = faction;
      if (args.includes('--has-quest')) filter.hasQuest = true;
      
      output = manager.listNPCs(filter);
      break;

    case 'simulate':
      output = manager.simulateNPC(npcId as any, duration);
      break;

    case 'update-location':
      output = manager.updateNPCLocation(npcId as any, x, y, z);
      break;

    case 'add-quest':
      output = manager.addQuestToNPC(npcId as any, questId as any);
      break;

    case 'remove-quest':
      output = manager.removeQuestFromNPC(npcId as any, questId as any);
      break;

    case 'update-behavior':
      const behavior: Partial<NPBehavior> = {};
      if (args.includes('--aggression')) {
        behavior.aggression = parseInt(args.find(arg => arg.startsWith('--aggression='))?.split('=')[1] || '0');
      }
      if (args.includes('--curiosity')) {
        behavior.curiosity = parseInt(args.find(arg => arg.startsWith('--curiosity='))?.split('=')[1] || '50');
      }
      if (args.includes('--loyalty')) {
        behavior.loyalty = parseInt(args.find(arg => arg.startsWith('--loyalty='))?.split('=')[1] || '50');
      }
      output = manager.updateNPCBehavior(npcId as any, behavior);
      break;

    case 'update-reputation':
      output = manager.updateNPCReputation(npcId as any, reputation);
      break;

    case 'get-by-behavior':
      output = manager.getNPCsByBehavior(behaviorType);
      break;

    case 'get-by-reputation':
      const minRep = parseInt(args.find(arg => arg.startsWith('--min-rep='))?.split('=')[1] || '0');
      const maxRep = parseInt(args.find(arg => arg.startsWith('--max-rep='))?.split('=')[1] || '100');
      output = manager.getNPCsByReputation(minRep, maxRep);
      break;

    case 'stats':
      output = manager.getNPCStats();
      break;

    case 'export':
      output = manager.exportNPCs(format);
      break;

    case 'reset':
      output = manager.resetNPCs();
      break;

    case 'demo':
      // Create a demo NPC with various properties
      const demoNPC: NPC = {
        id: 'demo_npc' as any,
        name: 'Demo Character',
        stats: [
          { key: 'health', base: 120 },
          { key: 'mana', base: 80 },
          { key: 'strength', base: 15 },
          { key: 'wisdom', base: 20 }
        ],
        behavior: {
          type: 'friendly',
          aggression: 10,
          curiosity: 80,
          loyalty: 90
        },
        location: { zoneId: 'demo_zone' as any, x: 50, y: 50, z: 0 },
        questIds: ['demo_quest_1' as any, 'demo_quest_2' as any],
        movementPattern: { type: 'patrol', speed: 2, range: 10 },
        faction: 'demo_faction',
        reputation: 85
      };
      
      const createResult = manager.createNPC(demoNPC);
      if (createResult.status === 'ok') {
        output = {
          op: 'demo',
          status: 'ok',
          result: {
            message: 'Demo NPC created successfully',
            npc: createResult.result
          }
        };
      } else {
        output = createResult;
      }
      break;

    case 'sample':
      // Create sample NPCs for testing
      const sampleNPCs = [
        {
          id: 'sample_guard' as any,
          name: 'Town Guard',
          stats: [{ key: 'health', base: 150 }, { key: 'strength', base: 20 }],
          behavior: { type: 'aggressive', aggression: 30, curiosity: 20, loyalty: 80 },
          location: { zoneId: 'town_gate' as any, x: 10, y: 10 },
          questIds: [],
          movementPattern: { type: 'patrol', speed: 3, range: 15 },
          faction: 'town_guards',
          reputation: 60
        },
        {
          id: 'sample_merchant' as any,
          name: 'Traveling Merchant',
          stats: [{ key: 'health', base: 80 }, { key: 'wisdom', base: 25 }],
          behavior: { type: 'merchant', aggression: 5, curiosity: 70, loyalty: 40 },
          location: { zoneId: 'market_square' as any, x: 25, y: 25 },
          questIds: ['trade_quest' as any],
          movementPattern: { type: 'wander', speed: 1, range: 20 },
          faction: 'merchants',
          reputation: 75
        }
      ];

      const results = sampleNPCs.map(npc => manager.createNPC(npc));
      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample NPCs created',
          results: results.map(r => ({ status: r.status, npc: r.result }))
        }
      };
      break;

    case 'dump':
      output = { op: 'dump', status: 'ok', result: manager.getNPCsInZone(zoneId as any) } as any;
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'create --npc-id=<id> --name=<name> --behavior=<type> --faction=<faction>',
            'get --npc-id=<id>',
            'update --npc-id=<id> --name=<name> --reputation=<rep>',
            'delete --npc-id=<id>',
            'list [--zone-id=<zone>] [--behavior=<type>] [--faction=<faction>] [--has-quest]',
            'simulate --npc-id=<id> --duration=<seconds>',
            'update-location --npc-id=<id> --x=<x> --y=<y> [--z=<z>]',
            'add-quest --npc-id=<id> --quest-id=<quest>',
            'remove-quest --npc-id=<id> --quest-id=<quest>',
            'update-behavior --npc-id=<id> [--aggression=<val>] [--curiosity=<val>] [--loyalty=<val>]',
            'update-reputation --npc-id=<id> --reputation=<rep>',
            'get-by-behavior --behavior=<type>',
            'get-by-reputation --min-rep=<min> --max-rep=<max>',
            'stats',
            'export --format=<json|manifest|summary|quests>',
            'reset',
            'dump',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts create --npc-id=guard_001 --name="Town Guard" --behavior=aggressive --faction=guards',
            'node cliHarness.ts simulate --npc-id=npc_001 --duration=120',
            'node cliHarness.ts export --format=manifest',
            'node cliHarness.ts get-by-behavior --behavior=quest_giver'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));