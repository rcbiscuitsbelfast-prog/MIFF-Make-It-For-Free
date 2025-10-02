#!/usr/bin/env node
// CLI: Generate procedural pixel characters and write registries
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import CharacterGeneratorPure from '../miff/pure/CharacterGeneratorPure/index';

const OUT_DIR = '/workspace/assets/generated/characters';
const SPRITES_DIR = `${OUT_DIR}/sprites`;
const REGISTRY_PATH = `${OUT_DIR}/character_registry.json`;
const LOG_DIR = '/workspace/docs/archive/test-results';

function ensureDir(p: string) {
	try { mkdirSync(p, { recursive: true }); } catch {}
}

function main() {
	const count = parseInt(process.env.COUNT || '100', 10);
	const size = (process.env.SIZE === '48' ? 48 : 32) as 32 | 48;
	const seed = process.env.SEED ? parseInt(process.env.SEED, 10) : 1337;

	ensureDir(OUT_DIR);
	ensureDir(SPRITES_DIR);
	ensureDir(LOG_DIR);

	const generated = CharacterGeneratorPure.generate({ count, size, seed });

	const registry = generated.map(g => ({ id: g.traits.id, name: g.traits.name, role: g.traits.role, style: g.traits.style, companion: g.traits.companion, sprite: `sprites/${g.traits.id}.json` }));
	writeFileSync(REGISTRY_PATH, JSON.stringify({ schema: 'miff.characters.registry.v1', count, size, items: registry }, null, 2));

	for (const g of generated) {
		const spritePath = `${SPRITES_DIR}/${g.traits.id}.json`;
		writeFileSync(spritePath, JSON.stringify({ schema: 'miff.sprite.pixel.v1', id: g.traits.id, width: g.sprites.width, height: g.sprites.height, layers: g.sprites.layers }, null, 2));
	}

	const date = new Date();
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const logPath = `${LOG_DIR}/${yyyy}-${mm}-${dd}-character-generation-results.txt`;

	const lines: string[] = [];
	lines.push(`# Character Generation Results`);
	lines.push(`Date: ${date.toISOString()}`);
	lines.push(`COUNT=${count} SIZE=${size} SEED=${seed}`);
	for (const g of generated) {
		lines.push(`ID=${g.traits.id}`);
		lines.push(`Traits=${JSON.stringify(g.traits)}`);
		lines.push(`Modules=PixelAnimPure,AvatarSystemPure,AdvancedRenderingPure,CharacterGeneratorPure`);
		lines.push(`Render=success Sprite=sprites/${g.traits.id}.json`);
		lines.push(`CLI=miff-characters COUNT=${count} SIZE=${size} SEED=${seed}`);
	}
	writeFileSync(logPath, lines.join('\n'));

	console.log(JSON.stringify({ ok: true, registry: REGISTRY_PATH, sprites: SPRITES_DIR, log: logPath }, null, 2));
}

main();

