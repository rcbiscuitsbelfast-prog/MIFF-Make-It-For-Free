function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Exploring: 'exploring', Dialogue: 'dialogue' };
let vm = { state: State.Exploring, ctx: null, cvs: null, npc: { x:200, y:300, name:'NPC' }, inventory: [], portrait: null, tileset: null, props: [], audio: { music:null, ui:null, muted:false } };

async function loadOrchestration(){
	try { ORCH = await fetch('./orchestration.json').then(r=>r.json()); } catch { ORCH = null; }
	if (ORCH?.npcs?.npc1){ vm.npc.x = ORCH.npcs.npc1.x; vm.npc.y = ORCH.npcs.npc1.y; vm.npc.name = ORCH.npcs.npc1.name; }
}

async function loadAssets(){
	vm.portrait = await loadImg('../../../assets/KayKitAssets/rogue_texture.png').catch(()=>null);
	vm.tileset = await loadImg('../../../assets/Grass_Middle.png').catch(()=>null);
	const propNames = ['Oak_Tree.png', 'House.png', 'Chest.png'];
	for (const p of propNames){ const img = await loadImg('../../../assets/' + p).catch(()=>null); if (img) vm.props.push({ name:p.replace('.png','').toLowerCase(), img, x: Math.random()*500+40, y: Math.random()*350+40 }); }
	try { vm.audio.music = new Audio('../../../assets/audio/music/Tracks/1. Dawn of Blades.ogg'); vm.audio.music.loop=true; vm.audio.music.volume=0.25; vm.audio.music.muted = vm.audio.muted; } catch {}
	try { vm.audio.ui = new Audio('../../../assets/audio/sfx/ui_click.txt'); } catch {}
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

function ensureUI(){ if (!$('inventoryBar')){ const bar=document.createElement('div'); bar.id='inventoryBar'; bar.style.marginTop='10px'; $('gameContainer').appendChild(bar); } renderInventory(); }

function renderInventory(){ const bar = $('inventoryBar'); if (!bar) return; bar.innerHTML = 'Inventory: ' + (vm.inventory.length ? vm.inventory.join(', ') : '(empty)'); }

function bindInputs(){
	$('btn_back')?.addEventListener('click', ()=>{ try{ vm.audio.music?.pause(); }catch{} location.href='../../index.html'; });
	if (!$('btnQuest')){ const btn=document.createElement('div'); btn.id='btnQuest'; btn.className='btn btn-secondary'; btn.textContent='[Quest]'; btn.style.position='absolute'; btn.style.top='8px'; btn.style.left='8px'; $('gameContainer').appendChild(btn); }
	$('btnQuest')?.addEventListener('click', ()=>{ try{ vm.audio.ui?.play(); }catch{} openDialogue(['Welcome to the grove.', 'Collect 1 herb and return.']); });
	vm.cvs.addEventListener('click', (ev)=>{ // chest interaction
		const rect = vm.cvs.getBoundingClientRect(); const mx = (ev.clientX-rect.left)*(vm.cvs.width/rect.width); const my = (ev.clientY-rect.top)*(vm.cvs.height/rect.height);
		const chest = vm.props.find(p=>p.name==='chest' && mx>=p.x && mx<=p.x+24 && my>=p.y && my<=p.y+24);
		if (chest){ addItem('Herb'); try{ vm.audio.ui?.play(); }catch{} }
	});
	window.addEventListener('keydown', (e)=>{ if (e.key.toLowerCase()==='m'){ vm.audio.muted = !vm.audio.muted; try{ vm.audio.music && (vm.audio.music.muted = vm.audio.muted); }catch{} } });
}

function openDialogue(lines){ vm.state = State.Dialogue; ensureOverlay(lines); }
function closeDialogue(){ const d=$('dialogueOverlay'); if(d) d.remove(); vm.state = State.Exploring; }

function ensureOverlay(lines){
	if ($('dialogueOverlay')) $('dialogueOverlay').remove();
	const div = document.createElement('div');
	div.id = 'dialogueOverlay'; div.style.position='absolute'; div.style.left='50%'; div.style.top='50%'; div.style.transform='translate(-50%,-50%)';
	div.style.background='rgba(0,0,0,0.7)'; div.style.padding='16px'; div.style.borderRadius='8px'; div.style.zIndex='10'; div.style.maxWidth='80%'; div.style.color='#d0d7de';
	lines.forEach(text=>{ const p=document.createElement('p'); p.textContent=text; div.appendChild(p); });
	const row = document.createElement('div');
	const btn1 = document.createElement('button'); btn1.className='btn'; btn1.textContent='[Accept]'; btn1.onclick=()=>{ try{ vm.audio.ui?.play(); }catch{} addItem('Herb'); closeDialogue(); };
	const btn2 = document.createElement('button'); btn2.className='btn btn-secondary'; btn2.textContent='[Decline]'; btn2.onclick=()=>{ try{ vm.audio.ui?.play(); }catch{} closeDialogue(); };
	row.appendChild(btn1); row.appendChild(btn2); div.appendChild(row);
	$('gameContainer').appendChild(div);
}

function addItem(item){ vm.inventory.push(item); renderInventory(); }

function render(){
	const { ctx, cvs } = vm;
	ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// Tiles
	if (vm.tileset){ for (let x=0;x<cvs.width;x+=32){ for(let y=0;y<cvs.height;y+=32){ ctx.drawImage(vm.tileset, x, y, 32, 32); } } }
	else { ctx.fillStyle = '#14361f'; for (let x=0;x<cvs.width;x+=32){ for(let y=0;y<cvs.height;y+=32){ ctx.fillRect(x, y, 30, 30); } } }
	// Props
	for (const p of vm.props){ if (p.img) ctx.drawImage(p.img, p.x, p.y, 24, 24); }
	// NPC
	ctx.fillStyle = '#d35400'; ctx.fillRect(vm.npc.x, vm.npc.y, 24, 24);
	// Portrait
	if (vm.portrait){ ctx.globalAlpha=0.12; ctx.drawImage(vm.portrait, cvs.width-128, cvs.height-128, 120, 120); ctx.globalAlpha=1; }
	// HUD
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${vm.state}`, 10, 20);
	ctx.fillText('M to mute music.', 10, 40);
}

function loop(){ render(); requestAnimationFrame(loop); }

async function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	vm.cvs = cvs; vm.ctx = cvs.getContext('2d');
	await loadOrchestration(); await loadAssets(); if(statusEl) statusEl.textContent = 'Explore and click to talk.';
	try{ vm.audio.music?.play(); }catch{}
	ensureUI(); bindInputs(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
