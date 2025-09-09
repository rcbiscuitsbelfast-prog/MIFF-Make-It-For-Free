import { createOverlayDispatcher } from '../../overlays/dispatcher.js';
import { HUDBar, MainMenu, DialogueBox, StyleSelector } from '../../ui_modules/index.js';
import { UI_STYLES } from '../../ui_modules/style_presets.js';
import { updateState as updateGameState } from '../../state/game_state.js';
import { addAttributionFooter } from '../../overlays/footer.js';

function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Tamed: 'tamed', Dialogue: 'dialogue' };
let model = { state: State.Idle, hits: 0, progress: 0, ctx: null, cvs: null, npc: { x:320, y:240, name:'Spirit' }, sprite: null, choice: null, portrait: null, props: [], anim: { t:0 }, inputMode: 'Keyboard' };
let audio = { music: null, sfxBeat: null, sfxUI: null, muted:false };
let UI = null;
// Joystick
let joy={ base:null, knob:null, active:false, cx:0, cy:0, dx:0, dy:0 };

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

function detectInputMode(){
	function setMode(m){ if (model.inputMode !== m){ model.inputMode = m; persist(); } }
	window.addEventListener('keydown', ()=>setMode('Keyboard'));
	window.addEventListener('pointerdown', ()=>setMode('Touch'));
	setInterval(()=>{ const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : []; if (pads.length) setMode('Gamepad'); }, 1000);
}

function ensureJoystick(){
	if (joy.base) return;
	const base=document.createElement('div'); base.style.position='absolute'; base.style.left='80px'; base.style.bottom='80px'; base.style.width='96px'; base.style.height='96px'; base.style.border='2px solid rgba(255,255,255,0.2)'; base.style.borderRadius='50%'; base.style.background='rgba(0,0,0,0.2)'; base.style.touchAction='none';
	const knob=document.createElement('div'); knob.style.position='absolute'; knob.style.left='38px'; knob.style.top='38px'; knob.style.width='20px'; knob.style.height='20px'; knob.style.borderRadius='50%'; knob.style.background='rgba(88,166,255,0.9)';
	base.appendChild(knob); $('gameContainer').appendChild(base);
	function setKnob(dx,dy){ const r=36; const nx=Math.max(-r,Math.min(r,dx)); const ny=Math.max(-r,Math.min(r,dy)); knob.style.left=(38+nx)+'px'; knob.style.top=(38+ny)+'px'; joy.dx=nx/r; joy.dy=ny/r; }
	function start(e){ joy.active=true; const b=base.getBoundingClientRect(); joy.cx=b.left+b.width/2; joy.cy=b.top+b.height/2; move(e); }
	function move(e){ if(!joy.active) return; const p=e.touches? e.touches[0]: e; const dx=p.clientX-joy.cx; const dy=p.clientY-joy.cy; setKnob(dx,dy); model.inputMode='Touch (Joystick)'; }
	function end(){ joy.active=false; setKnob(0,0); }
	base.addEventListener('mousedown',start); window.addEventListener('mousemove',move); window.addEventListener('mouseup',end);
	base.addEventListener('touchstart',start,{passive:false}); base.addEventListener('touchmove',e=>{ e.preventDefault(); move(e); },{passive:false}); base.addEventListener('touchend',end);
	joy.base=base; joy.knob=knob;
}

function bindInputs(){
	// legacy back removed
	window.addEventListener('keydown', (e)=>{
		if (e.key === 'Enter' && model.state === State.Idle){ 
			if (UI) UI.hide('intro');
			model.state = State.Playing; 
			try{ audio.music?.play(); }catch{} 
		}
		if (e.key === ' ') onBeat();
		if (e.key.toLowerCase() === 'd') openDialogue();
		if (e.key.toLowerCase() === 'm'){ audio.muted = !audio.muted; try{ audio.music && (audio.music.muted = audio.muted); }catch{} }
	});
	const cvs = model.cvs;
	cvs.addEventListener('click', ()=>{ 
		if (model.state === State.Idle){ 
			if (UI) UI.hide('intro');
			model.state = State.Playing; 
			try{ audio.music?.play(); }catch{} 
		} else onBeat(); 
	});
}

// Legacy overlay functions removed - using dispatcher instead

// showIntro function removed - using dispatcher UI.showIntro instead
function showGameOver(){ 
    UI && UI.showGameOver({ 
        title: 'Spirit Tamed!',
        message: 'The spirit has accepted your bond. Ready to remix this experience?',
        onRestart: ()=>{ 
            model.progress=0; 
            model.hits=0; 
            model.state=State.Idle; 
            UI.showIntro({ title: ORCH?.title||'Spirit Tamer', onStart: ()=>{ model.state=State.Playing; try{ audio.music?.play(); }catch{} } }); 
        },
        links: [
            { label: 'Map Builder', href: '../../map-builder.html' },
            { label: 'Remix Packs', href: '../../contrib/remix-packs/README.md' },
            { label: 'Contributor Guide', href: '../../docs/MAP_BUILDER_ONBOARDING.md' }
        ]
    }); 
}
function showLoreModal(){ UI && UI.showLore({ title:'Grove Lore', text:'These isles were shaped by old songs. Some stones still hum.' }); }

// Dialogue tree (sample remains)
const Dialogue = {
	intro: { line: 'The spirit regards you calmly. Will you approach?', choices: [ { key: 'A', text: 'Approach respectfully', next: 'calm' }, { key: 'B', text: 'Challenge the spirit', next: 'challenge' } ] },
	calm: { line: 'You bow. The spirit hums with warmth. (Beat easier)', effect(){ model.choice='calm'; }, next: 'evolve' },
	challenge: { line: 'You step forward. The air crackles. (Beat harder)', effect(){ model.choice='challenge'; }, next: 'evolve' },
	evolve: { line: 'The spirit shifts shape slightly, acknowledging your intent.', effect(){}, end: true }
};

function openDialogue(){ model.state = State.Dialogue; showDialogueNode('intro'); }

function showDialogueNode(id){
	const node = Dialogue[id]; if (!node) return;
	
	// Use dispatcher for dialogue overlay
	if (!UI) UI = createOverlayDispatcher($('gameContainer'));
	
	let dialogueText = node.line;
	if (node.choices){
		dialogueText += '\n\n';
		node.choices.forEach(ch => {
			dialogueText += `${ch.key}) ${ch.text}\n`;
		});
	}
	
	UI.showLore({
		title: 'Spirit Dialogue',
		text: dialogueText
	});
	
	// Handle choices via keyboard
	if (node.choices){
		const choiceHandler = (e) => {
			const choice = node.choices.find(ch => ch.key.toLowerCase() === e.key.toLowerCase());
			if (choice){
				window.removeEventListener('keydown', choiceHandler);
				try{ audio.sfxUI?.play(); }catch{}
				if (Dialogue[choice.next]?.effect) Dialogue[choice.next].effect();
				showDialogueNode(choice.next);
			}
		};
		window.addEventListener('keydown', choiceHandler);
	} else if (node.end){
		// Auto-close after showing
		setTimeout(() => {
			model.state = State.Playing;
			startReplay();
		}, 2000);
	}
}

let beatTimer = null;
function startReplay(){ const base = ORCH?.triggers?.onBeat?.intervalMs ?? 500; const interval = model.choice === 'challenge' ? Math.max(250, base-150) : base; if (beatTimer) clearInterval(beatTimer); beatTimer = setInterval(()=>{ if (model.state === State.Playing) onBeat(); }, interval); }

function onBeat(){ model.hits += 1; model.progress += 1; try{ audio.sfxBeat?.play(); }catch{} if (model.progress >= 6){ model.state = State.Tamed; showGameOver(); } const status = $('status'); if (status) status.textContent = model.state === State.Tamed ? 'Spirit Tamed!' : `Beat! Progress ${model.progress}/6`; persist(); }

function persist(){ try { localStorage.setItem('spirit_tamer_progress', JSON.stringify({ progress: model.progress, choice: model.choice, muted: audio.muted, inputMode: model.inputMode })); } catch {} }
function restore(){ try { const s = localStorage.getItem('spirit_tamer_progress'); if (s){ const d=JSON.parse(s); model.progress=d.progress||0; model.choice=d.choice||null; if (typeof d.muted==='boolean') audio.muted=d.muted; if (d.inputMode) model.inputMode=d.inputMode; } } catch {} }

function easeInOutSine(x){ return -(Math.cos(Math.PI * x) - 1) / 2; }

function renderUI(){ const { ctx, cvs } = model; const total = 6; const ratio = Math.min(1, model.progress / total); ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(10, cvs.height-26, cvs.width-20, 16); ctx.fillStyle = '#58a6ff'; ctx.fillRect(10, cvs.height-26, (cvs.width-20)*ratio, 16); ctx.fillStyle = '#d0d7de'; ctx.fillText(`Progress ${model.progress}/${total}  |  Input: ${model.inputMode}`, 14, cvs.height-32); UI && UI.showHUD({ inputMode: model.inputMode, progress: `${model.progress}/${total}` }); }

function render(){ const { ctx, cvs } = model; ctx.clearRect(0,0,cvs.width,cvs.height); ctx.fillStyle = '#081018'; ctx.fillRect(0,0,cvs.width,cvs.height); for (let i=0;i<model.props.length;i++){ const pr=model.props[i]; if (pr.img) ctx.drawImage(pr.img, model.npc.x+pr.dx, model.npc.y+pr.dy, 32, 32); } model.anim.t += 0.016; const phase = model.anim.t % 1; const eased = easeInOutSine(phase); const baseR = 40 + model.progress*3; const pulseR = baseR + 8*eased; ctx.save(); ctx.shadowBlur = 16 + eased*16; ctx.shadowColor = '#58a6ff'; if (model.sprite){ ctx.drawImage(model.sprite, model.npc.x-24, model.npc.y-24, 48, 48); } else { ctx.fillStyle = '#58a6ff'; ctx.beginPath(); ctx.arc(model.npc.x, model.npc.y, pulseR, 0, Math.PI*2); ctx.fill(); } ctx.restore(); if (model.portrait){ ctx.globalAlpha=0.15; ctx.drawImage(model.portrait, cvs.width-128, cvs.height-128, 120, 120); ctx.globalAlpha=1; } ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${model.state}`, 10, 20); ctx.fillText('Space/click for beats. Enter to start. D dialogue. M mute.', 10, 40); renderUI(); }

function loop(){ render(); UI && UI.showHUD({ inputMode: model.inputMode, progress: `${model.progress}/6`, fullscreenToggle: true }); requestAnimationFrame(loop); }

async function init(){ const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…'; await loadOrchestration(); await loadAssets(); restore(); if(statusEl) statusEl.textContent = 'Ready. Enter to start.'; let main = document.getElementById('mainCanvas'); if (!main){ main = document.createElement('canvas'); main.id='mainCanvas'; main.style.position='absolute'; main.style.top='0'; main.style.left='0'; main.style.zIndex='0'; main.style.display='block'; main.width=window.innerWidth; main.height=window.innerHeight; const container=$('gameContainer')||document.body; container.insertBefore(main, container.firstChild||null); console.log('Canvas injected'); } const cvs = main; fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs)); model.cvs = cvs; model.ctx = cvs.getContext('2d'); console.log('Renderer initialized'); detectInputMode(); bindInputs(); ensureJoystick(); UI = createOverlayDispatcher($('gameContainer')); const savedStyle = localStorage.getItem('miff_ui_style') || 'default'; UI.setDefaultStyle && UI.setDefaultStyle(UI_STYLES[savedStyle] || UI_STYLES.default); try { UI.useModule && UI.useModule('HUD', HUDBar, { inputMode: model.inputMode, info: 'Spirit', style: UI_STYLES[savedStyle] || UI_STYLES.default }); } catch {} addAttributionFooter(); UI.showIntro({ title: ORCH?.title||'Spirit Tamer', onStart: ()=>{ model.state=State.Playing; try{ audio.music?.play(); }catch{} } }); try { UI.useModule && UI.useModule('IntroModal', MainMenu, { title: ORCH?.title||'Spirit Tamer', style: UI_STYLES[savedStyle] || UI_STYLES.default, onAction:(id)=>{ if(id==='start'){ model.state=State.Playing; try{ audio.music?.play(); }catch{} UI.hide && UI.hide('intro'); } if(id==='credits'){ showLoreModal(); } } }); } catch {} window.addEventListener('keydown', (e)=>{ if (e.key.toLowerCase()==='s'){ UI.showLore({ title:'Style Selector' }); UI.useModule && UI.useModule('LoreModal', StyleSelector, { initial: savedStyle }); } }); updateGameState && updateGameState({ currentZone: 'spirit', progress: { value: 0, total: 6, label: '' }, activeQuest: { title:'Bond with the Spirit', description: 'Hit the beat 6 times', status:'Awaiting start' }, inputMode: model.inputMode }); startReplay(); console.log('Draw loop started'); requestAnimationFrame(loop); }

// Fullscreen support
window.__miffToggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement){
        el.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
};

window.addEventListener('DOMContentLoaded', init);
