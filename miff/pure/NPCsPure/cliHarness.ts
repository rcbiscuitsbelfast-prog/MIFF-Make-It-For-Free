#!/usr/bin/env tsx

import { NPCsManager, NPC, StatBlock } from './Manager';
import * as fs from 'fs';
import * as path from 'path';

interface NPCsOperation {
  op: 'list' | 'create' | 'update' | 'delete' | 'simulate' | 'dump';
  npcId?: string;
  data?: Record<string, unknown>;
  duration?: number;
}

function main() {
  const sampleFile = process.argv[2] || 'NPCsPure/sample_npcs.json';
  const commandsFile = process.argv[3] || '';
  
  const mgr = new NPCsManager();
  
  // Load sample data if available
  if (fs.existsSync(sampleFile)) {
    const sample = JSON.parse(fs.readFileSync(sampleFile, 'utf-8'));
    if (sample.npcs && Array.isArray(sample.npcs)) {
      for (const npc of sample.npcs) {
        mgr.create(npc.id, npc.name, npc.position, npc.stats);
      }
    }
  }
  
  // Load commands
  const commands: NPCsOperation[] = commandsFile && fs.existsSync(commandsFile)
    ? JSON.parse(fs.readFileSync(commandsFile, 'utf-8'))
    : [{ op: 'list' }];
  
  const outputs: Record<string, unknown>[] = [];
  
  for (const cmd of commands) {
    switch (cmd.op) {
      case 'list':
        const listResult = mgr.listNPCs();
        outputs.push({
          op: 'list',
          npcs: listResult.status === 'ok' && listResult.result 
            ? (listResult.result as NPC[]).map(npc => ({ 
                id: npc.id, 
                name: npc.name, 
                position: { x: npc.location.x, y: npc.location.y } 
              }))
            : []
        });
        break;
        
      case 'create':
        if (cmd.npcId && cmd.data) {
          const npc: NPC = {
            id: cmd.npcId,
            name: cmd.data.name as string || 'Unknown',
            stats: cmd.data.stats as StatBlock || {},
            behavior: {
              type: 'passive',
              aggression: 0,
              curiosity: 50,
              loyalty: 50
            },
            location: {
              zoneId: 'default',
              x: (cmd.data.position as { x: number; y: number })?.x || 0,
              y: (cmd.data.position as { x: number; y: number })?.y || 0
            },
            questIds: [],
            movementPattern: {
              type: 'idle',
              speed: 1
            }
          };
          const result = mgr.createNPC(npc);
          outputs.push(result);
        }
        break;
        
      case 'update':
        if (cmd.npcId && cmd.data) {
          const result = mgr.updateNPC(cmd.npcId, cmd.data);
          outputs.push(result);
        }
        break;
        
      case 'delete':
        if (cmd.npcId) {
          const result = mgr.deleteNPC(cmd.npcId);
          outputs.push(result);
        }
        break;
        
      case 'simulate':
        if (cmd.npcId && cmd.duration) {
          const result = mgr.simulateNPC(cmd.npcId, cmd.duration);
          outputs.push(result);
        }
        break;
        
      case 'dump':
        if (cmd.npcId) {
          const result = mgr.getNPC(cmd.npcId);
          outputs.push(result);
        }
        break;
    }
  }
  
  console.log(JSON.stringify({ outputs }, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();