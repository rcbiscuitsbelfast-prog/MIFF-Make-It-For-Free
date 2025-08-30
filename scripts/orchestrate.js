const fs = require('fs');
const path = require('path');

function loadJSON(p) {
	return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function main() {
	const root = process.cwd();
	const orchPath = path.join(root, 'orchestration.json');
	if (!fs.existsSync(orchPath)) {
		console.error('[orchestrate] Missing orchestration.json. Run npm run gen:manifests first.');
		process.exit(1);
	}
	const orch = loadJSON(orchPath);
	let ok = true;
	for (const entry of orch.entries || []) {
		const abs = path.join(root, entry.path);
		if (!fs.existsSync(abs)) {
			console.warn('[orchestrate] Missing entry:', entry.name, '->', entry.path);
			ok = false;
			continue;
		}
		console.log(`[orchestrate] Ready: ${entry.type} ${entry.name} (${entry.path})`);
	}
	if (!ok) {
		console.error('[orchestrate] One or more entries missing.');
		process.exit(1);
	}
	console.log('[orchestrate] All entries ready.');
	process.exit(0);
}

main();

