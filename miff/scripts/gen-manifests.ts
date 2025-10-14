import fs from 'fs';
import path from 'path';

interface OrchestrationEntry {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	path: string;
	type: 'scenario' | 'game';
}

interface ReleaseManifest {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
	version: string;
	artifacts: Array<{ name: string; path: string; type: string }>;
}

function writeJson(filePath: string, data: unknown) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function discoverScenarios(baseDir: string): OrchestrationEntry[] {
	const scenarioDir = path.join(baseDir, 'sampler', 'scenarios');
	if (!fs.existsSync(scenarioDir)) return [];
	return fs
		.readdirSync(scenarioDir)
		.filter((f) => f.endsWith('.fixture.json'))
		.map((f) => ({ name: f.replace(/\.fixture\.json$/, ''), path: path.join('sampler/scenarios', f), type: 'scenario' as const }));
}

function discoverTopplerGame(baseDir: string): OrchestrationEntry[] {
	const gameDir = path.join(baseDir, 'games', 'toppler');
	if (!fs.existsSync(gameDir)) return [];
	return [
		{ name: 'toppler.index', path: 'games/toppler/index.html', type: 'game' },
		{ name: 'toppler.toppler', path: 'games/toppler/toppler.html', type: 'game' }
	];
}

function buildOrchestration(baseDir: string) {
	const entries = [...discoverScenarios(baseDir), ...discoverTopplerGame(baseDir)];
	const orchestration = {
		generatedAt: new Date().toISOString(),
		entries
	};
	return orchestration;
}

function buildReleaseManifest(baseDir: string): ReleaseManifest {
	const pkgPath = path.join(baseDir, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	const artifacts = [
		{ name: 'sampler.site', path: 'site/index.html', type: 'site' },
		{ name: 'sampler.replay', path: 'sampler/replay/index.html', type: 'tool' },
		{ name: 'toppler.standalone', path: 'games/toppler/toppler.html', type: 'game' }
	];
	return { name: pkg.name || 'miff', version: pkg.version || '0.0.0', artifacts };
}

function main(...args: any[]) {
	const root = process.cwd();
	const orchestration = buildOrchestration(root);
	const releaseManifest = buildReleaseManifest(root);
	writeJson(path.join(root, 'orchestration.json'), orchestration);
	writeJson(path.join(root, 'release_manifest.json'), releaseManifest);
	console.log('Generated orchestration.json and release_manifest.json');
}

main();

