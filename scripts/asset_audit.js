#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const imageSize = require('image-size');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf-8')); }
function exists(p){ try { fs.accessSync(p); return true; } catch { return false; } }

function auditRegistry(regPath){
	const out = { errors: [], warnings: [], tiles: [], ids: new Set(), validTiles: [] };
	const reg = readJson(regPath);
	const seen = new Set();
	for (const t of reg.tiles || []){
		const id = t.id;
		if (!id) out.errors.push('Missing id');
		else if (seen.has(id)) out.errors.push(`Duplicate id: ${id}`);
		else seen.add(id);
		if (!t.src || !/\.png$/i.test(t.src)) out.errors.push(`Invalid src for ${id||'<no id>'}: ${t.src}`);
		if (t.src && !t.src.includes('assets/Isometric Blocks/')) out.errors.push(`Non-isometric source for ${id}: ${t.src}`);
		if (!t.tags || !t.tags.length) out.warnings.push(`Missing tags for ${id}`);
		if (!t.biome || !t.biome.length) out.warnings.push(`Missing biome for ${id}`);
		if (!/^[a-z0-9_]+$/.test(id||'')) out.warnings.push(`Non remix-safe id: ${id}`);
		out.tiles.push(t);
		out.ids.add(id);
	}
	out.validTiles = out.tiles.map(t=>t.id);
	return out;
}

function auditPngs(dirList, registry){
	const out = { sheets: [], misaligned: [], oversized: [], missing: [], unreferenced: [] };
	const registrySrcs = new Set(registry.tiles.map(t=>path.resolve(t.src.replace(/^\.\//,''))));
	for (const dir of dirList){
		const abs = path.resolve(dir);
		if (!exists(abs)) continue;
		for (const f of fs.readdirSync(abs)){
			if (!/\.png$/i.test(f)) continue;
			const p = path.join(abs, f);
			let dim; try { dim = imageSize(p); } catch { continue; }
			const { width, height } = dim || {};
			if (width > 1024 || height > 1024) out.oversized.push({ file: p, width, height });
			if (width >= 2048 || height >= 2048) out.sheets.push({ file: p, width, height });
			if ((width % 32)!==0 || (height % 16)!==0) out.misaligned.push({ file: p, width, height });
			if (!registrySrcs.has(p)) out.unreferenced.push({ file: p, width, height });
		}
	}
	return out;
}

function auditOrchestration(mapPaths, registryIds){
	const out = { errors: [], warnings: [], linkage: [] };
	for (const p of mapPaths){
		if (!exists(p)) continue;
		const m = readJson(p);
		const zone = m.zone || path.basename(p);
		const propsLayer = (m.layers && m.layers.props && m.layers.props.map) ? m.layers.props.map : [];
		const propsRefs = new Set();
		for (const row of propsLayer){ for (const id of row){ if (id){ propsRefs.add(id); if (!registryIds.has(id)) out.errors.push(`${path.basename(p)} references unknown tile: ${id}`); } } }
		const orch = m.orchestration || {};
		for (const q of (orch.quests||[])){ if (q.tile){ if (!registryIds.has(q.tile)) out.errors.push(`${path.basename(p)} quest uses unknown tile: ${q.tile}`); else propsRefs.add(q.tile); } }
		for (const l of (orch.lore||[])){ if (l.tile){ if (!registryIds.has(l.tile)) out.errors.push(`${path.basename(p)} lore uses unknown tile: ${l.tile}`); else propsRefs.add(l.tile); } }
		out.linkage.push({ zone, refs: Array.from(propsRefs) });
	}
	return out;
}

function generateReport(regOut, pngOut, orchOut){
	const lines = [];
	lines.push('# Asset Audit Report');
	lines.push('');
	lines.push('## Registry Validation');
	lines.push(`Valid tiles: ${regOut.validTiles.join(', ')}`);
	lines.push(`Errors: ${regOut.errors.length}`);
	for (const e of regOut.errors) lines.push(`- ${e}`);
	lines.push(`Warnings: ${regOut.warnings.length}`);
	for (const w of regOut.warnings) lines.push(`- ${w}`);
	lines.push('');
	lines.push('## PNG Slicing Audit');
	lines.push(`Oversized: ${pngOut.oversized.length}`);
	for (const o of pngOut.oversized) lines.push(`- ${o.file} (${o.width}x${o.height})`);
	lines.push(`Sheets: ${pngOut.sheets.length}`);
	for (const s of pngOut.sheets) lines.push(`- ${s.file} (${s.width}x${s.height})`);
	lines.push(`Potentially Misaligned: ${pngOut.misaligned.length}`);
	for (const m of pngOut.misaligned) lines.push(`- ${m.file} (${m.width}x${m.height})`);
	lines.push(`Unreferenced PNGs: ${pngOut.unreferenced.length}`);
	for (const u of pngOut.unreferenced) lines.push(`- ${u.file} (${u.width}x${u.height})`);
	lines.push('');
	lines.push('## Orchestration Linkage');
	for (const l of orchOut.linkage){ lines.push(`- ${l.zone}: ${l.refs.join(', ')||'none'}`); }
	lines.push(`Errors: ${orchOut.errors.length}`);
	for (const e of orchOut.errors) lines.push(`- ${e}`);
	lines.push('');
	lines.push('## Contributor Notes');
	const ready = regOut.tiles.filter(t=>t.tags && t.tags.length && t.biome && t.biome.length);
	const needsTags = regOut.tiles.filter(t=>!t.tags || !t.tags.length);
	const needsBiome = regOut.tiles.filter(t=>!t.biome || !t.biome.length);
	lines.push(`- Tiles ready for remix: ${ready.map(t=>t.id).join(', ')||'none'}`);
	lines.push(`- Tiles needing tags: ${needsTags.map(t=>t.id).join(', ')||'none'}`);
	lines.push(`- Tiles needing biome: ${needsBiome.map(t=>t.id).join(', ')||'none'}`);
	return lines.join('\n');
}

(function main(){
	const regPath = 'site/maps/tile_manifest.json';
	const regOut = auditRegistry(regPath);
	const ids = new Set((regOut.tiles||[]).map(t=>t.id));
	const pngOut = auditPngs(['assets/Isometric Blocks', 'assets/Toppler Medieval'], regOut);
	const orchOut = auditOrchestration(['site/maps/grove3d.json'], ids);
	const report = generateReport(regOut, pngOut, orchOut);
	fs.writeFileSync('docs/ASSET_AUDIT.md', report);
	console.log('Wrote docs/ASSET_AUDIT.md');
})();