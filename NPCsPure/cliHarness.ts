import fs from 'fs';
import path from 'path';
import { NPCsManager, NPC, NPCOperation, NPCOutput } from './Manager';

const manager = new NPCsManager();

function printUsage(): void {
  console.log(`
NPCsPure CLI Harness - Schema v13

Usage: npx ts-node NPCsPure/cliHarness.ts <command> [args...]

Commands:
  list [filter]           - List all NPCs (optional filter: zoneId, behaviorType, faction, hasQuest)
  create <npcFile>        - Create NPC from JSON file
  update <npcId> <file>   - Update NPC from JSON file
  delete <npcId>          - Delete NPC by ID
  get <npcId>             - Get NPC by ID
  simulate <npcId> <duration> - Simulate NPC behavior for duration (seconds)
  dump                    - Dump all NPCs to JSON

Examples:
  npx ts-node NPCsPure/cliHarness.ts list
  npx ts-node NPCsPure/cliHarness.ts list zoneId=zone_village
  npx ts-node NPCsPure/cliHarness.ts create sample_npcs.json
  npx ts-node NPCsPure/cliHarness.ts simulate npc_001 3600
  npx ts-node NPCsPure/cliHarness.ts dump
`);
}

function parseFilter(filterStr: string): any {
  const filter: any = {};
  const parts = filterStr.split('=');
  if (parts.length === 2) {
    const [key, value] = parts;
    switch (key) {
      case 'zoneId':
      case 'faction':
      case 'behaviorType':
        filter[key] = value;
        break;
      case 'hasQuest':
        filter.hasQuest = value === 'true';
        break;
    }
  }
  return filter;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  const command = args[0];
  let result: NPCOutput;

  try {
    switch (command) {
      case 'list':
        const filterStr = args[1];
        const filter = filterStr ? parseFilter(filterStr) : undefined;
        result = manager.listNPCs(filter);
        break;

      case 'create':
        if (args.length < 2) {
          console.error('Error: Missing NPC file path');
          process.exit(1);
        }
        const npcFile = args[1];
        const npcData = JSON.parse(fs.readFileSync(npcFile, 'utf-8'));
        result = manager.createNPC(npcData);
        break;

      case 'update':
        if (args.length < 3) {
          console.error('Error: Missing NPC ID and update file');
          process.exit(1);
        }
        const npcId = args[1];
        const updateFile = args[2];
        const updateData = JSON.parse(fs.readFileSync(updateFile, 'utf-8'));
        result = manager.updateNPC(npcId, updateData);
        break;

      case 'delete':
        if (args.length < 2) {
          console.error('Error: Missing NPC ID');
          process.exit(1);
        }
        result = manager.deleteNPC(args[1]);
        break;

      case 'get':
        if (args.length < 2) {
          console.error('Error: Missing NPC ID');
          process.exit(1);
        }
        result = manager.getNPC(args[1]);
        break;

      case 'simulate':
        if (args.length < 3) {
          console.error('Error: Missing NPC ID and duration');
          process.exit(1);
        }
        const simNpcId = args[1];
        const duration = parseInt(args[2]);
        if (isNaN(duration)) {
          console.error('Error: Duration must be a number');
          process.exit(1);
        }
        result = manager.simulateNPC(simNpcId, duration);
        break;

      case 'dump':
        result = manager.listNPCs();
        break;

      default:
        console.error(`Error: Unknown command '${command}'`);
        printUsage();
        process.exit(1);
    }

    // Output in standardized format
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    const errorResult: NPCOutput = {
      op: command,
      status: 'error',
      issues: [error instanceof Error ? error.message : String(error)]
    };
    console.log(JSON.stringify(errorResult, null, 2));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}