#!/usr/bin/env tsx

import { NPCsManager, NPC, StatBlock } from './Manager';
import * as fs from 'fs';
import * as path from 'path';

interface NPCsOperationInput {
	op: 'list' | 'create' | 'update' | 'delete' | 'simulate' | 'dump' | 'get';
	npcId?: string;
	data?: Record<string, unknown>;
	duration?: number;
}

function main() {
	const mgr = new NPCsManager();

	// Support two invocation styles:
	// 1) Subcommand args: cliHarness.ts <op> [...args]
	// 2) JSON file arg:  cliHarness.ts <json-file>
	const argv = process.argv.slice(2);
	if (argv.length === 0) {
		console.error('Usage: tsx cliHarness.ts <op|json-file> [args]');
		process.exit(1);
	}

	let op: NPCsOperationInput | null = null;
	const first = argv[0];
	const isJsonFile = first.endsWith('.json') && fs.existsSync(first);

	try {
		if (isJsonFile) {
			// JSON file may contain an array of ops or a single op
			const content = JSON.parse(fs.readFileSync(first, 'utf-8'));
			if (Array.isArray(content)) {
				// Execute first op only for this harness to match test expectations
				op = content[0] as NPCsOperationInput;
			} else {
				op = content as NPCsOperationInput;
			}
		} else {
			// Parse subcommand
			switch (first) {
				case 'list': {
					const filterArg = argv[1];
					let filter: any = undefined;
					if (filterArg && filterArg.includes('=')) {
						const [key, value] = filterArg.split('=');
						if (key === 'zoneId') filter = { zoneId: value };
					}
					const result = mgr.listNPCs(filter);
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				case 'simulate': {
					const npcId = argv[1];
					const duration = Number(argv[2] || '0');
					const result = mgr.simulateNPC(npcId, duration);
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				case 'create': {
					const file = argv[1];
					if (!file) throw new Error('create requires a JSON file');
					const npc: NPC = JSON.parse(fs.readFileSync(file, 'utf-8'));
					const result = mgr.createNPC(npc);
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				case 'get': {
					const npcId = argv[1];
					const result = mgr.getNPC(npcId);
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				case 'delete': {
					const npcId = argv[1];
					const result = mgr.deleteNPC(npcId);
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				case 'dump': {
					// Dump all NPCs via list
					const result = mgr.listNPCs();
					result.op = 'dump';
					console.log(JSON.stringify(result, null, 2));
					return;
				}
				default:
					throw new Error(`Unknown command: ${first}`);
			}
		}

		if (!op || typeof op !== 'object') {
			throw new Error('Invalid input: expected operation');
		}

		let out;
		switch (op.op) {
			case 'list':
				out = mgr.listNPCs();
				break;
			case 'create':
				if (!op.data || !op.npcId) throw new Error('create requires npcId and data');
				out = mgr.createNPC({
					id: op.npcId,
					name: (op.data.name as string) || 'Unknown',
					stats: (op.data.stats as StatBlock) || [],
					behavior: { type: 'passive', aggression: 0, curiosity: 50, loyalty: 50 },
					location: { zoneId: 'default', x: 0, y: 0 },
					questIds: [],
					movementPattern: { type: 'idle', speed: 1 }
				});
				break;
			case 'update':
				if (!op.npcId || !op.data) throw new Error('update requires npcId and data');
				out = mgr.updateNPC(op.npcId, op.data as Partial<NPC>);
				break;
			case 'delete':
				if (!op.npcId) throw new Error('delete requires npcId');
				out = mgr.deleteNPC(op.npcId);
				break;
			case 'simulate':
				if (!op.npcId || typeof op.duration !== 'number') throw new Error('simulate requires npcId and duration');
				out = mgr.simulateNPC(op.npcId, op.duration);
				break;
			case 'get':
				if (!op.npcId) throw new Error('get requires npcId');
				out = mgr.getNPC(op.npcId);
				break;
			case 'dump':
				out = mgr.listNPCs();
				(out as any).op = 'dump';
				break;
			default:
				throw new Error(`Unknown op: ${(op as any).op}`);
		}

		console.log(JSON.stringify(out, null, 2));
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
}

if(import.meta.url === `file://${process.argv[1]}`) main();