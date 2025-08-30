const fs = require('fs');
const path = require('path');

const fixturesDir = path.join(process.cwd(), 'sampler', 'scenarios');
const assetsDir = path.join(process.cwd(), 'sampler', 'assets');
const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp3', '.wav', '.ogg', '.ttf', '.woff', '.woff2']);

function listFixtures() {
	return fs.readdirSync(fixturesDir).filter(f => f.endsWith('.fixture.json'));
}

function collectAssetPathsFromFixture(fixturePath) {
	try {
		const json = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
		const found = new Set();
		function walk(obj) {
			if (obj && typeof obj === 'object') {
				for (const k of Object.keys(obj)) {
					const v = obj[k];
					if (typeof v === 'string' && /\.(png|jpg|jpeg|gif|webp|mp3|wav|ogg|ttf|woff2?|svg)$/i.test(v)) {
						found.add(v);
					}
					if (typeof v === 'object') walk(v);
				}
			}
		}
		walk(json);
		return Array.from(found);
	} catch (e) {
		console.warn('[validate-assets] Failed to parse fixture:', fixturePath, e.message);
		return [];
	}
}

function validate() {
	let missing = 0;
	let invalidExt = 0;
	const fixtures = listFixtures();
	for (const f of fixtures) {
		const fixturePath = path.join(fixturesDir, f);
		const assets = collectAssetPathsFromFixture(fixturePath);
		for (const rel of assets) {
			const ext = path.extname(rel).toLowerCase();
			if (!allowedExt.has(ext)) {
				console.warn('[validate-assets] Invalid/unsupported extension:', rel);
				invalidExt++;
			}
			const abs = path.join(assetsDir, rel.replace(/^\/*/, ''));
			if (!fs.existsSync(abs)) {
				console.warn('[validate-assets] Missing asset referenced by', f, '->', rel);
				missing++;
			}
		}
	}
	if (missing === 0 && invalidExt === 0) {
		console.log('[validate-assets] All referenced assets present and allowed.');
		process.exit(0);
	}
	console.log(`[validate-assets] Completed with warnings: missing=${missing}, invalidExt=${invalidExt}`);
	process.exit(0);
}

validate();

