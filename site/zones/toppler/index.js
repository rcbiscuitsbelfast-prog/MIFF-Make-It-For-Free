// Browser-only minimal interactive scaffold for Toppler
function $(id){ return document.getElementById(id); }

function init(){
	const statusEl = $('status');
	if(statusEl) statusEl.textContent = 'Ready. Tap Back to return.';
	$('btn_back')?.addEventListener('click', ()=>{
		location.href = '../../index.html';
	});
}

window.addEventListener('DOMContentLoaded', init);
