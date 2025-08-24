// Browser-only minimal interactive scaffold for Toppler
function $(id){ return document.getElementById(id); }

function drawGrid(ctx, w, h, cell){
	ctx.strokeStyle = '#20242c';
	for(let x=0; x<=w; x+=cell){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
	for(let y=0; y<=h; y+=cell){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
}

function init(){
	const statusEl = $('status');
	const canvas = /** @type {HTMLCanvasElement} */($('game'));
	const ctx = canvas?.getContext('2d');
	if(!canvas || !ctx){ if(statusEl) statusEl.textContent = 'Canvas not supported'; return; }

	const cell = 40;
	const cols = Math.floor(canvas.width / cell);
	const rows = Math.floor(canvas.height / cell);
	const player = { x: 1, y: 1 };
	const goal = { x: Math.max(2, cols-2), y: 1 };
	const blocks = [ { x:2, y:1 } ];

	function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

	function draw(){
		ctx.clearRect(0,0,canvas.width,canvas.height);
		drawGrid(ctx, canvas.width, canvas.height, cell);
		// Goal
		ctx.fillStyle = '#14532d';
		ctx.fillRect(goal.x*cell+4, goal.y*cell+4, cell-8, cell-8);
		// Blocks
		ctx.fillStyle = '#475569';
		for(const b of blocks){ ctx.fillRect(b.x*cell+6, b.y*cell+6, cell-12, cell-12); }
		// Player
		ctx.fillStyle = '#1f6feb';
		ctx.fillRect(player.x*cell+6, player.y*cell+6, cell-12, cell-12);
	}

	function occupied(x,y){ return blocks.some(b=> b.x===x && b.y===y); }

	function move(dx, dy){
		const tx = clamp(player.x + dx, 0, cols-1);
		const ty = clamp(player.y + dy, 0, rows-1);
		const blk = blocks.find(b=> b.x===tx && b.y===ty);
		if(blk){
			const bx = clamp(blk.x + dx, 0, cols-1);
			const by = clamp(blk.y + dy, 0, rows-1);
			if(!occupied(bx,by) && (bx!==blk.x || by!==blk.y)){
				blk.x = bx; blk.y = by; player.x = tx; player.y = ty;
			}
		}else{
			player.x = tx; player.y = ty;
		}
		if(statusEl){ statusEl.textContent = (player.x===goal.x && player.y===goal.y) ? 'Completed!' : 'Use arrow keys to move'; }
		draw();
	}

	function onKey(e){
		switch(e.key){
			case 'ArrowLeft': move(-1,0); break;
			case 'ArrowRight': move(1,0); break;
			case 'ArrowUp': move(0,-1); break;
			case 'ArrowDown': move(0,1); break;
		}
	}

	if(statusEl) statusEl.textContent = 'Use arrow keys to move';
	window.addEventListener('keydown', onKey);
	$('btn_back')?.addEventListener('click', ()=>{ location.href = '../../index.html'; });
	
	draw();
}

window.addEventListener('DOMContentLoaded', init);
