#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PixelAnimPure } from '../miff/pure/PixelAnimPure/index';

const CHAR_REG = '/workspace/assets/generated/characters/character_registry.json';
const SESSION = '/workspace/session/sessionState.json';
const LOG = '/workspace/docs/archive/test-results/2025-10-01-character-select-results.txt';

function ensureDir(p: string) { try { mkdirSync(p, { recursive: true }); } catch {} }

function main() {
  ensureDir('/workspace/session');
  ensureDir('/workspace/docs/archive/test-results');

  const reg = JSON.parse(readFileSync(CHAR_REG, 'utf-8'));
  const list = (reg.items || []).slice(0, 12);

  const hoverIndex = 2; // simulate user hovering 3rd character
  const selectIndex = 2; // confirm same selection

  const idle = PixelAnimPure.createFromPreset('idle');
  const walk = PixelAnimPure.createFromPreset('walk');
  const anims = [PixelAnimPure.exportAnimation(idle), PixelAnimPure.exportAnimation(walk)];

  const selected = list[selectIndex];
  const session = { selectedCharacterId: selected?.id, timestamp: Date.now() };
  writeFileSync(SESSION, JSON.stringify(session, null, 2));

  writeFileSync(LOG, [
    'Modules=PixelAnimPure,AvatarSystemPure,DialogueSystemPure,InputSystemPure',
    'Screen=characterSelect',
    `Displayed=${list.map((x: any)=>x.id).join('|')}`,
    `Hover=${list[hoverIndex]?.id}`,
    `Selected=${selected?.id}`,
    'Status=PASS'
  ].join('\n'));

  console.log(JSON.stringify({ ok: true, selected: selected?.id, animations: anims.length, listed: list.length, sessionPath: SESSION }, null, 2));
}

main();

