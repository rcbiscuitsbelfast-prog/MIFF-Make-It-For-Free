function $(id){ return document.getElementById(id); }

const ORCH = {
	scenarioId: 'witcher-grove-demo-v1',
	name: 'Witcher Grove Demo',
	version: '1.0.0',
	npcs: { npc1: { name: 'Wandering Hunter', x: 200, y: 300 } },
	triggers: { onClickQuest: { type: 'ui' } }
};

const State = { Exploring: 'exploring', Dialogue: 'dialogue' };
let vm = { state: State.Exploring, ctx: null, cvs: null, showQuest: false };

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
	$('btnQuest')?.addEventListener('click', ()=>{ vm.showQuest = !vm.showQuest; vm.state = vm.showQuest ? State.Dialogue : State.Exploring; });
	vm.cvs.addEventListener('click', ()=>{ vm.state = State.Dialogue; });
}

function render(){
	const { ctx, cvs } = vm; ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// NPC placeholder
	ctx.fillStyle = '#d35400';
	ctx.fillRect(ORCH.npcs.npc1.x, ORCH.npcs.npc1.y, 24, 24);
	ctx.fillStyle = '#d0d7de';
	ctx.fillText(`State: ${vm.state}`, 10, 20);
	if (vm.state === State.Dialogue){ ctx.fillText('NPC: "Welcome to the grove."', 10, 40); }
}

function loop(){ render(); requestAnimationFrame(loop); }

function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Explore and click to talk.';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	vm.cvs = cvs; vm.ctx = cvs.getContext('2d');
	bindInputs(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
