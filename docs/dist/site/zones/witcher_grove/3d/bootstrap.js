// Witcher Grove 3D Bootstrap - Remix-safe, CDN-loaded Three.js
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('gameContainer');
const statusEl = document.getElementById('status');

let renderer, scene, camera, player, mixer, controls = { left:false, right:false, up:false, down:false };
let ORCH = null;
const OBJECTS = [];
const NPCS = [];
const MAP_TILES = [];
let uiOverlay, journalEl, mainMenu, inventoryModal;
let camZoom = 1.0;
let panX = 0, panZ = 0;
let touchState = { mode: null, startDist: 0, lastX: 0, lastY: 0 };
let quest2Started = false, quest2Completed = false;
let lastTapTime = 0, touchHoldTimer = null;
let inventory = JSON.parse(localStorage.getItem('grove_inventory') || '[]');
const gltfLoader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);
    // Subtle fog
    scene.fog = new THREE.Fog(0x0b1020, 20, 60);

    camera = new THREE.PerspectiveCamera(60, 640/480, 0.1, 1000);
    camera.position.set(0, 6, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    // Light
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, ORCH?.lights?.hemi ?? 1.0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, ORCH?.lights?.dir ?? 0.8);
    dir.position.set(5,10,7);
    scene.add(dir);
    // Light flicker effect
    setInterval(()=>{ dir.intensity = 0.7 + Math.random()*0.2; }, 300);

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x12361f }));
    ground.rotation.x = -Math.PI/2;
    scene.add(ground);
}

async function loadPlayer(){
    const loader = new GLTFLoader();
    try{
        const glb = await loader.loadAsync('../../../assets/New Assets/Knight.glb');
        player = glb.scene;
        player.scale.set(0.02, 0.02, 0.02);
        player.position.set(0,0,0);
        scene.add(player);
        if (glb.animations && glb.animations.length){
            mixer = new THREE.AnimationMixer(player);
            const clip = glb.animations[0]; const action = mixer.clipAction(clip); action.play();
        }
    }catch{
        // Fallback cube
        player = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0xd35400 }));
        player.position.set(0,0.5,0);
        scene.add(player);
    }
    // Center camera on player at spawn (instant)
    const offY0 = (ORCH?.camera?.offsetY ?? 2.5) * camZoom;
    const offZ0 = (ORCH?.camera?.offsetZ ?? 6) * camZoom;
    camera.position.set(player.position.x + panX, offY0, player.position.z + offZ0 + panZ);
    camera.lookAt(player.position.x + panX, 1.5, player.position.z + panZ);
}

async function loadOrchestration(){
    try { ORCH = await (await fetch('../witcher_grove/orchestration.json')).json(); } catch { ORCH = null; }
}

async function placeProps(){
    if (!ORCH) return;
    const add = (mesh, type)=>{ scene.add(mesh); mesh.userData = { type }; OBJECTS.push(mesh); };
    const props = ORCH.props || [];
    for (const p of props){
        if (p.model){
            try {
                const glb = await gltfLoader.loadAsync(`../../../assets/New Assets/${p.model}`);
                const obj = glb.scene; const s = p.scale ?? 0.02; obj.scale.set(s,s,s);
                obj.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
                if (p.rotationY) obj.rotation.y = p.rotationY;
                scene.add(obj); obj.userData = { type: p.type || 'prop' }; OBJECTS.push(obj);
                continue;
            } catch { /* fall through to primitives */ }
        }
        if (p.type==='tree'){
            const tree = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.0, 8), new THREE.MeshStandardMaterial({ color: 0x1f5c2e }));
            tree.position.set(p.x ?? 0, 1.0, p.z ?? 0); add(tree, 'tree');
        } else if (p.type==='house'){
            const house = new THREE.Mesh(new THREE.BoxGeometry(2,1.2,2), new THREE.MeshStandardMaterial({ color: 0x664d3b }));
            house.position.set(p.x ?? 0, 0.6, p.z ?? 0); add(house, 'house');
        } else if (p.type==='chest'){
            // Try loading a GLTF as a chest stand-in (mug_full)
            try {
                const glb = await gltfLoader.loadAsync('../../../assets/New Assets/mug_full.gltf');
                const chest = glb.scene; const s = p.scale ?? 0.02; chest.scale.set(s,s,s); chest.position.set(p.x ?? 0, p.y ?? 0, p.z ?? 0);
                scene.add(chest); chest.userData = { type:'chest', questReward:'Herb' }; OBJECTS.push(chest);
            } catch {
                const chest = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0xaa8833 }));
                chest.position.set(p.x ?? 0, 0.5, p.z ?? 0); chest.userData = { type:'chest', questReward:'Herb' }; scene.add(chest); OBJECTS.push(chest);
            }
        }
    }
}

async function spawnNPCs(){
    if (!ORCH?.npcPaths) return;
    for (const npc of ORCH.npcPaths){
        let obj, mixerNPC, clips;
        try{
            const glb = await gltfLoader.loadAsync(`../../../assets/New Assets/${npc.model}`);
            obj = glb.scene; const s = npc.scale ?? 0.02; obj.scale.set(s,s,s);
            scene.add(obj); clips = glb.animations || [];
            if (clips.length){ mixerNPC = new THREE.AnimationMixer(obj); const idle = clips[npc.clipIdle||0]; mixerNPC.clipAction(idle).play(); }
        }catch{
            obj = new THREE.Mesh(new THREE.SphereGeometry(0.6,16,16), new THREE.MeshStandardMaterial({ color: 0x8888ff }));
            obj.position.set(0,0.6,0); scene.add(obj);
        }
        NPCS.push({ obj, mixer: mixerNPC, clips, path: npc.waypoints||[], idx: 0, waitUntil: 0, walking:false, clipWalkIdx: npc.clipWalk||0, clipIdleIdx: npc.clipIdle||0 });
    }
}

function bindInput(){
    window.addEventListener('keydown', (e)=>{
        if (e.key==='a'||e.key==='A') controls.left=true;
        if (e.key==='d'||e.key==='D') controls.right=true;
        if (e.key==='w'||e.key==='W') controls.up=true;
        if (e.key==='s'||e.key==='S') controls.down=true;
    });
    window.addEventListener('keyup', (e)=>{
        if (e.key==='a'||e.key==='A') controls.left=false;
        if (e.key==='d'||e.key==='D') controls.right=false;
        if (e.key==='w'||e.key==='W') controls.up=false;
        if (e.key==='s'||e.key==='S') controls.down=false;
    });
    // Removed persistent on-screen buttons; gestures used instead

    // Wheel zoom (desktop)
    container.addEventListener('wheel', (e)=>{ e.preventDefault(); const z = camZoom + Math.sign(e.deltaY)*0.05; camZoom = Math.max(0.6, Math.min(1.8, z)); }, { passive:false });

    // Touch: pinch to zoom, one-finger pan
    container.addEventListener('touchstart', (e)=>{
        if (e.touches.length===2){
            touchState.mode='pinch';
            const dx=e.touches[0].clientX - e.touches[1].clientX;
            const dy=e.touches[0].clientY - e.touches[1].clientY;
            touchState.startDist = Math.hypot(dx,dy);
        } else if (e.touches.length===1){
            touchState.mode='pan'; touchState.lastX=e.touches[0].clientX; touchState.lastY=e.touches[0].clientY;
        }
    }, { passive:true });
    container.addEventListener('touchmove', (e)=>{
        if (touchState.mode==='pinch' && e.touches.length===2){
            const dx=e.touches[0].clientX - e.touches[1].clientX;
            const dy=e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.hypot(dx,dy);
            const factor = (touchState.startDist>0) ? dist/touchState.startDist : 1;
            camZoom = Math.max(0.6, Math.min(1.8, camZoom * (1/factor)));
            touchState.startDist = dist;
        } else if (touchState.mode==='pan' && e.touches.length===1){
            const nx=e.touches[0].clientX, ny=e.touches[0].clientY;
            const dx = (nx - touchState.lastX) * 0.01;
            const dy = (ny - touchState.lastY) * 0.01;
            panX -= dx; panZ += dy; touchState.lastX=nx; touchState.lastY=ny;
        }
    }, { passive:true });
    container.addEventListener('touchend', (e)=>{ if (e.touches.length===0) touchState.mode=null; }, { passive:true });

    // Responsive resize for canvas and camera aspect
    window.addEventListener('resize', ()=>{
        const w = container.clientWidth || 640, h = container.clientHeight || 480;
        renderer.setSize(w, h);
        camera.aspect = w/h; camera.updateProjectionMatrix();
    });
}

// Build terrain from assets/Isometric Blocks/tile_manifest.json
async function buildMap(){
    const base = '../../../assets/Isometric Blocks';
    const manifestUrl = `${base}/tile_manifest.json`;
    let loaded = 0;
    try{
        const res = await fetch(manifestUrl);
        if (!res.ok) throw new Error('manifest fetch failed');
        const manifest = await res.json();
        const tiles = Array.isArray(manifest.tiles) ? manifest.tiles : (Array.isArray(manifest) ? manifest : []);
        for (const t of tiles){
            const file = t.src || t.filename || t.file || t.path; // support new 'src'
            if (!file) { console.warn('Tile entry missing filename', t); continue; }
            const tex = await texLoader.loadAsync(`${base}/${file}`);
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            const size = t.size || 1;
            const geo = new THREE.PlaneGeometry(size, size);
            const mesh = new THREE.Mesh(geo, mat);
            // Isometric-style: lay flat, face upward
            mesh.rotation.x = -Math.PI/2;
            // Optional additional rotation around Y for angled tiles
            if (typeof t.rotationY === 'number') mesh.rotation.y = t.rotationY;
            // Position
            // Manifest: { src, x, y } => map to x,z; optional alt for height
            const px = t.x || 0; const pz = (typeof t.z === 'number') ? t.z : (t.y || 0);
            mesh.position.set(px, (t.alt || 0) + 0.01, pz);
            // Optional scale override
            if (typeof t.scale === 'number') mesh.scale.setScalar(t.scale);
            scene.add(mesh); MAP_TILES.push(mesh); loaded++;
        }
        console.log(`Grove3D Loaded! ${loaded} isometric tiles from manifest.`);
    }catch(err){
        console.warn('[Grove3D] Isometric tile manifest missing or invalid:', err);
        console.warn('[Grove3D] Terrain fallback disabled; no legacy tiles will be created.');
    }
}

function followCamera(){
    if (!player) return;
    const offY = (ORCH?.camera?.offsetY ?? 2.5) * camZoom;
    const offZ = (ORCH?.camera?.offsetZ ?? 6) * camZoom;
    const target = new THREE.Vector3(player.position.x + panX, offY, player.position.z + offZ + panZ);
    camera.position.lerp(target, 0.1);
    camera.lookAt(player.position.x + panX, 1.5, player.position.z + panZ);
}

function update(dt){
    if (!player) return;
    const speed = 4.0;
    if (controls.left) player.position.x -= speed*dt;
    if (controls.right) player.position.x += speed*dt;
    if (controls.up) player.position.z -= speed*dt;
    if (controls.down) player.position.z += speed*dt;
    checkQuestZones();
    updateNPCs(dt);
}

function updateNPCs(dt){
    const now = performance.now();
    for (const n of NPCS){
        if (!n.path.length) continue;
        const wp = n.path[n.idx];
        if (n.waitUntil && now < n.waitUntil) continue;
        const p = n.obj.position; const tx = wp.x, tz = wp.z; const dx = tx - p.x, dz = tz - p.z; const dist = Math.hypot(dx, dz);
        const sp = 1.8*dt; // slower than player
        if (dist > 0.05){
            p.x += (dx/dist)*sp; p.z += (dz/dist)*sp; n.walking = true;
            if (n.mixer && n.clips[n.clipWalkIdx]){ const act = n.mixer.clipAction(n.clips[n.clipWalkIdx]); act.play(); }
        } else {
            n.idx = (n.idx + 1) % n.path.length; n.waitUntil = now + (wp.waitMs||500); n.walking=false;
            if (n.mixer && n.clips[n.clipIdleIdx]){ const act = n.mixer.clipAction(n.clips[n.clipIdleIdx]); act.play(); }
        }
        if (n.mixer) n.mixer.update(dt);
        // Proximity journal ping
        if (player && Math.hypot(n.obj.position.x - player.position.x, n.obj.position.z - player.position.z) < 1.25){
            addJournalEntry('You encounter a wandering hunter.');
        }
    }
}

let last;
function loop(ts){
    if (!last) last = ts; const dt = Math.min(0.033, (ts-last)/1000); last = ts;
    update(dt);
    if (mixer) mixer.update(dt);
    followCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

async function start(){
    if (statusEl) statusEl.textContent = 'Loading 3D…';
    initScene();
    await loadOrchestration();
    await buildMap();
    await loadPlayer();
    await placeProps();
    await spawnNPCs();
    ensureUI(); restoreJournal(); ensureMainMenu();
    bindInput();
    if (statusEl) statusEl.textContent = 'Use WASD (or touch) to move. Toggle at top to switch modes.';
    requestAnimationFrame(loop);
}

start();

function ensureUI(){
    if (uiOverlay) return;
    uiOverlay = document.createElement('div');
    uiOverlay.style.position='absolute'; uiOverlay.style.left='50%'; uiOverlay.style.top='8px'; uiOverlay.style.transform='translateX(-50%)';
    uiOverlay.style.background='rgba(0,0,0,0.5)'; uiOverlay.style.padding='8px 12px'; uiOverlay.style.borderRadius='8px';
    uiOverlay.style.fontSize='12px'; uiOverlay.style.color='#d0d7de';
    uiOverlay.style.display='none';
    container.appendChild(uiOverlay);

    // Journal overlay
    journalEl = document.createElement('div');
    journalEl.style.position='absolute'; journalEl.style.left='50%'; journalEl.style.top='50%'; journalEl.style.transform='translate(-50%,-50%)';
    journalEl.style.background='rgba(0,0,0,0.7)'; journalEl.style.padding='10px 12px'; journalEl.style.borderRadius='6px';
    journalEl.style.fontSize='12px'; journalEl.style.color='#d0d7de'; journalEl.style.display='none'; journalEl.textContent='Journal:';
    container.appendChild(journalEl);
    // Timed story hooks
    if (ORCH?.story){
        for (const s of ORCH.story){ setTimeout(()=>{ addJournalEntry(s.text); }, s.t||0); }
    }
}

function ensureMainMenu(){
    if (mainMenu) return;
    mainMenu = document.createElement('div');
    mainMenu.style.position='absolute'; mainMenu.style.left='50%'; mainMenu.style.top='50%'; mainMenu.style.transform='translate(-50%,-50%)';
    mainMenu.style.background='rgba(20,22,26,0.95)'; mainMenu.style.padding='24px'; mainMenu.style.borderRadius='12px'; 
    mainMenu.style.zIndex='15'; mainMenu.style.textAlign='center'; mainMenu.style.minWidth='280px';
    mainMenu.style.border='1px solid rgba(255,255,255,0.1)'; mainMenu.style.boxShadow='0 8px 32px rgba(0,0,0,0.3)';
    
    const title=document.createElement('h2'); title.textContent='🌲 Witcher Grove 3D'; title.style.margin='0 0 20px 0'; title.style.color='#58a6ff';
    mainMenu.appendChild(title);
    
    const start=document.createElement('button'); start.className='btn'; start.textContent='Start Game'; 
    start.style.width='100%'; start.style.marginBottom='12px'; start.style.padding='12px';
    start.onclick=()=>{ requestFullscreenSafe(); mainMenu.remove(); };
    
    const inventory=document.createElement('button'); inventory.className='btn btn-secondary'; inventory.textContent='Inventory'; 
    inventory.style.width='100%'; inventory.style.marginBottom='12px'; inventory.style.padding='12px';
    inventory.onclick=()=>{ showInventoryModal(); };
    
    const opts=document.createElement('button'); opts.className='btn btn-secondary'; opts.textContent='Options'; 
    opts.style.width='100%'; opts.style.padding='12px';
    opts.onclick=()=>{ showDevUI(); };
    
    mainMenu.appendChild(start); mainMenu.appendChild(inventory); mainMenu.appendChild(opts); 
    container.appendChild(mainMenu);

    let holdTimer=null; container.onmousedown = ()=>{ holdTimer=setTimeout(()=>{ if (!document.body.contains(mainMenu)) container.appendChild(mainMenu); }, 800); };
    container.onmouseup = ()=>{ if (holdTimer) clearTimeout(holdTimer); };
    // Touch long-press to open menu
    container.addEventListener('touchstart', ()=>{ touchHoldTimer = setTimeout(()=>{ if (!document.body.contains(mainMenu)) container.appendChild(mainMenu); }, 800); }, { passive:true });
    container.addEventListener('touchend', ()=>{ if (touchHoldTimer) clearTimeout(touchHoldTimer); }, { passive:true });
    // Double-tap to request fullscreen
    container.addEventListener('touchend', ()=>{ const now=performance.now(); if (now - lastTapTime < 300){ requestFullscreenSafe(); } lastTapTime = now; }, { passive:true });
}

function showDevUI(){
    // Modal panel overlay
    const overlay = document.createElement('div');
    overlay.style.position='absolute'; overlay.style.left='0'; overlay.style.top='0'; overlay.style.right='0'; overlay.style.bottom='0';
    overlay.style.background='rgba(0,0,0,0.6)'; overlay.style.zIndex='20';
    const panel=document.createElement('div'); panel.style.position='absolute'; panel.style.left='50%'; panel.style.top='50%'; panel.style.transform='translate(-50%,-50%)'; panel.style.background='rgba(20,22,26,0.95)'; panel.style.padding='16px'; panel.style.borderRadius='8px'; panel.style.minWidth='240px';
    panel.innerHTML = '<div style="margin:6px 0">Fullscreen: <button class="btn" id="fsBtn">Toggle</button></div>'+
        '<div style="margin:6px 0">Sound: <button class="btn" id="soundBtn">'+((localStorage.getItem('grove_muted')==='true')?'Unmute':'Mute')+'</button></div>'+
        '<div style="margin:6px 0">Difficulty: <select class="btn" id="diffSel"><option value="easy">Easy</option><option value="normal">Normal</option><option value="hard">Hard</option></select></div>'+
        '<div style="margin-top:10px;text-align:right"><button class="btn btn-secondary" id="closeDev">Close</button></div>';
    overlay.appendChild(panel); container.appendChild(overlay);
    const fs=document.getElementById('fsBtn'); if (fs) fs.onclick=()=>requestFullscreenSafe();
    const sb=document.getElementById('soundBtn'); if (sb) sb.onclick=()=>{ const v = localStorage.getItem('grove_muted')==='true'; const nv = (!v).toString(); localStorage.setItem('grove_muted', nv); sb.textContent = (nv==='true')? 'Unmute' : 'Mute'; };
    const ds=document.getElementById('diffSel'); if (ds){ const cur = localStorage.getItem('grove_difficulty')||'normal'; ds.value = cur; ds.onchange=()=>localStorage.setItem('grove_difficulty', ds.value); }
    const cl=document.getElementById('closeDev'); if (cl) cl.onclick=()=>overlay.remove();
}

function requestFullscreenSafe(){ try{ container.requestFullscreen && container.requestFullscreen(); }catch{} }

function checkQuestZones(){
    if (!player) return;
    // Quest 1: Chest
    const chest = OBJECTS.find(o=>o.userData?.type==='chest');
    if (chest){
        const dx = Math.abs(player.position.x - chest.position.x);
        const dz = Math.abs(player.position.z - chest.position.z);
        if (dx < 1 && dz < 1){
            if (uiOverlay){ uiOverlay.textContent = 'Quest Complete: Herb obtained!'; uiOverlay.style.display='block'; setTimeout(()=>{ if (uiOverlay) uiOverlay.style.display='none'; }, 2000); }
            addToInventory('Herb');
            addJournalEntry('Found an Herb in the chest.');
            chest.userData = {}; // prevent repeat
            persistJournal();
            quest2Started = true; addJournalEntry('New Quest: Visit the old house, then the oak.');
        }
    }
    // Quest 2: House then tree sequence
    if (quest2Started && !quest2Completed){
        const house = OBJECTS.find(o=>o.userData?.type==='house');
        const tree = OBJECTS.find(o=>o.userData?.type==='tree');
        if (house && !house.userData?.visited){
            const dx = Math.abs(player.position.x - house.position.x);
            const dz = Math.abs(player.position.z - house.position.z);
            if (dx<1.2 && dz<1.2){ house.userData.visited = true; addJournalEntry('Visited the old house. A whisper points to the oak.'); if (uiOverlay){ uiOverlay.textContent='House visited. Seek the oak.'; uiOverlay.style.display='block'; setTimeout(()=>{ if (uiOverlay) uiOverlay.style.display='none'; }, 2000);} persistJournal(); }
        } else if (house?.userData?.visited && tree && !quest2Completed){
            const dx = Math.abs(player.position.x - tree.position.x);
            const dz = Math.abs(player.position.z - tree.position.z);
            if (dx<1.2 && dz<1.2){ quest2Completed = true; addToInventory('Oak Relic'); addJournalEntry('At the oak: You receive the Oak Relic.'); if (uiOverlay){ uiOverlay.textContent='Quest Chain Complete: Oak Relic acquired!'; uiOverlay.style.display='block'; setTimeout(()=>{ if (uiOverlay) uiOverlay.style.display='none'; }, 2200);} persistJournal(); }
        }
    }
}

function addJournalEntry(text){
    if (!journalEl) return;
    const line = document.createElement('div'); line.textContent = '• ' + text; journalEl.appendChild(line);
}

function persistJournal(){
    try {
        const lines = Array.from(journalEl?.children || []).map(n=>n.textContent);
        localStorage.setItem('grove_journal', JSON.stringify(lines));
    } catch {}
}

function restoreJournal(){
    try {
        const s = localStorage.getItem('grove_journal'); if (!s) return; const lines = JSON.parse(s);
        if (!Array.isArray(lines)) return; for (const t of lines){ addJournalEntry(t.replace(/^•\s*/, '')); }
    } catch {}
}

function addToInventory(item){
    if (!inventory.includes(item)){
        inventory.push(item);
        localStorage.setItem('grove_inventory', JSON.stringify(inventory));
        showOverlay(`Added ${item} to inventory`);
    }
}

function showInventoryModal(){
    if (inventoryModal) return;
    inventoryModal = document.createElement('div');
    inventoryModal.style.position='absolute'; inventoryModal.style.left='0'; inventoryModal.style.top='0'; 
    inventoryModal.style.right='0'; inventoryModal.style.bottom='0'; inventoryModal.style.background='rgba(0,0,0,0.7)'; 
    inventoryModal.style.zIndex='25'; inventoryModal.style.display='flex'; inventoryModal.style.alignItems='center'; 
    inventoryModal.style.justifyContent='center';
    
    const panel = document.createElement('div');
    panel.style.background='rgba(20,22,26,0.95)'; panel.style.padding='20px'; panel.style.borderRadius='12px'; 
    panel.style.minWidth='300px'; panel.style.maxHeight='400px'; panel.style.overflowY='auto';
    
    const title = document.createElement('h3'); title.textContent='Inventory'; title.style.margin='0 0 15px 0'; title.style.color='#d0d7de';
    panel.appendChild(title);
    
    if (inventory.length === 0){
        const empty = document.createElement('div'); empty.textContent='Your inventory is empty.'; empty.style.color='#8b949e'; panel.appendChild(empty);
    } else {
        inventory.forEach(item => {
            const itemEl = document.createElement('div'); 
            itemEl.textContent=`• ${item}`; 
            itemEl.style.padding='8px 0'; 
            itemEl.style.borderBottom='1px solid rgba(255,255,255,0.1)';
            itemEl.style.color='#d0d7de';
            panel.appendChild(itemEl);
        });
    }
    
    const closeBtn = document.createElement('button'); closeBtn.textContent='Close'; closeBtn.className='btn'; 
    closeBtn.style.marginTop='15px'; closeBtn.style.width='100%';
    closeBtn.onclick = () => { inventoryModal.remove(); inventoryModal = null; };
    panel.appendChild(closeBtn);
    
    inventoryModal.appendChild(panel);
    container.appendChild(inventoryModal);
    
    // Close on background click
    inventoryModal.onclick = (e) => { if (e.target === inventoryModal) { inventoryModal.remove(); inventoryModal = null; } };
}

