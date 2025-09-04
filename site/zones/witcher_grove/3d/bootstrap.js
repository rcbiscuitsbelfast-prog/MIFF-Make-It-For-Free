// Witcher Grove 3D Bootstrap - Remix-safe, CDN-loaded Three.js
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('gameContainer');
const statusEl = document.getElementById('status');

let renderer, scene, camera, player, controls = { left:false, right:false, up:false, down:false };

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);

    camera = new THREE.PerspectiveCamera(60, 640/480, 0.1, 1000);
    camera.position.set(0, 6, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(640, 480);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Light
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7);
    scene.add(dir);

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
    }catch{
        // Fallback cube
        player = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({ color: 0xd35400 }));
        player.position.set(0,0.5,0);
        scene.add(player);
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
    // Touch joystick (simple left/right/up)
    if (window.innerWidth<=768){
        const ui = document.createElement('div'); ui.style.position='absolute'; ui.style.bottom='8px'; ui.style.right='8px'; ui.style.display='flex'; ui.style.gap='6px';
        const mk=(t)=>{ const b=document.createElement('button'); b.textContent=t; b.className='btn'; b.style.opacity='0.85'; b.style.padding='8px 12px'; return b; };
        const L=mk('◀'), U=mk('⤴'), R=mk('▶');
        L.ontouchstart=(e)=>{ e.preventDefault(); controls.left=true; }; L.ontouchend=(e)=>{ e.preventDefault(); controls.left=false; };
        R.ontouchstart=(e)=>{ e.preventDefault(); controls.right=true; }; R.ontouchend=(e)=>{ e.preventDefault(); controls.right=false; };
        U.ontouchstart=(e)=>{ e.preventDefault(); controls.up=true; setTimeout(()=>controls.up=false, 150); };
        ui.appendChild(L); ui.appendChild(U); ui.appendChild(R); container.appendChild(ui);
    }
}

function followCamera(){
    if (!player) return;
    const target = new THREE.Vector3(player.position.x, 2.5, player.position.z + 6);
    camera.position.lerp(target, 0.1);
    camera.lookAt(player.position.x, 1.5, player.position.z);
}

function update(dt){
    if (!player) return;
    const speed = 4.0;
    if (controls.left) player.position.x -= speed*dt;
    if (controls.right) player.position.x += speed*dt;
    if (controls.up) player.position.z -= speed*dt;
    if (controls.down) player.position.z += speed*dt;
}

let last;
function loop(ts){
    if (!last) last = ts; const dt = Math.min(0.033, (ts-last)/1000); last = ts;
    update(dt);
    followCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}

async function start(){
    if (statusEl) statusEl.textContent = 'Loading 3D…';
    initScene();
    await loadPlayer();
    bindInput();
    if (statusEl) statusEl.textContent = 'Use WASD (or touch) to move. Toggle at top to switch modes.';
    requestAnimationFrame(loop);
}

start();

