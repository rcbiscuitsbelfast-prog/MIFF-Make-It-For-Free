// Toppler – minimal interactive scaffold with physics, levels, and replay
function $(id){ return document.getElementById(id); }

let ORCH = null;
const State = { Idle: 'idle', Playing: 'playing', Completed: 'completed', Paused: 'paused' };
let game = {
	state: State.Idle,
	levelIndex: 0,
	player: { x: 20, y: 420, w: 40, h: 40, vx: 0, vy: 0 },
	goalX: 560,
	time: 0,
	ctx: null,
	cvs: null,
	trail: [],
	audio: { music:null, ui:null, muted:false, sfx:{ jump:null, collect:null, curse:null } },
	score: 0,
	enemies: [],
	chests: [],
	platforms: []
};

// Medieval sprite/tiles
let SPRITES = { player:null, enemy:null, cliff:null, bridge:null, chest:null };
let FX = [];
let lastSfx = { jump:0, collect:0, curse:0 };
let gamepadEnabled = true;

function persist(){ try { localStorage.setItem('toppler_state', JSON.stringify({ levelIndex: game.levelIndex, muted: game.audio.muted })); } catch {} }
function restore(){ try { const s=localStorage.getItem('toppler_state'); if (s){ const d=JSON.parse(s); if (typeof d.levelIndex==='number') game.levelIndex=d.levelIndex; if (typeof d.muted==='boolean') game.audio.muted=d.muted; } } catch {} }

async function loadOrchestration(){
    // Choose medieval theme if present via query ?theme=medieval
    const params = new URLSearchParams(location.search);
    const medieval = params.get('theme') === 'medieval';
    const path = medieval ? './orchestration.medieval.json' : './orchestration.json';
    try { ORCH = await fetch(path).then(r=>r.json()); } catch { ORCH = null; }
    if (ORCH?.levels?.length){ applyLevel(game.levelIndex||0); ensureLevelSelector(); }
}
function applyLevel(idx){ game.levelIndex = idx; const L = ORCH.levels[idx]; game.goalX = L.goalX; game.player.x = 20; game.player.y = L.height - 60; game.player.vx = 0; game.player.vy = 0; game.trail = []; hideOverlay('winOverlay'); hideOverlay('pauseOverlay'); persist(); }

function fitCanvas(cvs) { const container = document.getElementById('gameContainer'); if (!container || !cvs) return; const maxWidth = Math.min(800, container.clientWidth || 800); const aspect = 640/480; cvs.style.width = maxWidth + 'px'; cvs.style.height = Math.round(maxWidth / aspect) + 'px'; }

function setState(next){ game.state = next; }
function startReplay(){ /* reserved for timed triggers in future */ }

function ensureOverlay(id){ if ($(id)) return $(id); const div=document.createElement('div'); div.id=id; div.style.position='absolute'; div.style.left='50%'; div.style.top='50%'; div.style.transform='translate(-50%,-50%)'; div.style.background='rgba(0,0,0,0.7)'; div.style.padding='16px'; div.style.borderRadius='8px'; div.style.zIndex='10'; div.style.color='#d0d7de'; $('gameContainer').appendChild(div); return div; }
function hideOverlay(id){ const d=$(id); if (d) d.remove(); }

function ensureLevelSelector(){ if ($('levelSelector') || !ORCH?.levels?.length) return; const sel = document.createElement('select'); sel.id='levelSelector'; sel.style.position='absolute'; sel.style.bottom='8px'; sel.style.left='8px'; for (let i=0;i<ORCH.levels.length;i++){ const opt=document.createElement('option'); opt.value=String(i); opt.textContent=ORCH.levels[i].id; sel.appendChild(opt); } sel.value=String(game.levelIndex); sel.onchange=(e)=>{ const idx=parseInt(sel.value,10); applyLevel(idx); setState(State.Idle); }; $('gameContainer').appendChild(sel); }

function bindInputs(){
	window.addEventListener('keydown', (e)=>{ 
		if (e.key === 'ArrowRight') game.player.vx = 140; 
		if (e.key === 'ArrowLeft') game.player.vx = -140; 
		if (e.key === 'ArrowUp' && onGround() && game.state!==State.Paused){ game.player.vy = -360; const now=performance.now(); if (now-lastSfx.jump>150){ try{ game.audio.sfx.jump && game.audio.sfx.jump.play(); }catch{} lastSfx.jump=now; } }
		if (e.key === 'Enter' && game.state === State.Idle){ setState(State.Playing); try{ game.audio.music?.play(); }catch{} }
		if (e.key.toLowerCase() === 'm'){ game.audio.muted = !game.audio.muted; try{ game.audio.music && (game.audio.music.muted = game.audio.muted); }catch{} persist(); }
		if (e.key.toLowerCase() === 'p'){ togglePause(); }
	});
	window.addEventListener('keyup', (e)=>{ if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') game.player.vx = 0; });
	game.cvs.addEventListener('click', ()=>{ if (game.state === State.Idle){ setState(State.Playing); try{ game.audio.music?.play(); }catch{} } });
	$('btn_back')?.addEventListener('click', ()=>{ try{ game.audio.music?.pause(); }catch{} location.href='../../index.html'; });
	if (!$('btnQuest')){ const btn = document.createElement('div'); btn.id='btnQuest'; btn.className='btn btn-secondary'; btn.textContent='[Next Level]'; btn.style.position='absolute'; btn.style.top='8px'; btn.style.left='8px'; $('gameContainer').appendChild(btn); }
	$('btnQuest')?.addEventListener('click', ()=>{ try{ game.audio.ui?.play(); }catch{} if (!ORCH?.levels?.length) return; const next = (game.levelIndex + 1) % ORCH.levels.length; applyLevel(next); setState(State.Idle); const status = $('status'); if (status) status.textContent = `Loaded ${ORCH.levels[next].id}. Press Enter.`; const sel=$('levelSelector'); if (sel) sel.value=String(next); });
	ensureMobileControls();
}

// Start menu overlay for medieval theme
function ensureStartMenu(){
    const params = new URLSearchParams(location.search);
    if (params.get('theme') !== 'medieval') return;
    if (!ORCH?.ui?.startMenu?.enabled) return;
    const id='startMenu'; if ($(id)) return;
    const o = ensureOverlay(id); o.innerHTML='';
    const title = document.createElement('h3'); title.textContent = ORCH.title || 'Toppler Medieval'; o.appendChild(title);
    for (const opt of ORCH.ui.startMenu.options){
        const btn = document.createElement('button'); btn.className='btn'; btn.textContent = opt.label; o.appendChild(btn);
        if (opt.action === 'startGame') btn.onclick=()=>{ hideOverlay(id); setState(State.Playing); try{ game.audio.music?.play(); }catch{} };
        else if (opt.action === 'showCredits') btn.onclick=()=>{ showLoreModal(); };
        else if (opt.submenu){
            btn.onclick=()=>{
                const sub = document.createElement('div'); sub.style.marginTop='8px';
                for (const s of opt.submenu){
                    const row = document.createElement('div'); row.style.margin='4px 0';
                    const lab = document.createElement('span'); lab.textContent = s.label + ': ';
                    row.appendChild(lab);
                    if (s.toggle){
                        const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!game.audio.muted; cb.onchange=()=>{ game.audio.muted = cb.checked; try{ game.audio.music && (game.audio.music.muted = game.audio.muted); }catch{} persist(); };
                        row.appendChild(cb);
                    } else if (s.choices && s.bind){
                        const sel = document.createElement('select');
                        for (const c of s.choices){ const optEl=document.createElement('option'); optEl.value=c; optEl.textContent=c; sel.appendChild(optEl); }
                        sel.onchange=()=>{ try { const st=JSON.parse(localStorage.getItem('toppler_state')||'{}'); st[s.bind]=sel.value; localStorage.setItem('toppler_state', JSON.stringify(st)); } catch {} };
                        row.appendChild(sel);
                    }
                    sub.appendChild(row);
                }
                o.appendChild(sub);
            };
        }
    }
}

function showLoreModal(){
    const m = ensureOverlay('loreModal');
    m.innerHTML = '';
    const html = `
    <div style="max-width:520px;text-align:left">
      <h2 style="margin:0 0 8px 0">The Hollow Isles</h2>
      <p>Long ago, the Bone King cursed these lands. Only the brave may cross the crumbling paths and reclaim the lost relics.</p>
      <p><em>Tip:</em> Chests hold secrets. Skeletons guard them fiercely.</p>
      <p><small>Assets: KayKit, CC0. Framework: MIFF.</small></p>
      <div style="margin-top:10px">
        <button class="btn" id="closeLore">Close</button>
      </div>
    </div>`;
    m.insertAdjacentHTML('beforeend', html);
    const c = document.getElementById('closeLore');
    if (c) c.onclick = ()=> hideOverlay('loreModal');
}

function ensureMobileControls(){
	if (window.innerWidth > 768 || $('mobileControls')) return;
	const wrap = document.createElement('div'); wrap.id='mobileControls'; wrap.style.position='absolute'; wrap.style.bottom='8px'; wrap.style.right='8px'; wrap.style.display='flex'; wrap.style.gap='6px';
	function makeBtn(txt){ const b=document.createElement('button'); b.textContent=txt; b.className='btn'; b.style.opacity='0.85'; b.style.padding='8px 12px'; return b; }
	const left = makeBtn('◀'); const jump = makeBtn('⤴'); const right = makeBtn('▶');
	let leftHeld=false, rightHeld=false;
	function start(dir){ if (dir==='L') { leftHeld=true; game.player.vx=-140; } if (dir==='R') { rightHeld=true; game.player.vx=140; } if (dir==='J' && onGround()) game.player.vy=-360; }
	function end(dir){ if (dir==='L'){ leftHeld=false; if (!rightHeld) game.player.vx=0; else game.player.vx=140; } if (dir==='R'){ rightHeld=false; if (!leftHeld) game.player.vx=0; else game.player.vx=-140; } }
	left.ontouchstart=(e)=>{ e.preventDefault(); start('L'); }; left.ontouchend=(e)=>{ e.preventDefault(); end('L'); };
	right.ontouchstart=(e)=>{ e.preventDefault(); start('R'); }; right.ontouchend=(e)=>{ e.preventDefault(); end('R'); };
	jump.ontouchstart=(e)=>{ e.preventDefault(); start('J'); };
	wrap.appendChild(left); wrap.appendChild(jump); wrap.appendChild(right); $('gameContainer').appendChild(wrap);
}

function togglePause(){ if (game.state===State.Paused){ setState(State.Playing); hideOverlay('pauseOverlay'); } else if (game.state===State.Playing){ setState(State.Paused); const o=ensureOverlay('pauseOverlay'); o.innerHTML=''; const h=document.createElement('h3'); h.textContent='Paused'; o.appendChild(h); const row=document.createElement('div'); const r1=document.createElement('button'); r1.className='btn'; r1.textContent='Resume'; r1.onclick=()=>{ togglePause(); }; const r2=document.createElement('button'); r2.className='btn btn-secondary'; r2.textContent='Restart'; r2.onclick=()=>{ applyLevel(game.levelIndex); setState(State.Idle); hideOverlay('pauseOverlay'); }; row.appendChild(r1); row.appendChild(r2); o.appendChild(row); } }

function onGround(){ return game.player.y + game.player.h >= 480 - 20; }

function getDifficulty(){
    try { const st=JSON.parse(localStorage.getItem('toppler_state')||'{}'); const d=st.difficultyLevel||'Squire'; if (d==='Knight') return { g: 980, enemy: 60 }; if (d==='Warlord') return { g: 1100, enemy: 90 }; return { g: 900, enemy: 40 }; } catch { return { g: 900, enemy: 40 }; }
}

function ensureSpawns(){
    if (!game.enemies.length){ game.enemies = [ { x: 200, y: 460, w: 28, h: 28, dir: 1 }, { x: 360, y: 460, w: 28, h: 28, dir: -1 } ]; }
    if (!game.chests.length){ game.chests = [ { x: 120, y: 460, w: 22, h: 22 }, { x: 480, y: 460, w: 22, h: 22 } ]; }
    if (!game.platforms.length){
        const diff = getDifficulty(); const life = (diff.g>1000)? 4.0 : (diff.g>900? 6.0 : 8.0);
        game.platforms = [
            { x: 80, y: 420, w: 60, h: 10, t: life },
            { x: 200, y: 380, w: 60, h: 10, t: life },
            { x: 320, y: 400, w: 60, h: 10, t: life },
            { x: 440, y: 360, w: 60, h: 10, t: life }
        ];
    }
}

function rectsOverlap(a,b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function gameOver(){ try{ game.audio.sfx.curse && game.audio.sfx.curse.play(); }catch{} setState(State.Paused); const o=ensureOverlay('gameOver'); o.innerHTML=''; const h=document.createElement('h3'); h.textContent='You were taken by the curse...'; const r=document.createElement('button'); r.className='btn'; r.textContent='Respawn'; r.onclick=()=>{ hideOverlay('gameOver'); applyLevel(game.levelIndex); setState(State.Idle); }; o.appendChild(h); o.appendChild(r); }

function update(dt){ if (game.state === State.Playing){ const L = ORCH?.levels?.[game.levelIndex] || { gravity: 900, width: 640, height: 480 }; const diff = getDifficulty(); const grav = diff.g || L.gravity; game.player.vy += grav * dt; game.player.x += game.player.vx * dt; game.player.y += game.player.vy * dt; const floorY = L.height - 20 - game.player.h; if (game.player.y > floorY){ game.player.y = floorY; game.player.vy = 0; } if (game.player.x < 0) game.player.x = 0; if (game.player.x + game.player.w > L.width) game.player.x = L.width - game.player.w; game.trail.push({ x: game.player.x + game.player.w/2, y: game.player.y + game.player.h/2, t: performance.now() }); if (game.trail.length > 30) game.trail.shift(); ensureSpawns(); // Enemies move
    const es = diff.enemy; for (const e of game.enemies){ e.x += e.dir * es * dt; if (e.x < 40){ e.x=40; e.dir=1; } if (e.x + e.w > L.width-40){ e.x = L.width-40 - e.w; e.dir=-1; } if (rectsOverlap({x:game.player.x,y:game.player.y,w:game.player.w,h:game.player.h}, e)){ gameOver(); } }
    // Chests collect
    for (let i=game.chests.length-1;i>=0;i--){ const c=game.chests[i]; if (rectsOverlap({x:game.player.x,y:game.player.y,w:game.player.w,h:game.player.h}, c)){ game.score += 10; game.chests.splice(i,1); FX.push({ t:0, x:c.x+c.w/2, y:c.y+c.h/2 }); const now=performance.now(); if (now-lastSfx.collect>150){ try{ game.audio.sfx.collect && game.audio.sfx.collect.play(); }catch{} lastSfx.collect=now; } } }
    if (game.player.x + game.player.w >= game.goalX){ setState(State.Completed); const s=$('status'); if(s) s.textContent='Completed! 🎉'; const w=ensureOverlay('winOverlay'); w.innerHTML=''; const h=document.createElement('h3'); h.textContent='Level Complete!'; const btn=document.createElement('button'); btn.className='btn'; btn.textContent='Next Level'; btn.onclick=()=>{ hideOverlay('winOverlay'); const next=(game.levelIndex+1)% (ORCH?.levels?.length||1); applyLevel(next); setState(State.Idle); const sel=$('levelSelector'); if (sel) sel.value=String(next); }; w.appendChild(h); w.appendChild(btn); persist(); } } }

function render(){ const { ctx, cvs } = game; ctx.fillStyle = '#0b1020'; ctx.fillRect(0,0,cvs.width,cvs.height); // Tiles
    if (SPRITES.cliff){ for (let x=0; x<cvs.width; x+=32){ ctx.drawImage(SPRITES.cliff, x, cvs.height-32, 32, 32); } }
    // Platforms
    for (const p of game.platforms){ if (p.t>0){ const alpha=Math.max(0.2, p.t/8); ctx.save(); ctx.globalAlpha=alpha; const tile=SPRITES.bridge||SPRITES.cliff; if (tile) ctx.drawImage(tile, p.x, p.y, p.w, p.h); else { ctx.fillStyle='rgba(120,120,180,'+alpha+')'; ctx.fillRect(p.x,p.y,p.w,p.h); } ctx.restore(); } }
    const pulse = 8 + Math.abs(Math.sin(performance.now()/200))*10; ctx.fillStyle = '#0f2a3f'; ctx.fillRect(game.goalX, 0, cvs.width - game.goalX, cvs.height); ctx.fillStyle = '#13466e'; ctx.fillRect(game.goalX - pulse, 0, 3, cvs.height); for (let i=0;i<game.trail.length;i++){ const a = i/game.trail.length; ctx.fillStyle = `rgba(88,166,255,${a*0.6})`; const p = game.trail[i]; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill(); } // Enemies
    for (const e of game.enemies){ if (SPRITES.enemy) ctx.drawImage(SPRITES.enemy, e.x, e.y, e.w, e.h); else { ctx.fillStyle = '#bd4b4b'; ctx.fillRect(e.x, e.y, e.w, e.h); } }
    // Chests (tinted)
    for (let i=0;i<game.chests.length;i++){ const c=game.chests[i]; if (SPRITES.chest){ ctx.save(); ctx.globalAlpha=1; ctx.filter = `hue-rotate(${(i%2)*180}deg)`; ctx.drawImage(SPRITES.chest, c.x, c.y, c.w, c.h); ctx.filter='none'; ctx.restore(); } else { ctx.fillStyle = i%2? '#d46f6f':'#6fb7d4'; ctx.fillRect(c.x, c.y, c.w, c.h); } }
    // Player
    if (SPRITES.player) ctx.drawImage(SPRITES.player, game.player.x, game.player.y, game.player.w, game.player.h); else { ctx.fillStyle = game.state === State.Completed ? '#2ecc71' : '#58a6ff'; ctx.fillRect(game.player.x, game.player.y, game.player.w, game.player.h); }
    // FX
    for (let i=FX.length-1;i>=0;i--){ const f=FX[i]; f.t += 0.016; const r = 3 + f.t*60; ctx.strokeStyle='rgba(255,255,255,'+(1-f.t)+')'; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI*2); ctx.stroke(); if (f.t>1) FX.splice(i,1); }
    ctx.fillStyle = '#d0d7de'; ctx.font = '14px sans-serif'; ctx.fillText(`State: ${game.state}  |  Level: ${ORCH?.levels?.[game.levelIndex]?.id ?? 'L?'}  |  Score: ${game.score}`, 10, 20); ctx.fillText('Enter/click start. Arrows move/jump. [Next Level]. P pause. M mute.', 10, 40); }

function loop(ts){ if (!game._last) game._last = ts; const dt = Math.min(0.033, (ts - game._last) / 1000); game._last = ts; if (game.state!==State.Paused) update(dt); render(); requestAnimationFrame(loop); }

async function init(){ const statusEl = $('status'); if(statusEl) statusEl.textContent = 'Loading…'; restore(); await loadOrchestration(); if(statusEl) statusEl.textContent = 'Ready. Press Enter to start.'; const cvs = $('gameCanvas'); fitCanvas(cvs); window.addEventListener('resize', ()=>fitCanvas(cvs)); game.ctx = cvs.getContext('2d'); game.cvs = cvs; try { game.audio.music = new Audio('../../../assets/audio/music/Loops/1. Dawn of Blades.ogg'); game.audio.music.loop=true; game.audio.music.volume=0.2; game.audio.music.muted = game.audio.muted; } catch {} try { game.audio.ui = new Audio('../../../assets/audio/sfx/ui_click.txt'); } catch {} try { game.audio.sfx.jump = new Audio('../../../assets/audio/sfx/confirmation_3_sean.wav'); game.audio.sfx.collect = new Audio('../../../assets/audio/sfx/completion_4_sean.wav'); game.audio.sfx.curse = new Audio('../../../assets/audio/sfx/damage_5_sean.wav'); } catch {} // Load sprites
    function loadImg(p){ return new Promise((res,rej)=>{ const i=new Image(); i.onload=()=>res(i); i.onerror=()=>rej(); i.src=p; }); }
    try { SPRITES.player = await loadImg('../../../assets/Player.png'); } catch {}
    try { SPRITES.enemy = await loadImg('../../../assets/Skeleton.png'); } catch {}
    try { SPRITES.cliff = await loadImg('../../../assets/Cliff_Tile.png'); } catch {}
    try { SPRITES.bridge = await loadImg('../../../assets/Bridge_Wood.png'); } catch {}
    try { SPRITES.chest = await loadImg('../../../assets/Chest.png'); } catch {}
    bindInputs(); ensureStartMenu(); startReplay(); setState(State.Idle); requestAnimationFrame(loop); }

window.addEventListener('DOMContentLoaded', init);
