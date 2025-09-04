function $(id){ return document.getElementById(id); }

const ORCH = {
	scenarioId: 'spirit-tamer-demo-v1',
	name: 'Spirit Tamer Demo',
	version: '1.0.0',
	triggers: { onBeat: { interval: 500 } },
	npcs: { spirit: { name: 'Ancient Spirit' } }
};

const State = { Idle: 'idle', Playing: 'playing', Tamed: 'tamed' };
let model = { state: State.Idle, hits: 0, progress: 0, ctx: null, cvs: null };

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
	});
	const cvs = model.cvs;
	cvs.addEventListener('click', ()=>{ if (model.state === State.Idle) model.state = State.Playing; else onBeat(); });
}

let beatTimer = null;
function startReplay(){
	if (beatTimer) clearInterval(beatTimer);
	beatTimer = setInterval(()=>{ if (model.state === State.Playing) onBeat(); }, ORCH.triggers.onBeat.interval);
}

function onBeat(){
	model.hits += 1; model.progress += 1;
	if (model.progress >= 4) model.state = State.Tamed;
	const status = $('status');
	if (status) status.textContent = model.state === State.Tamed ? 'Spirit Tamed!' : `Beat! Progress ${model.progress}/4`;
}

function render(){
	const { ctx, cvs } = model;
	ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.fillStyle = '#58a6ff';
	ctx.beginPath();
	ctx.arc(320, 240, 40 + model.progress*4, 0, Math.PI*2);
	ctx.fill();
	ctx.fillStyle = '#d0d7de';
	ctx.fillText(`State: ${model.state}`, 10, 20);
	ctx.fillText('Click or Space to keep the beat. Enter to start.', 10, 40);
}

function loop(){ render(); requestAnimationFrame(loop); }

function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Ready. Enter to start.';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	model.cvs = cvs; model.ctx = cvs.getContext('2d');
	bindInputs(); startReplay(); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
