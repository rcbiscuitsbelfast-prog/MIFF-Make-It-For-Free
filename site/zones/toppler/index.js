// Toppler – minimal interactive scaffold with state machine and replay
function $(id){ return document.getElementById(id); }

// Embedded orchestration (browser-available). In CI we validate curated scenarios.
const ORCH = {
	scenarioId: 'toppler-demo-v1',
	name: 'Toppler Demo',
	version: '1.0.0',
	locations: { arena: { width: 640, height: 480 } },
	puzzles: [{ id: 'ramp1', goalX: 560 }],
	triggers: {
		// timeline triggers that a replay engine could fire
		spawnBlock: { t: 0.2 },
		winHint: { t: 5.0 }
	}
};

const State = {
	Idle: 'idle',
	Playing: 'playing',
	Completed: 'completed'
};

let game = {
	state: State.Idle,
	player: { x: 20, y: 420, w: 40, h: 40, vx: 0 },
	goalX: ORCH.puzzles[0].goalX,
	time: 0,
	ctx: null,
	cvs: null
};

function fitCanvas(cvs) {
	const container = document.getElementById('gameContainer');
	if (!container || !cvs) return;
	const maxWidth = Math.min(800, container.clientWidth || 800);
	const aspect = 640/480;
	cvs.style.width = maxWidth + 'px';
	cvs.style.height = Math.round(maxWidth / aspect) + 'px';
}

function setState(next){
	game.state = next;
}

function startReplay(){
	// Minimal timed triggers; could be extended to load external JSON under site/
	setTimeout(()=>{ /* spawn already present in this scaffold */ }, ORCH.triggers.spawnBlock.t*1000);
	setTimeout(()=>{ /* could show hint UI */ }, ORCH.triggers.winHint.t*1000);
}

function bindInputs(){
	window.addEventListener('keydown', (e)=>{
		if (e.key === 'ArrowRight') game.player.vx = 120;
		if (e.key === 'ArrowLeft') game.player.vx = -120;
		if (e.key === 'Enter' && game.state === State.Idle) setState(State.Playing);
	});
	window.addEventListener('keyup', (e)=>{
		if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') game.player.vx = 0;
	});
	const cvs = game.cvs;
	cvs.addEventListener('click', ()=>{
		if (game.state === State.Idle) setState(State.Playing);
	});
	// Ensure Back button works
	$('btn_back')?.addEventListener('click', ()=>{ location.href='../../index.html'; });
	// Ensure a quest button exists (create lightweight overlay if missing)
	if (!$('btnQuest')){
		const btn = document.createElement('div');
		btn.id = 'btnQuest';
		btn.className = 'btn btn-secondary';
		btn.textContent = '[Quest]';
		btn.style.position = 'absolute';
		btn.style.top = '8px';
		btn.style.left = '8px';
		$('gameContainer').appendChild(btn);
	}
	$('btnQuest')?.addEventListener('click', ()=>{
		// Toggle small overlay message
		const status = $('status');
		if (status) status.textContent = 'Goal: move the block to the right edge!';
	});
}

function update(dt){
	if (game.state === State.Playing){
		game.player.x += game.player.vx * dt;
		if (game.player.x + game.player.w >= game.goalX){
			setState(State.Completed);
			const status = $('status');
			if (status) status.textContent = 'Completed! 🎉';
		}
	}
}

function render(){
	const { ctx, cvs } = game;
	ctx.fillStyle = '#0b1020';
	ctx.fillRect(0,0,cvs.width,cvs.height);
	// Goal area
	ctx.fillStyle = '#12324a';
	ctx.fillRect(game.goalX, 0, cvs.width - game.goalX, cvs.height);
	// Player block
	ctx.fillStyle = game.state === State.Completed ? '#2ecc71' : '#58a6ff';
	ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h);
	// HUD
	ctx.fillStyle = '#d0d7de';
	ctx.font = '14px sans-serif';
	ctx.fillText(`State: ${game.state}`, 10, 20);
	ctx.fillText('Press Enter or click to start. Arrow keys to move.', 10, 40);
}

function loop(ts){
	if (!game._last) game._last = ts;
	const dt = Math.min(0.033, (ts - game._last) / 1000);
	game._last = ts;
	update(dt);
	render();
	requestAnimationFrame(loop);
}

function init(){
	const statusEl = $('status');
	if(statusEl) statusEl.textContent = 'Ready. Press Enter or click to start.';

	const cvs = $('gameCanvas');
	fitCanvas(cvs);
	window.addEventListener('resize', ()=>fitCanvas(cvs));
	const ctx = cvs.getContext('2d');
	game.ctx = ctx; game.cvs = cvs;
	bindInputs();
	startReplay();
	setState(State.Idle);
	requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
