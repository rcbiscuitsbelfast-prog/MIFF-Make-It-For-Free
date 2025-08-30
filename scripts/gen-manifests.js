const fs = require('fs');
const path = require('path');

function writeJson(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function discoverScenarios(baseDir) {
	const scenarioDir = path.join(baseDir, 'sampler', 'scenarios');
	if (!fs.existsSync(scenarioDir)) return [];
	return fs
		.readdirSync(scenarioDir)
		.filter((f) => f.endsWith('.fixture.json'))
		.map((f) => ({ name: f.replace(/\.fixture\.json$/, ''), path: path.join('sampler/scenarios', f), type: 'scenario' }));
}

function discoverTopplerGame(baseDir) {
	const gameDir = path.join(baseDir, 'games', 'toppler');
	if (!fs.existsSync(gameDir)) return [];
	const entries = [];
	if (fs.existsSync(path.join(gameDir, 'index.html'))) entries.push({ name: 'toppler.index', path: 'games/toppler/index.html', type: 'game' });
	if (fs.existsSync(path.join(gameDir, 'toppler.html'))) entries.push({ name: 'toppler.toppler', path: 'games/toppler/toppler.html', type: 'game' });
	return entries;
}

function buildOrchestration(baseDir) {
	const entries = [...discoverScenarios(baseDir), ...discoverTopplerGame(baseDir)];
	return {
		generatedAt: new Date().toISOString(),
		entries
	};
}

function buildReleaseManifest(baseDir) {
	const pkgPath = path.join(baseDir, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	const artifacts = [
		{ name: 'sampler.site', path: 'sampler/site/index.html', type: 'site' },
		{ name: 'sampler.replay', path: 'sampler/replay/index.html', type: 'tool' },
		{ name: 'toppler.standalone', path: 'games/toppler/toppler.html', type: 'game' }
	];
	return { name: pkg.name || 'miff', version: pkg.version || '0.0.0', artifacts };
}

function main() {
	const root = process.cwd();
	const orchestration = buildOrchestration(root);
	const releaseManifest = buildReleaseManifest(root);
	writeJson(path.join(root, 'orchestration.json'), orchestration);
	writeJson(path.join(root, 'release_manifest.json'), releaseManifest);
	console.log('Generated orchestration.json and release_manifest.json');
}

main();

