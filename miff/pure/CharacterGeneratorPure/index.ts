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
	id: string;
	name: string;
	class: string;
	level: number;
	stats: CharacterStatsSummary;
	skills: string[];
	traits: CharacterTraits;
	sprites: CharacterSpriteExport; // stateless pixel data
	animations: ReturnType<typeof PixelAnimPure.exportAnimation>[];
}

export interface GeneratorConfig {
	count: number;
	size: 32 | 48;
	seed?: number;
}

export interface GenerateRandomOptions {
	seed?: number;
	class?: string;
	level?: number;
	spriteSize?: 32 | 48;
}

export interface CharacterStatsSummary {
	strength: number;
	agility: number;
	intelligence: number;
	vitality: number;
	charisma: number;
}

interface ClassTemplate {
	name: string;
	primaryStat: keyof CharacterStatsSummary;
	secondaryStat: keyof CharacterStatsSummary;
	baseStats: CharacterStatsSummary;
	skills: string[];
}

const CLASS_TEMPLATES: Record<string, ClassTemplate> = {
	warrior: {
		name: 'warrior',
		primaryStat: 'strength',
		secondaryStat: 'vitality',
		baseStats: { strength: 14, agility: 10, intelligence: 8, vitality: 12, charisma: 9 },
		skills: ['Power Strike', 'Shield Bash', 'Battle Cry', 'Defender Stance']
	},
	mage: {
		name: 'mage',
		primaryStat: 'intelligence',
		secondaryStat: 'charisma',
		baseStats: { strength: 7, agility: 9, intelligence: 15, vitality: 9, charisma: 12 },
		skills: ['Fireball', 'Arcane Shield', 'Teleport', 'Frost Nova']
	},
	ranger: {
		name: 'ranger',
		primaryStat: 'agility',
		secondaryStat: 'strength',
		baseStats: { strength: 12, agility: 14, intelligence: 10, vitality: 10, charisma: 10 },
		skills: ['Arrow Volley', 'Tracking', 'Camouflage', 'Rapid Shot']
	},
	rogue: {
		name: 'rogue',
		primaryStat: 'agility',
		secondaryStat: 'charisma',
		baseStats: { strength: 10, agility: 15, intelligence: 11, vitality: 9, charisma: 11 },
		skills: ['Backstab', 'Stealth', 'Poison Blade', 'Shadowstep']
	},
	cleric: {
		name: 'cleric',
		primaryStat: 'charisma',
		secondaryStat: 'vitality',
		baseStats: { strength: 9, agility: 9, intelligence: 12, vitality: 12, charisma: 14 },
		skills: ['Heal', 'Radiant Shield', 'Purify', 'Divine Hammer']
	},
	default: {
		name: 'adventurer',
		primaryStat: 'vitality',
		secondaryStat: 'strength',
		baseStats: { strength: 11, agility: 11, intelligence: 11, vitality: 11, charisma: 11 },
		skills: ['Quick Strike', 'Focus', 'Dodge', 'Team Tactics']
	}
};

const CLASS_KEYS = Object.keys(CLASS_TEMPLATES).filter(key => key !== 'default');

const FIRST_NAMES = ['Aria','Borin','Candra','Darian','Elora','Fenn','Galen','Helia','Ivor','Jaina','Kael','Lyra','Marek','Nora','Orin','Perrin','Quinn','Rhea','Sylas','Tarin','Una','Varek','Wynn','Xara','Yorin','Zara'];
const LAST_NAMES = ['Stormwind','Ironfist','Shadowstep','Brightsong','Nightbreeze','Flameheart','Dawnguard','Whitethorn','Ashenveil','Silverkeep','Moonwhisper','Windrider'];

function createStats(template: ClassTemplate, level: number, rng: () => number): CharacterStatsSummary {
	const stats: CharacterStatsSummary = { ...template.baseStats };
	const keys = Object.keys(stats) as (keyof CharacterStatsSummary)[];
	for (const key of keys) {
		stats[key] += Math.floor(rng() * 4) + Math.max(1, Math.floor(level / 3));
	}
	stats[template.primaryStat] += Math.floor(level * 1.5);
	stats[template.secondaryStat] += Math.floor(level * 0.75);
	return stats;
}

function createSkills(template: ClassTemplate, rng: () => number): string[] {
	const skills = new Set<string>();
	while (skills.size < Math.min(3, template.skills.length)) {
		skills.add(choice(rng, template.skills));
	}
	return Array.from(skills);
}

function generateNameFromRng(rng: () => number): string {
	const first = choice(rng, FIRST_NAMES);
	const last = choice(rng, LAST_NAMES);
	return `${first} ${last}`;
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

function choice<T>(rng: () => number, items: T[]): T { return items[Math.floor(rng() * items.length)]; }

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
	generateRandom(options: GenerateRandomOptions = {}): GeneratedCharacter {
		const baseSeed = options.seed ?? Math.floor(Math.random() * 0xffffffff);
		const rng = mulberry32(baseSeed);
		const requestedKey = options.class ? options.class.toLowerCase() : undefined;
		const classKey = requestedKey && CLASS_TEMPLATES[requestedKey] ? requestedKey : choice(rng, CLASS_KEYS);
		const template = CLASS_TEMPLATES[classKey] ?? CLASS_TEMPLATES.default;
		const classLabel = options.class ?? template.name;
		const level = options.level ?? Math.max(1, Math.floor(rng() * 20) + 1);
		const idNum = Math.max(1, Math.floor(rng() * 1000000));
		const traits = synthesizeTraits(rng, idNum);
		const name = generateNameFromRng(rng);
		const stats = createStats(template, level, rng);
		const skills = createSkills(template, rng);
		const size = options.spriteSize ?? 32;
		const layers = composeLayers(size, size, traits);
		const animations = makeAnimations();
		return {
			id: traits.id,
			name,
			class: classLabel,
			level,
			stats,
			skills,
			traits,
			sprites: { width: size, height: size, layers },
			animations
		};
	},

	generate(config: GeneratorConfig): GeneratedCharacter[] {
		const baseSeed = config.seed ?? 1337;
		const seedRng = mulberry32(baseSeed);
		const results: GeneratedCharacter[] = [];
		for (let i = 0; i < config.count; i++) {
			const derivedSeed = Math.floor(seedRng() * 0xffffffff);
			const classKey = choice(seedRng, CLASS_KEYS);
			const level = Math.max(1, Math.floor(seedRng() * 20) + 1);
			results.push(this.generateRandom({
				seed: derivedSeed,
				class: classKey,
				level,
				spriteSize: config.size
			}));
		}
		return results;
	},

	generateName(options?: { seed?: number }): string {
		if (options?.seed !== undefined) {
			return generateNameFromRng(mulberry32(options.seed));
		}
		return generateNameFromRng(() => Math.random());
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

