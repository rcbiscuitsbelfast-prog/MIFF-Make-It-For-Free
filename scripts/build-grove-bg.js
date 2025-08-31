// Build composite background from tiles using Sharp
const fs = require('fs');
const path = require('path');

async function main(){
	let sharp;
	try {
		sharp = require('sharp');
	} catch (e) {
		console.error('[build-grove-bg] sharp not installed. Install with: npm i -D sharp');
		process.exit(1);
	}

	const root = process.cwd();
	const assets = path.join(root, 'sampler', 'assets');
	const outPath = path.join(assets, 'witcher_grove_bg.png');

	const tileW = 32, tileH = 32; // assume 32x32 tiles
	const cols = 20, rows = 15;

	const baseTile = path.join(assets, 'Grass_Middle.png');
	if(!fs.existsSync(baseTile)){
		console.error('[build-grove-bg] Missing base tile:', baseTile);
		process.exit(1);
	}

	const composites = [];
	for(let y=0;y<rows;y++){
		for(let x=0;x<cols;x++){
			composites.push({ input: baseTile, left: x*tileW, top: y*tileH });
		}
	}

	const width = cols*tileW, height = rows*tileH;
	const canvas = await sharp({ create: { width, height, channels: 4, background: { r:0, g:0, b:0, alpha:0 } } })
		.png()
		.composite(composites)
		.toFile(outPath);

	console.log('[build-grove-bg] Wrote', outPath);
}

main().catch(err => { console.error('[build-grove-bg] Failed:', err); process.exit(1); });

