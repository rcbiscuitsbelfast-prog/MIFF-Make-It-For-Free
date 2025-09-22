#!/usr/bin/env tsx

import { AIProfileManager, Role } from './AIProfileManager';
import * as fs from 'fs';
import * as path from 'path';

interface AIProfileOperation {
  op: 'listProfiles' | 'simulateBehavior' | 'dumpSchedule' | 'assignRole' | 'linkDialog' | 'linkQuest';
  npcId?: string;
  role?: Role;
  dialogId?: string;
  questId?: string;
}

function parseFlags(argv: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.replace(/^--/, '');
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      out[key] = /^\d+(?:\.\d+)?$/.test(next) ? Number(next) : next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function printHelp(): void {
  console.log('AIProfilesPure CLI - AI profile management for NPCs');
  console.log('');
  console.log('Usage:');
  console.log('  tsx cliHarness.ts <commands.json> [--flags]');
  console.log('  tsx cliHarness.ts <profilesPath> <commands.json> [--flags]');
  console.log('');
  console.log('Examples:');
  console.log('  tsx cliHarness.ts commands.json');
  console.log('  tsx cliHarness.ts sample_profiles.json commands.json');
}

function main() {
  const [arg1, arg2, ...rest] = process.argv.slice(2);
  
  if (!arg1 || arg1 === 'help' || arg1 === '--help' || arg1 === '-h') {
    printHelp();
    return;
  }

  try {
    let profilesPath: string;
    let commandsPath: string;
    
    if (arg2 && fs.existsSync(arg2)) {
      profilesPath = path.resolve(arg1);
      commandsPath = path.resolve(arg2);
    } else {
      profilesPath = path.resolve('AIProfilesPure/sample_profiles.json');
      commandsPath = path.resolve(arg1);
    }

    if (!fs.existsSync(profilesPath)) {
      console.log(`Error: Profiles file not found: ${profilesPath}`);
      process.exitCode = 1;
      return;
    }

    if (!fs.existsSync(commandsPath)) {
      console.log(`Error: Commands file not found: ${commandsPath}`);
      process.exitCode = 1;
      return;
    }

    const obj = JSON.parse(fs.readFileSync(profilesPath, 'utf-8')) as { profiles: any[] };
    const cmds: AIProfileOperation[] = JSON.parse(fs.readFileSync(commandsPath, 'utf-8'));
    
    const mgr = new AIProfileManager({
      onNPCInteract: (id, role) => {},
      onScheduleTrigger: (id, e) => {},
      onRoleAssigned: (id, role) => {},
    });
    mgr.loadProfiles(obj.profiles);

    const results: { op: string; status: string; result?: any }[] = [];

    for (const cmd of cmds) {
      try {
        let result: any;
        
        switch (cmd.op) {
          case 'listProfiles':
            result = { profiles: mgr.listProfiles() };
            break;
          case 'simulateBehavior':
            if (!cmd.npcId) throw new Error('npcId required for simulateBehavior');
            result = mgr.simulateBehavior(cmd.npcId);
            break;
          case 'dumpSchedule':
            if (!cmd.npcId) throw new Error('npcId required for dumpSchedule');
            result = { schedule: mgr.getSchedule(cmd.npcId) };
            break;
          case 'assignRole':
            if (!cmd.npcId || !cmd.role) throw new Error('npcId and role required for assignRole');
            mgr.assignRole(cmd.npcId, cmd.role);
            result = { npcId: cmd.npcId, role: cmd.role };
            break;
          case 'linkDialog':
            if (!cmd.npcId || !cmd.dialogId) throw new Error('npcId and dialogId required for linkDialog');
            mgr.linkDialog(cmd.npcId, cmd.dialogId);
            result = { npcId: cmd.npcId, dialogId: cmd.dialogId };
            break;
          case 'linkQuest':
            if (!cmd.npcId || !cmd.questId) throw new Error('npcId and questId required for linkQuest');
            mgr.linkQuest(cmd.npcId, cmd.questId);
            result = { npcId: cmd.npcId, questId: cmd.questId };
            break;
          default:
            throw new Error(`Unknown operation: ${cmd.op}`);
        }
        
        results.push({ op: cmd.op, status: 'ok', result });
      } catch (error) {
        results.push({ op: cmd.op, status: 'error', result: { error: error.message } });
      }
    }

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  }
}

if(import.meta.url === `file://${process.argv[1]}`) main();

