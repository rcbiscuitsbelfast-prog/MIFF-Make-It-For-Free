// Grove3DDebug - browser ESM version using CDN imports
import * as THREE from 'https://unpkg.com/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

const container = document.getElementById('gameContainer');
if (!container) throw new Error('Missing container');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x223322);

const rect = container.getBoundingClientRect();
const width = Math.max(320, rect.width || 640);
const height = Math.max(240, rect.height || 480);

const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
container.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Fallback cube to confirm render loop
const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
scene.add(cube);

const loader = new GLTFLoader();
const props = [
  { url: '../../../assets/New Assets/shield_round.gltf', position: [0, 0, 0], scale: 0.02, rotationY: 0 },
  { url: '../../../assets/New Assets/mug_full.gltf', position: [2, 0, -3], scale: 0.02, rotationY: Math.PI / 2 }
];

for (const prop of props) {
  try {
    const gltf = await loader.loadAsync(prop.url);
    const model = gltf.scene;
    model.scale.setScalar(prop.scale);
    model.rotation.y = prop.rotationY;
    model.position.set(...prop.position);
    scene.add(model);
  } catch (err) {
    console.warn(`Failed to load ${prop.url}`, err);
  }
}

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

console.log('Grove3DDebug initialized:', scene.children.length, 'objects in scene');

