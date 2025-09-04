function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Exploring: 'exploring', Dialogue: 'dialogue' };
let vm = { state: State.Exploring, ctx: null, cvs: null, npc: { x:200, y:300, name:'NPC' }, inventory: [] };

async function loadOrchestration(){
	try { ORCH = await fetch('./orchestration.json').then(r=>r.json()); } catch { ORCH = null; }
	if (ORCH?.npcs?.npc1){ vm.npc.x = ORCH.npcs.npc1.x; vm.npc.y = ORCH.npcs.npc1.y; vm.npc.name = ORCH.npcs.npc1.name; }
}

function fitCanvas(cvs){
	const container = document.getElementById('gameContainer');
	if(!container || !cvs) return;
	const maxWidth = Math.min(800, container.clientWidth || 800);
	const aspect = 640/480;
	cvs.style.width = maxWidth + 'px';
	cvs.style.height = Math.round(maxWidth / aspect) + 'px';
}

function ensureUI(){
	if (!$('inventoryBar')){
		const bar = document.createElement('div'); bar.id='inventoryBar'; bar.style.marginTop='10px';
		$('gameContainer').appendChild(bar);
	}
	renderInventory();
}

function renderInventory(){
	const bar = $('inventoryBar'); if (!bar) return;
	bar.innerHTML = 'Inventory: ' + (vm.inventory.length ? vm.inventory.join(', ') : '(empty)');
}

function bindInputs(){
	$('btn_back')?.addEventListener('click', ()=>{ location.href='../../index.html'; });
	if (!$('btnQuest')){ const btn=document.createElement('div'); btn.id='btnQuest'; btn.className='btn btn-secondary'; btn.textContent='[Quest]'; btn.style.position='absolute'; btn.style.top='8px'; btn.style.left='8px'; $('gameContainer').appendChild(btn); }
	$('btnQuest')?.addEventListener('click', ()=>{ openDialogue(['Welcome to the grove.', 'Collect 1 herb and return.']); });
	vm.cvs.addEventListener('click', ()=>{ vm.state = State.Dialogue; openDialogue(['The fire crackles softly.']); });
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
	const btn1 = document.createElement('button'); btn1.className='btn'; btn1.textContent='[Accept]'; btn1.onclick=()=>{ addItem('Herb'); closeDialogue(); };
	const btn2 = document.createElement('button'); btn2.className='btn btn-secondary'; btn2.textContent='[Decline]'; btn2.onclick=()=>{ closeDialogue(); };
	row.appendChild(btn1); row.appendChild(btn2); div.appendChild(row);
	$('gameContainer').appendChild(div);
}

function addItem(item){ vm.inventory.push(item); renderInventory(); }

function render(){
	const { ctx, cvs } = vm; ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// Ambient background tiles
	ctx.fillStyle = '#0f2a18'; ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.fillStyle = '#14361f'; for (let x=0;x<cvs.width;x+=32){ for(let y=0;y<cvs.height;y+=32){ ctx.fillRect(x+((x+y)%64===0?1:0), y, 30, 30); } }
	// NPC
	ctx.fillStyle = '#d35400'; ctx.fillRect(vm.npc.x, vm.npc.y, 24, 24);
	// HUD
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${vm.state}`, 10, 20);
}

function loop(){ render(); requestAnimationFrame(loop); }

async function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	vm.cvs = cvs; vm.ctx = cvs.getContext('2d');
	await loadOrchestration(); ensureUI(); if(statusEl) statusEl.textContent = 'Explore and click to talk.';
	bindInputs(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
