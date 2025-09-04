function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Exploring: 'exploring', Dialogue: 'dialogue' };
let vm = { state: State.Exploring, ctx: null, cvs: null, npc: { x:200, y:300, name:'NPC' } };

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

function bindInputs(){
	$('btn_back')?.addEventListener('click', ()=>{ location.href='../../index.html'; });
	if (!$('btnQuest')){
		const btn = document.createElement('div'); btn.id='btnQuest'; btn.className='btn btn-secondary'; btn.textContent='[Quest]';
		btn.style.position='absolute'; btn.style.top='8px'; btn.style.left='8px'; $('gameContainer').appendChild(btn);
	}
	$('btnQuest')?.addEventListener('click', ()=>{ vm.state = (vm.state === State.Exploring) ? State.Dialogue : State.Exploring; });
	vm.cvs.addEventListener('click', ()=>{ vm.state = State.Dialogue; });
}

function render(){
	const { ctx, cvs } = vm; ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// NPC
	ctx.fillStyle = '#d35400'; ctx.fillRect(vm.npc.x, vm.npc.y, 24, 24);
	ctx.fillStyle = '#d0d7de'; ctx.fillText(`State: ${vm.state}`, 10, 20);
	ctx.fillText(`NPC: ${vm.npc.name}`, 10, 40);
	if (vm.state === State.Dialogue){ ctx.fillText('"Welcome to the grove."', 10, 60); }
}

function loop(){ render(); requestAnimationFrame(loop); }

async function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	vm.cvs = cvs; vm.ctx = cvs.getContext('2d');
	await loadOrchestration(); if(statusEl) statusEl.textContent = 'Explore and click to talk.';
	bindInputs(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
