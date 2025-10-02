#!/usr/bin/env tsx
/**
 * RenderWorld Game Loop (pure-state integration)
 * - Loads session state
 * - Applies input to PlayerStatePure
 * - Advances JointAnimPure based on player anim
 * - Persists snapshot
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { createPlayerState, reducePlayer } from '../miff/pure/PlayerStatePure/index';
import { createRigState, reduceAnim, RigConfig } from '../miff/pure/JointAnimPure/index';

type Snapshot = {
  player: ReturnType<typeof createPlayerState>;
  rig: ReturnType<typeof createRigState>;
  t: number;
  quest?: { id: string; step: string };
  dialogue?: { lastNpc?: string; line?: string };
};

const sessionPath = '/workspace/session/sessionState.json';
const inputPath = '/workspace/session/input.json';

function loadJSON<T>(p: string, fallback: T): T {
  try { return JSON.parse(readFileSync(p, 'utf-8')) as T; } catch { return fallback; }
}

const rigConfig: RigConfig = {
  joints: ['root','spine','neck','head','shoulder_l','shoulder_r','elbow_l','elbow_r','hand_l','hand_r','hip_l','hip_r','knee_l','knee_r','foot_l','foot_r'],
  defaultPose: { name: 'idle', joints: { spine: { rot: 0 } } },
  poses: [
    { name: 'idle', joints: { spine: { rot: 0 } } },
    { name: 'walk_a', joints: { knee_l: { rot: 10 }, knee_r: { rot: -10 } } },
    { name: 'walk_b', joints: { knee_l: { rot: -10 }, knee_r: { rot: 10 } } },
    { name: 'interact', joints: { hand_r: { rot: 20 } } }
  ],
  transitions: [ { from: '*', to: 'walk_a', blendMs: 120 }, { from: 'walk_a', to: 'walk_b', blendMs: 120 }, { from: '*', to: 'idle', blendMs: 150 }, { from: '*', to: 'interact', blendMs: 160 } ]
};

function ensureDir(p: string) { try { mkdirSync(p, { recursive: true }); } catch {} }

function main() {
  ensureDir('/workspace/session');
  const fallback: Snapshot = { player: createPlayerState(), rig: createRigState(rigConfig), t: 0 };
  const raw = loadJSON<any>(sessionPath, fallback as any);
  const snap: Snapshot = {
    player: raw?.player && raw.player.pos && raw.player.vel ? raw.player : fallback.player,
    rig: raw?.rig && raw.rig.joints ? raw.rig : fallback.rig,
    t: typeof raw?.t === 'number' ? raw.t : 0
  };
  const input = loadJSON<{ move?: { x:number;y:number }, interact?: string, dt?: number }>(inputPath, { dt: 16 });

  // Apply input → player
  let p = snap.player;
  if (input.move) {
    p = reducePlayer(p, { type: 'move', dir: input.move }, { speed: 0.01 });
  } else {
    p = reducePlayer(p, { type: 'stop' }, { speed: 0.01 });
  }
  if (input.interact) {
    p = reducePlayer(p, { type: 'interact', target: input.interact }, { speed: 0.01 });
  }
  p = reducePlayer(p, { type: 'tick', dt: input.dt || 16 }, { speed: 0.01 });

  // Dialogue/Quest integration on interaction
  let quest = snap.quest;
  let dialogue = snap.dialogue;
  if (p.anim === 'interact' && p.interactable) {
    dialogue = { lastNpc: p.interactable, line: 'Hello, traveler.' };
    quest = { id: 'quest_intro', step: 'talk_npc' };
  }

  // Drive rig from player anim
  let r = snap.rig;
  if (p.anim === 'walk') {
    // Alternate walk_a/walk_b
    const next = r.current === 'walk_a' ? 'walk_b' : 'walk_a';
    r = reduceAnim(r, { type: 'transition', to: next }, rigConfig);
    r = reduceAnim(r, { type: 'tick', dtMs: 120 }, rigConfig);
  } else if (p.anim === 'interact') {
    r = reduceAnim(r, { type: 'transition', to: 'interact' }, rigConfig);
    r = reduceAnim(r, { type: 'tick', dtMs: 160 }, rigConfig);
  } else {
    r = reduceAnim(r, { type: 'transition', to: 'idle' }, rigConfig);
    r = reduceAnim(r, { type: 'tick', dtMs: 150 }, rigConfig);
  }

  const nextSnap: Snapshot = { player: p, rig: r, t: snap.t + (input.dt || 16), quest, dialogue };
  writeFileSync(sessionPath, JSON.stringify(nextSnap, null, 2));
  console.log(JSON.stringify({ ok: true, snapshot: nextSnap }));
}

if (import.meta.url === `file://${process.argv[1]}`) main();

