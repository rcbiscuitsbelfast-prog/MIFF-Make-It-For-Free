function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Tamed: 'tamed', Dialogue: 'dialogue' };
let model = { state: State.Idle, hits: 0, progress: 0, ctx: null, cvs: null, npc: { x:320, y:240, name:'Spirit' }, sprite: null, choice: null };

async function loadOrchestration(){
	try { ORCH = await fetch('./orchestration.json').then(r=>r.json()); } catch { ORCH = null; }
	if (ORCH?.npcs?.spirit){ model.npc.x = ORCH.npcs.spirit.x; model.npc.y = ORCH.npcs.spirit.y; model.npc.name = ORCH.npcs.spirit.name; }
}

async function loadAssets(){
	model.sprite = await loadImg('../../../assets/Slime_Green.png').catch(()=>null);
}

function loadImg(src){ return new Promise((res, rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(new Error('load fail '+src)); i.src=src; }); }

function fitCanvas(cvs){
	const container = document.getElementById('gameContainer');
	if(!container || !cvs) return;
	const maxWidth = Math.min(800, container.clientWidth || 800);
	const aspect = 640/480;
	cvs.style.width = maxWidth + 'px';
	cvs.style.height = Math.round(maxWidth / aspect) + 'px';
}

function bindInputs(){
	$('btn_back')?.addEventListener('click', ()=>{ location.href='../../index.html'; });
	window.addEventListener('keydown', (e)=>{
		if (e.key === 'Enter' && model.state === State.Idle) model.state = State.Playing;
		if (e.key === ' ') onBeat();
		if (e.key.toLowerCase() === 'd') openDialogue();
	});
	const cvs = model.cvs;
	cvs.addEventListener('click', ()=>{ if (model.state === State.Idle) model.state = State.Playing; else onBeat(); });
}

// Simple dialogue tree
const Dialogue = {
	intro: {
		line: 'The spirit regards you calmly. Will you approach?',
		choices: [
			{ key: 'A', text: 'Approach respectfully', next: 'calm' },
			{ key: 'B', text: 'Challenge the spirit', next: 'challenge' }
		]
	},
	calm: { line: 'You bow. The spirit hums with warmth. (Beat easier)', effect(){ model.choice='calm'; }, end: true },
	challenge: { line: 'You step forward. The air crackles. (Beat harder)', effect(){ model.choice='challenge'; }, end: true }
};

function openDialogue(){
	model.state = State.Dialogue;
	showDialogueNode('intro');
}

function showDialogueNode(id){
	const node = Dialogue[id]; if (!node) return;
	ensureOverlay();
	const overlay = $('dialogueOverlay');
	overlay.innerHTML = '';
	const p = document.createElement('p'); p.textContent = node.line; overlay.appendChild(p);
	if (node.choices){
		node.choices.forEach(ch=>{
			const btn = document.createElement('button'); btn.className='btn'; btn.textContent = `${ch.key}) ${ch.text}`;
			btn.onclick = ()=>{ if (Dialogue[ch.next]?.effect) Dialogue[ch.next].effect(); closeDialogue(); model.state = State.Playing; };
			overlay.appendChild(btn);
		});
	} else if (node.end){
		const btn = document.createElement('button'); btn.className='btn'; btn.textContent = 'Continue';
		btn.onclick = ()=>{ if (node.effect) node.effect(); closeDialogue(); model.state = State.Playing; };
		overlay.appendChild(btn);
	}
}

function ensureOverlay(){
	if ($('dialogueOverlay')) return;
	const div = document.createElement('div');
	div.id = 'dialogueOverlay';
	div.style.position='absolute'; div.style.left='50%'; div.style.top='50%'; div.style.transform='translate(-50%,-50%)';
	div.style.background='rgba(0,0,0,0.7)'; div.style.padding='16px'; div.style.borderRadius='8px'; div.style.zIndex='10';
	$('gameContainer').appendChild(div);
}

function closeDialogue(){ const d=$('dialogueOverlay'); if(d) d.remove(); }

let beatTimer = null;
function startReplay(){
	const base = ORCH?.triggers?.onBeat?.intervalMs ?? 500;
	const interval = model.choice === 'challenge' ? Math.max(250, base-150) : base;
	if (beatTimer) clearInterval(beatTimer);
	beatTimer = setInterval(()=>{ if (model.state === State.Playing) onBeat(); }, interval);
}

function onBeat(){
	model.hits += 1; model.progress += 1;
	if (model.progress >= 4) model.state = State.Tamed;
	const status = $('status');
	if (status) status.textContent = model.state === State.Tamed ? 'Spirit Tamed!' : `Beat! Progress ${model.progress}/4`;
	persist();
}

function persist(){
	try { localStorage.setItem('spirit_tamer_progress', JSON.stringify({ progress: model.progress, choice: model.choice })); } catch {}
}

function restore(){
	try { const s = localStorage.getItem('spirit_tamer_progress'); if (s){ const d=JSON.parse(s); model.progress=d.progress||0; model.choice=d.choice||null; } } catch {}
}

function render(){
	const { ctx, cvs } = model;
	ctx.clearRect(0,0,cvs.width,cvs.height);
	// Ambient backdrop
	ctx.fillStyle = '#081018'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// Glow
	ctx.save(); ctx.shadowBlur = 20 + model.progress*6; ctx.shadowColor = '#58a6ff';
	// Sprite or circle
	if (model.sprite){ ctx.drawImage(model.sprite, model.npc.x-24, model.npc.y-24, 48, 48); }
	else { ctx.fillStyle = '#58a6ff'; ctx.beginPath(); ctx.arc(model.npc.x, model.npc.y, 40 + model.progress*4, 0, Math.PI*2); ctx.fill(); }
	ctx.restore();
	// HUD
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${model.state}`, 10, 20);
	ctx.fillText('Space/click for beats. Enter to start. D for dialogue.', 10, 40);
}

function loop(){ render(); requestAnimationFrame(loop); }

async function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…';
	await loadOrchestration(); await loadAssets(); restore();
	if(statusEl) statusEl.textContent = 'Ready. Enter to start.';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	model.cvs = cvs; model.ctx = cvs.getContext('2d');
	bindInputs(); startReplay(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
