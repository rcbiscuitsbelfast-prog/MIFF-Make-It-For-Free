function $(id){ return document.getElementById(id); }

function init(){
    const statusEl = $('status');
    if(statusEl) statusEl.textContent = 'Ready. Tap Back to return.';
    $('btn_back')?.addEventListener('click', ()=>{
        location.href = '../../index.html';
    });
    const cvs = document.getElementById('gameCanvas');
    const ctx = cvs && cvs.getContext ? cvs.getContext('2d') : null;
    if (ctx) {
        ctx.fillStyle = '#1b1f2a';
        ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.fillStyle = '#58a6ff';
        ctx.font = '16px sans-serif';
        ctx.fillText('Remix Lab Ready', 16, 28);
    }
}

window.addEventListener('DOMContentLoaded', init);

