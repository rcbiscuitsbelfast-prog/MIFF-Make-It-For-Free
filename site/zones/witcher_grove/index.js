function $(id){ return document.getElementById(id); }

function fitCanvas(cvs){
	const container = document.getElementById('gameContainer');
	if(!container || !cvs) return;
	const maxWidth = Math.min(800, container.clientWidth || 800);
	const aspect = 640/480;
	cvs.style.width = maxWidth + 'px';
	cvs.style.height = Math.round(maxWidth / aspect) + 'px';
}

function init(){
	const statusEl = $('status');
	if(statusEl) statusEl.textContent = 'Ready. Tap Back to return.';
	$('btn_back')?.addEventListener('click', ()=>{
		location.href = '../../index.html';
	});

	const cvs = $('gameCanvas');
	fitCanvas(cvs);
	window.addEventListener('resize', ()=>fitCanvas(cvs));
}

window.addEventListener('DOMContentLoaded', init);
