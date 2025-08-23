#!/usr/bin/env -S node --no-warnings
import fs from 'fs';

interface DialogNode { id: string; text: string; next_id?: string; questId?: string; questStep?: number; questStatus?: string; requireQuestId?: string; requireStatus?: string; requireMinStep?: number; }
interface NPC { name: string; start_id: string; dialog: DialogNode[] }
interface QuestEntry { id: string; step: number; status: 'Active'|'Completed'|'Failed' }

class QuestState {
  entries = new Map<string, QuestEntry>();
  get(id: string): QuestEntry { if (!this.entries.has(id)) this.entries.set(id, {id, step:0, status:'Active'}); return this.entries.get(id)!; }
  set(id: string, step: number, status?: QuestEntry['status']) { const e = this.get(id); e.step = step; if (status) e.status = status; }
  toJSON() { return Array.from(this.entries.values()); }
}

function simulate(npc: NPC, seed: number) {
  const quest = new QuestState();
  const log: string[] = [];
  const map = new Map(npc.dialog.map(d => [d.id, d] as const));
  let cur = npc.start_id; const visited = new Set<string>();
  while (cur) {
    if (visited.has(cur)) { log.push(`Loop detected at ${cur}; stopping`); break; }
    visited.add(cur);
    const node = map.get(cur)!; // assume valid
    // gating
    if (node.requireQuestId) {
      const e = quest.get(node.requireQuestId);
      let ok = true;
      if (node.requireStatus) ok = ok && e.status === node.requireStatus;
      if (node.requireMinStep != null && node.requireMinStep >= 0) ok = ok && e.step >= node.requireMinStep;
      if (!ok) break;
    }
    log.push(`NPC: ${node.text}`);
    if (node.questId) {
      quest.set(node.questId, node.questStep ?? quest.get(node.questId).step, node.questStatus as any);
      log.push(`QUEST: ${node.questId} -> step=${quest.get(node.questId).step} status=${quest.get(node.questId).status}`);
    }
    cur = node.next_id ?? '';
  }
  return { seed, log, quests: quest.toJSON() };
}

function main() {
  const npcPath = process.argv[2];
  if (!npcPath) { console.error('Usage: cliHarness.ts <npc.json>'); process.exit(1); }
  const npc: NPC = JSON.parse(fs.readFileSync(npcPath,'utf-8'));
  const seed = Number(process.argv[3] ?? 1234);
  const out = simulate(npc, seed);
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();