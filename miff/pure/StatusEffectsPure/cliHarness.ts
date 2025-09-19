#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { StatusEffectsManager, StatusEffect } from './StatusEffectsManager';

type Cmd =
  | { op: 'list' }
  | { op: 'simulate'; id: string }
  | { op: 'dump'; id: string }
  | { op: 'create'; id: string; maxHp: number; effects?: StatusEffect[] }
  | { op: 'apply'; id: string; effect: Omit<StatusEffect, 'appliedAt' | 'expiresAt' | 'currentStacks'> }
  | { op: 'remove'; id: string; effectId: string };

function main() {
  const statusPath = process.argv[2] || 'StatusEffectsPure/sample_status.json';
  const commandsPath = process.argv[3] || '';
  
  const obj = JSON.parse(fs.readFileSync(path.resolve(statusPath), 'utf-8')) as { 
    entities: Array<{ id: string; hp: number; effects: Array<{ id: string; type: string; magnitude: number; duration: number }> }> 
  };

  const log: string[] = [];
  const mgr = new StatusEffectsManager();

  // Load entities from status file
  for (const entity of obj.entities) {
    // Convert simplified effects to full StatusEffect objects
    const fullEffects: StatusEffect[] = entity.effects.map(effect => ({
      id: effect.id,
      name: `${effect.type} effect`,
      type: 'debuff' as any, // Default to debuff for poison, burn, etc.
      category: effect.type as any,
      magnitude: effect.magnitude,
      duration: effect.duration,
      stackable: true,
      maxStacks: 5,
      currentStacks: 1,
      source: 'system',
      appliedAt: Date.now(),
      expiresAt: Date.now() + (effect.duration * 1000)
    }));
    
    mgr.createEntity(entity.id, entity.hp, fullEffects);
  }

  const cmds: Cmd[] = commandsPath ? JSON.parse(fs.readFileSync(path.resolve(commandsPath), 'utf-8')) : [{ op: 'list' } as Cmd];
  const outputs: any[] = [];

  for (const c of cmds) {
    if (c.op === 'list') {
      const entities = mgr.listEntities({});
      outputs.push({ op: 'list', ids: entities.result?.map(e => e.id) || [] });
    } else if (c.op === 'simulate') {
      const result = mgr.simulateEntity(c.id);
      if (result.status === 'ok' && result.result) {
        outputs.push({ id: c.id, hpDelta: result.result.hpDelta || 0 });
      }
    } else if (c.op === 'dump') {
      const result = mgr.getEntity(c.id);
      if (result.status === 'ok' && result.result) {
        outputs.push({ op: 'dump', id: c.id, effects: result.result.effects || [] });
      }
    } else if (c.op === 'create') {
      const result = mgr.createEntity(c.id, c.maxHp, c.effects || []);
      outputs.push({ op: 'create', id: c.id, status: result.status });
    } else if (c.op === 'apply') {
      const result = mgr.applyEffect(c.id, c.effect);
      outputs.push({ op: 'apply', id: c.id, effectId: c.effect.id, status: result.status });
    } else if (c.op === 'remove') {
      const result = mgr.removeEffect(c.id, c.effectId);
      outputs.push({ op: 'remove', id: c.id, effectId: c.effectId, status: result.status });
    }
  }

  const out = { log, outputs };
  console.log(JSON.stringify(out, null, 2));
}

if(import.meta.url === `file://${process.argv[1]}`) main();