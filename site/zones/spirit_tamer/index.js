function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Tamed: 'tamed', Dialogue: 'dialogue' };
let model = { state: State.Idle, hits: 0, progress: 0, ctx: null, cvs: null, npc: { x:320, y:240, name:'Spirit' }, sprite: null, choice: null, portrait: null, props: [], anim: { t:0 } };
let audio = { music: null, sfxBeat: null, sfxUI: null, muted:false };

async function loadOrchestration(){
	try { ORCH = await fetch('./orchestration.json').then(r=>r.json()); } catch { ORCH = null; }
	if (ORCH?.npcs?.spirit){ model.npc.x = ORCH.npcs.spirit.x; model.npc.y = ORCH.npcs.spirit.y; model.npc.name = ORCH.npcs.spirit.name; }
}

async function loadAssets(){
	const spiritSprite = ORCH?.assets?.sprites?.spirit || '../../../assets/Slime_Green.png';
	const portraitSprite = ORCH?.assets?.sprites?.portrait || '../../../assets/KayKitAssets/knight_texture.png';
	model.sprite = await loadImg(spiritSprite).catch(()=>null);
	model.portrait = await loadImg(portraitSprite).catch(()=>null);
	// ambient props around spirit
	const props = ['Oak_Tree_Small.png', 'Outdoor_Decor_Free.png'];
	for (const p of props){ const img = await loadImg('../../../assets/' + p).catch(()=>null); if (img) model.props.push({ img, dx: Math.random()*80-40, dy: Math.random()*40-20 }); }
	// audio
	const musicPath = ORCH?.assets?.music || '../../../assets/audio/music/Loops/1. Dawn of Blades.ogg';
	try { audio.music = new Audio(musicPath); audio.music.loop = true; audio.music.volume = 0.3; audio.music.muted = audio.muted; } catch {}
	try { audio.sfxBeat = new Audio('../../../assets/audio/sfx/hit_basic.txt'); } catch {}
	try { audio.sfxUI = new Audio('../../../assets/audio/sfx/ui_click.txt'); } catch {}
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
	$('btn_back')?.addEventListener('click', ()=>{ try{ audio.music?.pause(); }catch{} location.href='../../index.html'; });
	window.addEventListener('keydown', (e)=>{
		if (e.key === 'Enter' && model.state === State.Idle){ model.state = State.Playing; try{ audio.music?.play(); }catch{} }
		if (e.key === ' ') onBeat();
		if (e.key.toLowerCase() === 'd') openDialogue();
		if (e.key.toLowerCase() === 'm'){ audio.muted = !audio.muted; try{ audio.music && (audio.music.muted = audio.muted); }catch{} }
	});
	const cvs = model.cvs;
	cvs.addEventListener('click', ()=>{ if (model.state === State.Idle){ model.state = State.Playing; try{ audio.music?.play(); }catch{} } else onBeat(); });
	ensureMobileTap();
}

function ensureMobileTap(){ if (window.innerWidth<=768 && !$('tapHint')){ const h=document.createElement('div'); h.id='tapHint'; h.textContent='[Tap for beats]'; h.style.position='absolute'; h.style.bottom='8px'; h.style.right='8px'; h.className='btn'; h.style.opacity='0.85'; h.onclick=()=>onBeat(); $('gameContainer').appendChild(h); } }

// Expanded dialogue tree with evolution
const Dialogue = {
	intro: {
		line: 'The spirit regards you calmly. Will you approach?',
		choices: [
			{ key: 'A', text: 'Approach respectfully', next: 'calm' },
			{ key: 'B', text: 'Challenge the spirit', next: 'challenge' }
		]
	},
	calm: { line: 'You bow. The spirit hums with warmth. (Beat easier)', effect(){ model.choice='calm'; }, next: 'evolve' },
	challenge: { line: 'You step forward. The air crackles. (Beat harder)', effect(){ model.choice='challenge'; }, next: 'evolve' },
	evolve: { line: 'The spirit shifts shape slightly, acknowledging your intent.', effect(){ /* future: swap sprite */ }, end: true }
};

function openDialogue(){ model.state = State.Dialogue; showDialogueNode('intro'); }

function showDialogueNode(id){
	const node = Dialogue[id]; if (!node) return;
	ensureOverlay();
	const overlay = $('dialogueOverlay'); overlay.innerHTML = '';
	const p = document.createElement('p'); p.textContent = node.line; overlay.appendChild(p);
	if (node.choices){
		node.choices.forEach(ch=>{
			const btn = document.createElement('button'); btn.className='btn'; btn.textContent = `${ch.key}) ${ch.text}`;
			btn.onclick = ()=>{ try{ audio.sfxUI?.play(); }catch{} if (Dialogue[ch.next]?.effect) Dialogue[ch.next].effect(); showDialogueNode(ch.next); };
			overlay.appendChild(btn);
		});
	} else if (node.end){
		const btn = document.createElement('button'); btn.className='btn'; btn.textContent = 'Continue';
		btn.onclick = ()=>{ try{ audio.sfxUI?.play(); }catch{} closeDialogue(); model.state = State.Playing; startReplay(); };
		overlay.appendChild(btn);
	}
}

function ensureOverlay(){
	if ($('dialogueOverlay')) return;
	const div = document.createElement('div');
	div.id = 'dialogueOverlay';
	div.style.position='absolute'; div.style.left='50%'; div.style.top='50%'; div.style.transform='translate(-50%,-50%)';
	div.style.background='rgba(0,0,0,0.7)'; div.style.padding='16px'; div.style.borderRadius='8px'; div.style.zIndex='10'; div.style.maxWidth='80%'; div.style.color='#d0d7de';
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
	try{ audio.sfxBeat?.play(); }catch{}
	if (model.progress >= 6) model.state = State.Tamed;
	const status = $('status');
	if (status) status.textContent = model.state === State.Tamed ? 'Spirit Tamed!' : `Beat! Progress ${model.progress}/6`;
	persist();
}

function persist(){ try { localStorage.setItem('spirit_tamer_progress', JSON.stringify({ progress: model.progress, choice: model.choice, muted: audio.muted })); } catch {} }
function restore(){ try { const s = localStorage.getItem('spirit_tamer_progress'); if (s){ const d=JSON.parse(s); model.progress=d.progress||0; model.choice=d.choice||null; if (typeof d.muted==='boolean') audio.muted=d.muted; } } catch {} }

function easeInOutSine(x){ return -(Math.cos(Math.PI * x) - 1) / 2; }

function renderUI(){
	const { ctx, cvs } = model;
	// Progress bar
	const total = 6; const ratio = Math.min(1, model.progress / total);
	ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(10, cvs.height-26, cvs.width-20, 16);
	ctx.fillStyle = '#58a6ff'; ctx.fillRect(10, cvs.height-26, (cvs.width-20)*ratio, 16);
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`Progress ${model.progress}/${total}`, 14, cvs.height-32);
}

function render(){
	const { ctx, cvs } = model;
	ctx.clearRect(0,0,cvs.width,cvs.height);
	// Ambient backdrop
	ctx.fillStyle = '#081018'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// Props
	for (let i=0;i<model.props.length;i++){ const pr=model.props[i]; if (pr.img) ctx.drawImage(pr.img, model.npc.x+pr.dx, model.npc.y+pr.dy, 32, 32); }
	// Animated glow radius with easing
	model.anim.t += 0.016; const phase = model.anim.t % 1; const eased = easeInOutSine(phase);
	const baseR = 40 + model.progress*3; const pulseR = baseR + 8*eased;
	ctx.save(); ctx.shadowBlur = 16 + eased*16; ctx.shadowColor = '#58a6ff';
	if (model.sprite){ ctx.drawImage(model.sprite, model.npc.x-24, model.npc.y-24, 48, 48); }
	else { ctx.fillStyle = '#58a6ff'; ctx.beginPath(); ctx.arc(model.npc.x, model.npc.y, pulseR, 0, Math.PI*2); ctx.fill(); }
	ctx.restore();
	// Portrait
	if (model.portrait){ ctx.globalAlpha=0.15; ctx.drawImage(model.portrait, cvs.width-128, cvs.height-128, 120, 120); ctx.globalAlpha=1; }
	// HUD
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${model.state}`, 10, 20);
	ctx.fillText('Space/click for beats. Enter to start. D dialogue. M mute.', 10, 40);
	// UI overlay
	renderUI();
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
