#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { RaidManager, RaidBoss, RaidParty, RaidEncounter, RaidEvent } from './Manager';
import { addExportSupport } from '../shared/exportUtils';

type Cmd =
  | { op: 'createBoss'; boss: RaidBoss }
  | { op: 'createParty'; party: RaidParty }
  | { op: 'startEncounter'; bossId: string; partyId: string; difficulty: string }
  | { op: 'processEncounter'; encounterId: string; events: RaidEvent[] }
  | { op: 'completeEncounter'; encounterId: string }
  | { op: 'getBoss'; bossId: string }
  | { op: 'getParty'; partyId: string }
  | { op: 'getEncounter'; encounterId: string }
  | { op: 'getAllBosses' }
  | { op: 'getAllParties' }
  | { op: 'getActiveEncounters' }
  | { op: 'getStatistics' }
  | { op: 'simulateRaid'; bossId: string; partyId: string; difficulty: string }
  | { op: 'exportRaidStats' }
  | { op: 'dump' };

function main() {
  const argv = process.argv.slice(2);
  
  if (argv.length === 0) {
    console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
    process.exit(1);
  }

  try {
    const first = argv[0];
    let operation: Cmd;

    // Handle direct command or JSON file input
    if (first.endsWith('.json') && fs.existsSync(first)) {
      const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
      operation = content as Cmd;
    } else {
      // Parse subcommand
      switch (first) {
        case 'createBoss':
          if (!argv[1]) {
            throw new Error('createBoss requires boss data JSON file');
          }
          const bossData = JSON.parse(fs.readFileSync(argv[1], 'utf-8'));
          operation = { op: 'createBoss', boss: bossData };
          break;
        case 'createParty':
          if (!argv[1]) {
            throw new Error('createParty requires party data JSON file');
          }
          const partyData = JSON.parse(fs.readFileSync(argv[1], 'utf-8'));
          operation = { op: 'createParty', party: partyData };
          break;
        case 'startEncounter':
          if (!argv[1] || !argv[2] || !argv[3]) {
            throw new Error('startEncounter requires bossId, partyId, and difficulty');
          }
          operation = { 
            op: 'startEncounter', 
            bossId: argv[1],
            partyId: argv[2],
            difficulty: argv[3]
          };
          break;
        case 'processEncounter':
          if (!argv[1] || !argv[2]) {
            throw new Error('processEncounter requires encounterId and events JSON file');
          }
          const eventsData = JSON.parse(fs.readFileSync(argv[2], 'utf-8'));
          operation = { 
            op: 'processEncounter', 
            encounterId: argv[1],
            events: eventsData
          };
          break;
        case 'completeEncounter':
          if (!argv[1]) {
            throw new Error('completeEncounter requires encounterId');
          }
          operation = { op: 'completeEncounter', encounterId: argv[1] };
          break;
        case 'getBoss':
          if (!argv[1]) {
            throw new Error('getBoss requires bossId');
          }
          operation = { op: 'getBoss', bossId: argv[1] };
          break;
        case 'getParty':
          if (!argv[1]) {
            throw new Error('getParty requires partyId');
          }
          operation = { op: 'getParty', partyId: argv[1] };
          break;
        case 'getEncounter':
          if (!argv[1]) {
            throw new Error('getEncounter requires encounterId');
          }
          operation = { op: 'getEncounter', encounterId: argv[1] };
          break;
        case 'getAllBosses':
          operation = { op: 'getAllBosses' };
          break;
        case 'getAllParties':
          operation = { op: 'getAllParties' };
          break;
        case 'getActiveEncounters':
          operation = { op: 'getActiveEncounters' };
          break;
        case 'getStatistics':
          operation = { op: 'getStatistics' };
          break;
        case 'simulateRaid':
          if (!argv[1] || !argv[2] || !argv[3]) {
            throw new Error('simulateRaid requires bossId, partyId, and difficulty');
          }
          operation = { 
            op: 'simulateRaid', 
            bossId: argv[1],
            partyId: argv[2],
            difficulty: argv[3]
          };
          break;
        case 'exportRaidStats':
          operation = { op: 'exportRaidStats' };
          break;
        case 'dump':
          operation = { op: 'dump' };
          break;
        default:
          throw new Error(`Unknown command: ${first}`);
      }
    }

    const raidManager = new RaidManager();
    let result: any;

    switch (operation.op) {
      case 'createBoss':
        result = raidManager.createBoss(operation.boss);
        break;

      case 'createParty':
        result = raidManager.createParty(operation.party);
        break;

      case 'startEncounter':
        const encounter = raidManager.startEncounter(
          operation.bossId, 
          operation.partyId, 
          operation.difficulty as any
        );
        result = {
          started: encounter !== null,
          encounter: encounter || null
        };
        break;

      case 'processEncounter':
        const updatedEncounter = raidManager.processEncounter(operation.encounterId, operation.events);
        result = {
          processed: updatedEncounter !== null,
          encounter: updatedEncounter || null
        };
        break;

      case 'completeEncounter':
        const raidResult = raidManager.completeEncounter(operation.encounterId);
        result = {
          completed: raidResult !== null,
          result: raidResult || null
        };
        break;

      case 'getBoss':
        const boss = raidManager.getBoss(operation.bossId);
        result = {
          found: boss !== null,
          boss: boss || null
        };
        break;

      case 'getParty':
        const party = raidManager.getParty(operation.partyId);
        result = {
          found: party !== null,
          party: party || null
        };
        break;

      case 'getEncounter':
        const encounterData = raidManager.getEncounter(operation.encounterId);
        result = {
          found: encounterData !== null,
          encounter: encounterData || null
        };
        break;

      case 'getAllBosses':
        result = {
          bosses: raidManager.getAllBosses(),
          count: raidManager.getAllBosses().length
        };
        break;

      case 'getAllParties':
        result = {
          parties: raidManager.getAllParties(),
          count: raidManager.getAllParties().length
        };
        break;

      case 'getActiveEncounters':
        result = {
          encounters: raidManager.getActiveEncounters(),
          count: raidManager.getActiveEncounters().length
        };
        break;

      case 'getStatistics':
        result = raidManager.getRaidStatistics();
        break;

      case 'simulateRaid':
        // Simulate a complete raid encounter
        const simEncounter = raidManager.startEncounter(
          operation.bossId, 
          operation.partyId, 
          operation.difficulty as any
        );
        
        if (!simEncounter) {
          result = { error: 'Failed to start encounter' };
          break;
        }

        // Generate simulated events
        const simulatedEvents: RaidEvent[] = [];
        const startTime = Date.now();
        
        for (let i = 0; i < 10; i++) {
          simulatedEvents.push({
            timestamp: startTime + (i * 1000),
            type: 'damage',
            source: `member_${i % 4}`,
            target: operation.bossId,
            value: Math.floor(Math.random() * 100) + 50,
            description: `Attack ${i + 1}`
          });
        }

        // Process events and complete encounter
        raidManager.processEncounter(simEncounter.id, simulatedEvents);
        const simResult = raidManager.completeEncounter(simEncounter.id);
        
        result = {
          simulation: {
            encounter: simEncounter,
            events: simulatedEvents,
            result: simResult
          }
        };
        break;

      case 'exportRaidStats':
        result = raidManager.exportRaidStats();
        break;

      case 'dump':
        result = {
          operations: [
            'createBoss', 'createParty', 'startEncounter', 'processEncounter',
            'completeEncounter', 'getBoss', 'getParty', 'getEncounter',
            'getAllBosses', 'getAllParties', 'getActiveEncounters',
            'getStatistics', 'simulateRaid', 'exportRaidStats', 'dump'
          ],
          description: 'RaidSystemPure - Enemy scaling and raid management',
          features: [
            'Boss creation and scaling by difficulty',
            'Party management and member tracking',
            'Encounter simulation and processing',
            'Loot table management and rewards',
            'Real-time event processing',
            'Performance statistics and analytics',
            'Multi-difficulty scaling system'
          ],
          difficulties: ['normal', 'heroic', 'mythic', 'legendary'],
          bossStructure: {
            id: 'string - Unique boss identifier',
            name: 'string - Boss display name',
            level: 'number - Boss level',
            health: 'number - Current health',
            maxHealth: 'number - Maximum health',
            attack: 'number - Attack power',
            defense: 'number - Defense value',
            abilities: 'RaidAbility[] - Boss abilities',
            lootTable: 'LootEntry[] - Loot drops',
            scalingFactor: 'number - Difficulty scaling'
          },
          partyStructure: {
            id: 'string - Party identifier',
            name: 'string - Party name',
            members: 'RaidMember[] - Party members',
            averageLevel: 'number - Average member level',
            totalHealth: 'number - Combined health',
            totalDamage: 'number - Combined damage',
            buffs: 'RaidEffect[] - Active buffs',
            debuffs: 'RaidEffect[] - Active debuffs'
          }
        };
        break;

      default:
        throw new Error(`Unknown operation: ${operation.op}`);
    }

    // Check for export format option
    const exportFormatArg = argv.find(arg => arg.startsWith('--format='))?.split('=')[1] || 
                           argv[argv.indexOf('--format') + 1];
    const validFormats = ['json', 'csv', 'markdown', 'html', 'yaml', 'xml'];
    const exportFormat = validFormats.includes(exportFormatArg) ? exportFormatArg : undefined;

    // Handle export format
    const { result: finalResult, exportData } = addExportSupport(
      result,
      exportFormat,
      'RaidSystemPure Export',
      'Raid management and encounter simulation data'
    );

    // Output in JSON envelope format
    console.log(JSON.stringify({
      op: operation.op,
      status: 'ok',
      result: finalResult,
      timestamp: Date.now()
    }, null, 2));

    // Output export data to stderr if available
    if (exportData) {
      console.error('\n' + exportData);
    }

  } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
    console.error(JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }, null, 2));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}