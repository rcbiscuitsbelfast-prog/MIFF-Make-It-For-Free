// CharacterGeneratorPure
// Stateless procedural character synthesis using MIFF-native modules

import { PixelAnimPure } from '../PixelAnimPure/index';
import { AvatarSystemPure } from '../AvatarSystemPure/index';
import AdvancedRenderingPure, { PixelMatrix } from '../AdvancedRenderingPure/index';

export interface CharacterTraits {
	id: string;
	name: string;
	role: string;
	style: 'casual' | 'formal' | 'fantasy' | 'sci-fi' | 'historical' | 'occupational';
	hair: string;
	hairColor: string;
	skinTone: string;
	accessories: string[];
	clothing: string[];
	palette: string[];
	companion?: { kind: 'cat' | 'dog' | 'droid' | 'alienPet' | 'bird'; palette: string[] };
}

export interface CharacterSpriteExport {
	width: number;
	height: number;
	layers: Record<string, PixelMatrix>; // base, clothing, hair, accessories
}

export interface GeneratedCharacter {
	traits: CharacterTraits;
	sprites: CharacterSpriteExport; // stateless pixel data
	animations: ReturnType<typeof PixelAnimPure.exportAnimation>[];
}

export interface GeneratorConfig {
	count: number;
	size: 32 | 48;
	seed?: number;
}

function mulberry32(seed: number): () => number {
	let t = seed >>> 0;
	return function() {
		t += 0x6D2B79F5;
		let r = Math.imul(t ^ (t >>> 15), 1 | t);
		r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
	};
}

function choice<T extends object>(rng: () => number, items: T[]): T { return items[Math.floor(rng() * items.length)]; }

function randomHex(rng: () => number): string {
	const v = Math.floor(rng() * 0xffffff);
	return `#${v.toString(16).padStart(6, '0')}`;
}

const ROLES = [
	'Astronaut','Wizard','Ninja','Plumber','Surgeon','Cheerleader','Soldier','Fairy','Businessperson','Mime','Nun','Cowboy','Alien','Robot','Detective','Footballer','Firefighter','Pirate','Samurai','Monk','Archer','Bard','Druid','Knight','Engineer','Scientist','Painter','Chef','Pilot','Gardener','Librarian','Priest','Necromancer','Ranger','Alchemist','Mechanic','Miner','Sailor','Scholar','Thief','Assassin','Priestess','Gladiator','Hunter','Blacksmith','Tailor','Baker','Carpenter','Magician'
];

const HAIRS = ['short','long','ponytail','buzz','mohawk','braids','bun','curly','spiky','bald'];
const ACCESSORIES = ['glasses','earring','necklace','scarf','cape','mask','goggles','watch','belt','bracelet'];
const CLOTHING = ['shirt','jacket','robe','armor','spacesuit','kimono','tunic','suit','dress','hoodie','jersey','overalls'];
const STYLES: CharacterTraits['style'][] = ['casual','formal','fantasy','sci-fi','historical','occupational'];

function makePalette(rng: () => number): string[] {
	return [randomHex(rng), randomHex(rng), randomHex(rng), randomHex(rng)];
}

function synthesizeTraits(rng: () => number, idNum: number): CharacterTraits {
	const role = choice(rng, ROLES);
	const style = choice(rng, STYLES);
	const hair = choice(rng, HAIRS);
	const hairColor = randomHex(rng).slice(1);
	const skinTone = randomHex(rng).slice(1);
	const accessories = Array.from({ length: 2 }, () => choice(rng, ACCESSORIES));
	const clothing = Array.from({ length: 2 }, () => choice(rng, CLOTHING));
	const palette = makePalette(rng);
	let companion: CharacterTraits['companion'] | undefined;
	if (idNum % 20 === 0) {
		const kinds: NonNullable<CharacterTraits['companion']>['kind'][] = ['cat','dog','droid','alienPet','bird'];
		companion = { kind: choice(rng, kinds), palette: makePalette(rng) };
	}
	return {
		id: `char_${idNum.toString().padStart(3,'0')}`,
		name: `${role} ${idNum}`,
		role,
		style,
		hair,
		hairColor,
		skinTone,
		accessories,
		clothing,
		palette,
		companion
	};
}

function emptyMatrix(w: number, h: number): PixelMatrix {
	return Array.from({ length: h }, () => Array.from({ length: w }, () => null));
}

function drawBody(matrix: PixelMatrix, skinHex: string): PixelMatrix {
	const h = matrix.length; const w = matrix[0!].length;
	const skin = `#${skinHex}`;
	const cx = Math.floor(w / 2);
	for (let y = Math.floor(h * 0.2); y < Math.floor(h * 0.9); y++) {
		for (let x = cx - 3; x <= cx + 3; x++) {
			matrix[y][x] = skin;
		}
	}
	// head
	for (let y = Math.floor(h * 0.05); y < Math.floor(h * 0.2); y++) {
		for (let x = cx - 2; x <= cx + 2; x++) matrix[y][x] = skin;
	}
	return matrix;
}

function drawClothing(matrix: PixelMatrix, colors: string[]): PixelMatrix {
	const h = matrix.length; const w = matrix[0!].length; const cx = Math.floor(w/2);
	const top = colors[0!]; const bottom = colors[1!] || colors[0!];
	for (let y = Math.floor(h * 0.35); y < Math.floor(h * 0.55); y++) {
		for (let x = cx - 3; x <= cx + 3; x++) if (matrix[y][x]) matrix[y][x] = top;
	}
	for (let y = Math.floor(h * 0.55); y < Math.floor(h * 0.9); y++) {
		for (let x = cx - 3; x <= cx + 3; x++) if (matrix[y][x]) matrix[y][x] = bottom;
	}
	return matrix;
}

function drawHair(matrix: PixelMatrix, hair: string, hairHex: string): PixelMatrix {
	const h = matrix.length; const w = matrix[0!].length; const cx = Math.floor(w/2);
	const c = `#${hairHex}`;
	const y0 = Math.floor(h * 0.05);
	if (hair === 'bald') return matrix;
	for (let y = y0; y < y0 + 3; y++) {
		for (let x = cx - 3; x <= cx + 3; x++) matrix[y][x] = c;
	}
	if (hair === 'ponytail' || hair === 'long' || hair === 'braids') {
		for (let y = y0 + 3; y < y0 + 8; y++) matrix[y][cx + 2] = c;
	}
	if (hair === 'mohawk' || hair === 'spiky') {
		for (let y = y0 - 1; y < y0 + 2; y++) matrix[y][cx] = c;
	}
	return matrix;
}

function drawAccessories(matrix: PixelMatrix, accessories: string[], palette: string[]): PixelMatrix {
	const h = matrix.length; const w = matrix[0!].length; const cx = Math.floor(w/2);
	const acc = new Set(accessories);
	if (acc.has('glasses')) { matrix[Math.floor(h*0.12)][cx-1] = '#000000'; matrix[Math.floor(h*0.12)][cx+1] = '#000000'; }
	if (acc.has('scarf')) { for (let x = cx-3; x<=cx+3; x++) matrix[Math.floor(h*0.32)][x] = palette[2!]; }
	if (acc.has('cape')) { for (let y = Math.floor(h*0.35); y<Math.floor(h*0.8); y++) matrix[y][cx+4] = palette[3!]; }
	return matrix;
}

function composeLayers(width: number, height: number, traits: CharacterTraits): Record<string, PixelMatrix> {
	const base = drawBody(emptyMatrix(width, height), traits.skinTone);
	const hair = drawHair(emptyMatrix(width, height), traits.hair, traits.hairColor);
	const clothing = drawClothing(emptyMatrix(width, height), traits.palette);
	const accessories = drawAccessories(emptyMatrix(width, height), traits.accessories, traits.palette);
	// Apply simple outline and shading to base composite preview layer
	let composite = emptyMatrix(width, height);
	for (let y=0;y<height;y++) for (let x=0;x<width;x++) composite[y][x] = base[y][x] || clothing[y][x] || hair[y][x] || accessories[y][x];
	composite = AdvancedRenderingPure.applyOutline(composite, { color: '#272727', thickness: 1 });
	composite = AdvancedRenderingPure.applyShading(composite, { ambient: 0.6, strength: 0.3 });
	composite = AdvancedRenderingPure.applyLighting(composite, { direction: { x: -0.4, y: -0.6 }, int: '#ffd080', intStrength: 0.25 });
	return { base, clothing, hair, accessories, composite };
}

function makeAnimations(): ReturnType<typeof PixelAnimPure.exportAnimation>[] {
	const idle = PixelAnimPure.createFromPreset('idle');
	const walk = PixelAnimPure.createFromPreset('walk');
	return [PixelAnimPure.exportAnimation(idle), PixelAnimPure.exportAnimation(walk)];
}

export const CharacterGeneratorPure = {
	generate(config: GeneratorConfig): GeneratedCharacter[] {
		const rng = mulberry32(config.seed ?? 1337);
		const results: GeneratedCharacter[] = [];
		const size = config.size;
		for (let i = 1; i <= config.count; i++) {
			const traits = synthesizeTraits(rng, i);
			const layers = composeLayers(size, size, traits);
			const animations = makeAnimations();
			results.push({ traits, sprites: { width: size, height: size, layers }, animations });
		}
		return results;
	},

	toAvatarManifest(traits: CharacterTraits) {
		return {
			style: 'pixel-art',
			base: 'pixel_humanoid_base',
			face: 'neutral',
			clothing: traits.clothing,
			layers: { hair: `hair_${traits.hair}`, accessories: traits.accessories },
			customization: { skinTone: traits.skinTone, hairColor: traits.hairColor },
			performance: { lodLevels: 1 }
		} as any;
	},

	validateWithAvatarSystem(traits: CharacterTraits): { ok: boolean; errors: string[] } {
		const manifest = this.toAvatarManifest(traits);
		return AvatarSystemPure.validate(manifest as unknown);
	}
};

export default CharacterGeneratorPure;

