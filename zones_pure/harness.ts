#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { ZoneManager, ZoneTrigger } from './ZoneManager';

type Command =
  | { op: 'defineZone'; id: string; name?: string; tags?: string[] }
  | { op: 'setFlag'; key: string; value: string | number | boolean }
  | { op: 'registerTrigger'; trigger: ZoneTrigger }
  | { op: 'enter'; id: string }
  | { op: 'exit'; id: string }
  | { op: 'interact'; id?: string };

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: zones_pure/harness.ts <commands.json>');
    process.exit(1);
  }
  const cmds: Command[] = JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'));

  const log: string[] = [];
  // Very small in-memory deps used for simulation/golden
  const inventory = new Map<string, number>();
  const quests = new Map<string, { step: number; status: 'Active' | 'Completed' | 'Failed' }>();
  const world: { light?: string; overlay?: string[] } = { overlay: [] } as any;

  const mgr = new ZoneManager({
    logger: (m) => log.push(m),
    dialog: { startDialog: (id) => log.push(`DIALOG_START ${id}`) },
    inventory: {
      addItem: (id, q) => inventory.set(id, (inventory.get(id) || 0) + q),
      hasItem: (id, q) => (inventory.get(id) || 0) >= q,
    },
    quests: {
      setFlag: (qid, step, status) => {
        const cur = quests.get(qid) || { step: 0, status: 'Active' as const };
        if (step != null) cur.step = step;
        if (status) cur.status = status;
        quests.set(qid, cur);
      },
      getState: (qid) => quests.get(qid),
    },
    world: {
      setLightingPreset: (p) => {
        world.light = p; log.push(`LIGHT_SET ${p}`);
      },
      overlay: (a, c, d) => {
        const s = `OVERLAY_${a}${c ? '_' + c : ''}_${d ?? 0}`;
        (world.overlay as string[]).push(s);
      },
    },
  });

  for (const c of cmds) {
    if (c.op === 'defineZone') mgr.defineZone({ id: c.id, name: c.name, tags: c.tags });
    else if (c.op === 'setFlag') mgr.setFlag(c.key, c.value);
    else if (c.op === 'registerTrigger') mgr.registerTrigger(c.trigger);
    else if (c.op === 'enter') mgr.enter(c.id);
    else if (c.op === 'exit') mgr.exit(c.id);
    else if (c.op === 'interact') mgr.interact(c.id);
  }

  const out = {
    log,
    zone: mgr.getCurrentZone(),
    inventory: Array.from(inventory.entries()).map(([id, quantity]) => ({ id, quantity })),
    quests: Array.from(quests.entries()).map(([id, s]) => ({ id, step: s.step, status: s.status })),
    world,
  };
  console.log(JSON.stringify(out, null, 2));
}

if (require.main === module) main();

