#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { AIProfileManager, Role } from './AIProfileManager';

type Cmd =
  | { op: 'listProfiles' }
  | { op: 'simulateBehavior'; npcId: string }
  | { op: 'dumpSchedule'; npcId: string }
  | { op: 'assignRole'; npcId: string; role: Role }
  | { op: 'linkDialog'; npcId: string; dialogId: string }
  | { op: 'linkQuest'; npcId: string; questId: string };

function main() {
  const profilesPath = process.argv[2] || 'AIProfilesPure/sample_profiles.json';
  const commandsPath = process.argv[3] || '';
  const obj = JSON.parse(fs.readFileSync(path.resolve(profilesPath), 'utf-8')) as { profiles: any[] };

  const log: string[] = [];
  const mgr = new AIProfileManager({
    onNPCInteract: (id, role) => log.push(`INTERACT ${id} ${role}`),
    onScheduleTrigger: (id, e) => log.push(`SCHEDULE ${id} ${e.time} ${e.action}`),
    onRoleAssigned: (id, role) => log.push(`ROLE ${id} ${role}`),
  });
  mgr.load(obj.profiles);

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'listProfiles' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'listProfiles') outputs.push({ op: 'listProfiles', profiles: mgr.listProfiles() });
    else if (c.op === 'simulateBehavior') outputs.push(mgr.simulateBehavior(c.npcId));
    else if (c.op === 'dumpSchedule') outputs.push({ op: 'dumpSchedule', schedule: mgr.getSchedule(c.npcId) });
    else if (c.op === 'assignRole') { mgr.assignRole(c.npcId, c.role); outputs.push({ op: 'assignRole', npcId: c.npcId, role: c.role }); }
    else if (c.op === 'linkDialog') { mgr.linkDialog(c.npcId, c.dialogId); outputs.push({ op: 'linkDialog', npcId: c.npcId, dialogId: c.dialogId }); }
    else if (c.op === 'linkQuest') { mgr.linkQuest(c.npcId, c.questId); outputs.push({ op: 'linkQuest', npcId: c.npcId, questId: c.questId }); }
  }

  console.log(JSON.stringify({ log, outputs }, null, 2));
}

if (require.main === module) main();

