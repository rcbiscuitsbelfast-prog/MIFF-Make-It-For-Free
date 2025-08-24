// remix_overlay.js - Remix Mode overlay for golden fixture debugging (browser-only)
// Exports:
// - createRemixOverlay({ zone, scenario, actual, expected }) => { el, show(), hide(), onRunWithEditor(fn) }
// - renderReplayUI() => no-op helper to ensure DOM root exists

function h(tag, attrs={}, children=[]) {
	const el = document.createElement(tag);
	for(const [k,v] of Object.entries(attrs||{})){
		if(k==='class') el.className = v; else if(k==='text') el.textContent = v; else el.setAttribute(k, v);
	}
	(children||[]).forEach(c=> el.appendChild(typeof c==='string'? document.createTextNode(c): c));
	return el;
}

function ensureRoot(){
	let root = document.getElementById('remix-root');
	if(!root){
		root = h('div', { id:'remix-root', class:'remix-root' });
		document.body.appendChild(root);
	}
	return root;
}

function styleOnce(){
	if(document.getElementById('remix-style')) return;
	const css = `
	.remix-root{ position:fixed; inset:auto 0 0 0; z-index:99999; }
	.remix-overlay{ background:#0b0f16; color:#e6edf3; border-top:1px solid #222; box-shadow:0 -8px 24px rgba(0,0,0,.4); }
	.remix-bar{ display:flex; gap:8px; align-items:center; padding:10px 12px; border-bottom:1px solid #222 }
	.remix-title{ font-weight:600; font-size:14px; margin-right:auto }
	.remix-tabs{ display:flex; gap:6px }
	.remix-tab{ background:#161b22; border:1px solid #2a2f37; color:#e6edf3; border-radius:8px; padding:6px 10px; cursor:pointer; font-size:13px }
	.remix-tab.active{ border-color:#58a6ff }
	.remix-body{ display:flex; flex-direction:column; gap:8px; padding:10px 12px; max-height:40vh; overflow:auto }
	.remix-columns{ display:grid; grid-template-columns:1fr; gap:8px }
	@media (min-width: 800px){ .remix-columns{ grid-template-columns:1fr 1fr } }
	textarea.remix-editor{ width:100%; height:160px; background:#0f1116; color:#e6edf3; border:1px solid #222; border-radius:8px; padding:8px; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace }
	.remix-actions{ display:flex; gap:8px; align-items:center }
	.remix-btn{ background:#0f1116; color:#e6edf3; border:1px solid #2a2f37; border-radius:8px; padding:6px 10px; cursor:pointer }
	.remix-btn:hover{ border-color:#58a6ff }
	pre.remix-pre{ background:#0f1116; border:1px solid #222; border-radius:8px; padding:8px; overflow:auto }
	`;
	const st = h('style', { id:'remix-style' }, [css]);
	document.head.appendChild(st);
}

function jsonDiff(a, b){
	try{ a = JSON.parse(JSON.stringify(a)); b = JSON.parse(JSON.stringify(b)); }catch(e){}
	const diffs = [];
	function walk(path, va, vb){
		if(JSON.stringify(va) === JSON.stringify(vb)) return;
		if(typeof va==='object' && va && typeof vb==='object' && vb){
			const keys = new Set([...Object.keys(va), ...Object.keys(vb)]);
			for(const k of keys){ walk(path.concat(k), va[k], vb[k]); }
		} else {
			diffs.push({ path: path.join('.'), expected: vb, actual: va });
		}
	}
	walk([], a, b);
	return diffs;
}

export function createRemixOverlay({ zone, scenario, actual, expected }){
	styleOnce();
	const root = ensureRoot();
	const overlay = h('div', { class:'remix-overlay' });
	const bar = h('div', { class:'remix-bar' });
	const title = h('div', { class:'remix-title', text: `Remix Mode • ${zone || 'zone'} • ${scenario?.id || 'scenario'}` });
	const tabs = h('div', { class:'remix-tabs' });
	const tabNames = ['Scenario','Diff','Hooks'];
	const tabEls = tabNames.map(name=> h('button', { class:'remix-tab', text:name }));
	tabEls.forEach(el=> tabs.appendChild(el));
	const closeBtn = h('button', { class:'remix-btn', text:'Close' });
	bar.appendChild(title); bar.appendChild(tabs); bar.appendChild(closeBtn);

	const body = h('div', { class:'remix-body' });
	const viewScenario = h('div');
	viewScenario.appendChild(h('h3', { text:'Scenario' }));
	const preScenario = h('pre', { class:'remix-pre' });
	preScenario.textContent = JSON.stringify({ scenario, steps: scenario?.steps || [], expected }, null, 2);
	viewScenario.appendChild(preScenario);

	const viewDiff = h('div');
	viewDiff.appendChild(h('h3', { text:'Diff' }));
	const preDiff = h('pre', { class:'remix-pre' });
	const diffs = jsonDiff(actual, expected);
	preDiff.textContent = diffs.length? JSON.stringify(diffs, null, 2) : 'No differences.';
	viewDiff.appendChild(preDiff);

	const viewHooks = h('div');
	viewHooks.appendChild(h('h3', { text:'Hooks' }));
	const editors = h('div', { class:'remix-columns' });
	const reducerEd = h('textarea', { class:'remix-editor', id:'remix-ed-reducer' });
	reducerEd.value = '// reducer.js (default export async function(step){ /* ... */ })\n';
	const assetsEd = h('textarea', { class:'remix-editor', id:'remix-ed-assets' });
	assetsEd.value = '{\n  "sprites": {},\n  "audio": {},\n  "fonts": {}\n}\n';
	const uiEd = h('textarea', { class:'remix-editor', id:'remix-ed-ui' });
	uiEd.value = '// ui.js (render minimal UI)\n';
	editors.appendChild(h('div', {}, [h('strong',{text:'reducer.js'}), reducerEd]));
	editors.appendChild(h('div', {}, [h('strong',{text:'assets.json'}), assetsEd]));
	editors.appendChild(h('div', {}, [h('strong',{text:'ui.js'}), uiEd]));
	const actions = h('div', { class:'remix-actions' });
	const runWithEditor = h('button', { class:'remix-btn', text:'Run with Editor Reducer' });
	const saveAll = h('button', { class:'remix-btn', text:'Save modules (download)' });
	actions.appendChild(runWithEditor); actions.appendChild(saveAll);
	viewHooks.appendChild(editors); viewHooks.appendChild(actions);

	const views = [viewScenario, viewDiff, viewHooks];
	function showTab(i){
		views.forEach((v, idx)=> v.style.display = idx===i? 'block':'none');
		tabEls.forEach((t, idx)=> t.classList.toggle('active', idx===i));
	}
	tabEls.forEach((t, idx)=> t.addEventListener('click', ()=> showTab(idx)));
	showTab(0);

	// Downloads for saving edits
	function download(filename, text){
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = h('a', { href:url, download: filename });
		document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
	}
	saveAll.addEventListener('click', ()=>{
		download(`modules/${zone||'zone'}/reducer.js`, reducerEd.value);
		download(`modules/${zone||'zone'}/assets.json`, assetsEd.value);
		download(`modules/${zone||'zone'}/ui.js`, uiEd.value);
	});

	let onRunCb = null;
	runWithEditor.addEventListener('click', ()=>{ if(onRunCb) onRunCb({ reducerCode: reducerEd.value }); });
	closeBtn.addEventListener('click', ()=> overlay.remove());

	body.appendChild(viewScenario); body.appendChild(viewDiff); body.appendChild(viewHooks);
	overlay.appendChild(bar); overlay.appendChild(body);

	return {
		el: overlay,
		show(){ ensureRoot().appendChild(overlay); },
		hide(){ overlay.remove(); },
		onRunWithEditor(fn){ onRunCb = fn; }
	};
}

export function renderReplayUI(){ ensureRoot(); styleOnce(); }