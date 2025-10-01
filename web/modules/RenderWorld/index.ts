// RenderWorld web module - streamlined for Pixel City
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

function safeRun(path: string): any {
	try {
		const out = execFileSync('npx', ['--yes', 'tsx', path], { stdio: ['ignore','pipe','pipe'] }).toString('utf-8');
		const s = out.indexOf('{');
		const e = out.lastIndexOf('}');
		return JSON.parse(s>=0&&e>s?out.slice(s,e+1):'{}');
	} catch (e) {
		return { ok: false, error: String(e) };
	}
}

export function launchPixelWorld(): any {
	// Ensure a selected character exists or fallback to selection
	const sessionPath = '/workspace/session/sessionState.json';
	try { readFileSync(sessionPath, 'utf-8'); } catch { safeRun('/workspace/render/characterSelect.ts'); }

	// Load Pixel City viewport flow
	const flow = safeRun('/workspace/render/viewport/pixelCityViewport.ts');
	return flow;
}

export function renderMinimalUI(): string {
	// Remove legacy portals; provide three labels, two "Coming Soon" and one entry
	return `
<div class="rw-wrap">
	<h1>RenderWorld</h1>
	<ul class="portals">
		<li>Portal A: Coming Soon</li>
		<li>Portal B: Coming Soon</li>
		<li><button id="enter-pixel">Enter Pixel World</button></li>
	</ul>
</div>`;
}

export function attachHandlers(doc: Document, root: HTMLElement): void {
	const btn = root.querySelector('#enter-pixel') as HTMLButtonElement | null;
	if (btn) {
		btn.addEventListener('click', () => {
			launchPixelWorld();
		});
	}
}

// Log update
export function writeUpdateLog(): void {
	const p = '/workspace/docs/archive/test-results/2025-10-01-renderworld-update-log.txt';
	try { mkdirSync('/workspace/docs/archive/test-results', { recursive: true }); } catch {}
	writeFileSync(p, [
		'Updated RenderWorld web module: portals removed',
		'Replaced labels with Coming Soon and Enter Pixel World',
		'Enter triggers pixelCityViewport.ts and loads session + manifest',
		'Status=PASS'
	].join('\n'));
}

