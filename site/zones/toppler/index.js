// Toppler – minimal interactive scaffold with physics, levels, and replay
function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Completed: 'completed' };
let game = {
	state: State.Idle,
	levelIndex: 0,
	player: { x: 20, y: 420, w: 40, h: 40, vx: 0, vy: 0 },
	goalX: 560,
	time: 0,
	ctx: null,
	cvs: null,
	trail: []
};

async function loadOrchestration(){
	try { ORCH = await fetch('./orchestration.json').then(r=>r.json()); } catch { ORCH = null; }
	if (ORCH?.levels?.length){ applyLevel(0); }
}

function applyLevel(idx){
	game.levelIndex = idx;
	const L = ORCH.levels[idx];
	game.goalX = L.goalX;
	game.player.x = 20; game.player.y = L.height - 60; game.player.vx = 0; game.player.vy = 0;
	game.trail = [];
}

function fitCanvas(cvs) {
	const container = document.getElementById('gameContainer');
	if (!container || !cvs) return;
	const maxWidth = Math.min(800, container.clientWidth || 800);
	const aspect = 640/480;
	cvs.style.width = maxWidth + 'px';
	cvs.style.height = Math.round(maxWidth / aspect) + 'px';
}

function setState(next){ game.state = next; }

function startReplay(){ /* reserved for timed triggers in future */ }

function bindInputs(){
	window.addEventListener('keydown', (e)=>{
		if (e.key === 'ArrowRight') game.player.vx = 140;
		if (e.key === 'ArrowLeft') game.player.vx = -140;
		if (e.key === 'ArrowUp' && onGround()) game.player.vy = -360;
		if (e.key === 'Enter' && game.state === State.Idle) setState(State.Playing);
	});
	window.addEventListener('keyup', (e)=>{
		if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') game.player.vx = 0;
	});
	game.cvs.addEventListener('click', ()=>{ if (game.state === State.Idle) setState(State.Playing); });
	$('btn_back')?.addEventListener('click', ()=>{ location.href='../../index.html'; });
	if (!$('btnQuest')){
		const btn = document.createElement('div'); btn.id='btnQuest'; btn.className='btn btn-secondary'; btn.textContent='[Next Level]';
		btn.style.position='absolute'; btn.style.top='8px'; btn.style.left='8px'; $('gameContainer').appendChild(btn);
	}
	$('btnQuest')?.addEventListener('click', ()=>{
		if (!ORCH?.levels?.length) return;
		const next = (game.levelIndex + 1) % ORCH.levels.length; applyLevel(next);
		setState(State.Idle);
		const status = $('status'); if (status) status.textContent = `Loaded ${ORCH.levels[next].id}. Press Enter.`;
	});
}

function onGround(){ return game.player.y + game.player.h >= 480 - 20; }

function update(dt){
	if (game.state === State.Playing){
		const L = ORCH?.levels?.[game.levelIndex] || { gravity: 900, width: 640, height: 480 };
		// Gravity
		game.player.vy += L.gravity * dt;
		// Integrate
		game.player.x += game.player.vx * dt;
		game.player.y += game.player.vy * dt;
		// Floor collision
		const floorY = L.height - 20 - game.player.h; // padded floor
		if (game.player.y > floorY){ game.player.y = floorY; game.player.vy = 0; }
		// Walls
		if (game.player.x < 0) game.player.x = 0;
		if (game.player.x + game.player.w > L.width) game.player.x = L.width - game.player.w;
		// Trail
		game.trail.push({ x: game.player.x + game.player.w/2, y: game.player.y + game.player.h/2, t: performance.now() });
		if (game.trail.length > 30) game.trail.shift();
		// Goal
		if (game.player.x + game.player.w >= game.goalX){ setState(State.Completed); const s=$('status'); if(s) s.textContent='Completed! 🎉'; }
	}
}

function render(){
	const { ctx, cvs } = game;
	ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height);
	// Goal pulse
	const pulse = 8 + Math.abs(Math.sin(performance.now()/300))*8;
	ctx.fillStyle = '#0f2a3f'; ctx.fillRect(game.goalX, 0, cvs.width - game.goalX, cvs.height);
	ctx.fillStyle = '#13466e'; ctx.fillRect(game.goalX - pulse, 0, 2, cvs.height);
	// Trail
	for (let i=0;i<game.trail.length;i++){
		const a = i/game.trail.length; ctx.fillStyle = `rgba(88,166,255,${a*0.6})`;
		const p = game.trail[i]; ctx.fillRect(p.x-3, p.y-3, 6, 6);
	}
	// Player
	ctx.fillStyle = game.state === State.Completed ? '#2ecc71' : '#58a6ff';
	ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h);
	// HUD
	ctx.fillStyle = '#d0d7de'; ctx.font = '14px sans-serif';
	ctx.fillText(`State: ${game.state}  |  Level: ${ORCH?.levels?.[game.levelIndex]?.id ?? 'L?'}`, 10, 20);
	ctx.fillText('Enter/click to start. Arrows to move/jump. [Next Level] to switch.', 10, 40);
}

function loop(ts){ if (!game._last) game._last = ts; const dt = Math.min(0.033, (ts - game._last) / 1000); game._last = ts; update(dt); render(); requestAnimationFrame(loop); }

async function init(){
	const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…';
	await loadOrchestration(); if(statusEl) statusEl.textContent = 'Ready. Press Enter to start.';
	const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs));
	game.ctx = cvs.getContext('2d'); game.cvs = cvs;
	bindInputs(); startReplay(); setState(State.Idle); requestAnimationFrame(loop);
}

window.addEventListener('DOMContentLoaded', init);
