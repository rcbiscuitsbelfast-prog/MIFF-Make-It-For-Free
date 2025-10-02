/**
 * 3D Integration for RenderWorld Hub
 * This replaces the 2D placeholder with actual 3D rendering using your existing Three.js setup
 */

class RenderWorld3D {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.objects = new Map();
    this.lights = [];
    
    this.initThreeJS();
    this.createWarehouse();
    this.createSpiritLens();
    this.createPortals();
    this.createNPCs();
    this.setupLighting();
  }

  initThreeJS() {
    // Import Three.js from CDN (like your bootstrap.js does)
    import('https://unpkg.com/three@0.161.0/build/three.module.js')
      .then((THREE) => {
        this.THREE = THREE;
        this.setupScene();
      });
  }

  setupScene() {
    const THREE = this.THREE;
    
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);
    this.scene.fog = new THREE.Fog(0x0a0a0f, 20, 100);

    // Camera setup  
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.canvas.width / this.canvas.height, 
      0.1, 
      1000
    );
    this.camera.position.set(0, 8, 15);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true 
    });
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    console.log('🎨 Three.js scene initialized');
  }

  createWarehouse() {
    const THREE = this.THREE;
    if (!THREE) return;

    // Warehouse floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Warehouse walls (simplified - 4 walls)
    const wallHeight = 15;
    const wallThickness = 0.5;
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      roughness: 0.9,
      metalness: 0.1
    });

    // Front and back walls
    for (let z of [-25, 25]) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(50, wallHeight, wallThickness),
        wallMaterial
      );
      wall.position.set(0, wallHeight / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    }

    // Left and right walls  
    for (let x of [-25, 25]) {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, wallHeight, 50),
        wallMaterial
      );
      wall.position.set(x, wallHeight / 2, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    }

    // Central table for Spirit Lens
    const tableGeometry = new THREE.BoxGeometry(2, 1.5, 2);
    const tableMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x708090,
      roughness: 0.2,
      metalness: 0.8
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.position.set(0, 0.75, 0);
    table.castShadow = true;
    table.receiveShadow = true;
    this.scene.add(table);
    this.objects.set('table', table);

    console.log('🏭 Warehouse created');
  }

  createSpiritLens() {
    const THREE = this.THREE;
    if (!THREE) return;

    // Spirit Lens geometry - crystalline structure
    const lensGeometry = new THREE.OctahedronGeometry(0.3, 2);
    const lensMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d4ff,
      emissive: 0x004466,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.9
    });
    
    const spiritLens = new THREE.Mesh(lensGeometry, lensMaterial);
    spiritLens.position.set(0, 2.5, 0); // Floating above table
    spiritLens.castShadow = true;
    
    // Add glow effect with point light
    const glowLight = new THREE.PointLight(0x00d4ff, 1, 8);
    glowLight.position.copy(spiritLens.position);
    this.scene.add(glowLight);
    this.scene.add(spiritLens);
    
    this.objects.set('spiritLens', {
      mesh: spiritLens,
      light: glowLight,
      rotation: 0
    });

    console.log('🔮 Spirit Lens created');
  }

  createPortals() {
    const THREE = this.THREE;
    if (!THREE) return;

    const portals = [
      { 
        name: 'spiritTamer', 
        position: [-15, 6, -20], 
        color: 0x4488ff,
        emissive: 0x002244
      },
      { 
        name: 'toppler', 
        position: [0, 6, -20], 
        color: 0x44ff88,
        emissive: 0x002244
      },
      { 
        name: 'witcher', 
        position: [15, 6, -20], 
        color: 0xff4488,
        emissive: 0x440022
      }
    ];

    portals.forEach(portalData => {
      // Portal frame
      const frameGeometry = new THREE.RingGeometry(2, 3, 8);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x708090,
        roughness: 0.3,
        metalness: 0.7
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(...portalData.position);
      frame.castShadow = true;

      // Portal energy field
      const energyGeometry = new THREE.RingGeometry(0, 2, 16);
      const energyMaterial = new THREE.MeshStandardMaterial({
        color: portalData.color,
        emissive: portalData.emissive,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const energy = new THREE.Mesh(energyGeometry, energyMaterial);
      energy.position.copy(frame.position);

      // Portal light
      const portalLight = new THREE.PointLight(portalData.color, 2, 15);
      portalLight.position.copy(frame.position);

      this.scene.add(frame);
      this.scene.add(energy);
      this.scene.add(portalLight);

      this.objects.set(portalData.name, {
        frame,
        energy,
        light: portalLight,
        pulsation: 0
      });
    });

    console.log('🚪 Portals created');
  }

  createNPCs() {
    const THREE = this.THREE;
    if (!THREE) return;

    const npcPositions = [
      { name: 'explorer', pos: [-10, 1.7, 8], color: 0xff8844 },
      { name: 'guide', pos: [10, 1.7, 8], color: 0xffaa44 },
      { name: 'mystic', pos: [0, 1.7, 15], color: 0xaa44ff }
    ];

    npcPositions.forEach(npcData => {
      // Simple NPC representation
      const npcGeometry = new THREE.CapsuleGeometry(0.5, 1.5, 8, 16);
      const npcMaterial = new THREE.MeshStandardMaterial({
        color: npcData.color,
        roughness: 0.5,
        metalness: 0.3
      });
      
      const npc = new THREE.Mesh(npcGeometry, npcMaterial);
      npc.position.set(...npcData.pos);
      npc.castShadow = true;
      npc.receiveShadow = true;
      
      this.scene.add(npc);
      this.objects.set(npcData.name, {
        mesh: npc,
        bobbing: 0
      });
    });

    console.log('🤖 NPCs created');
  }

  setupLighting() {
    const THREE = this.THREE;
    if (!THREE) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Main directional light (sun/ceiling)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    this.scene.add(directionalLight);

    // Additional ceiling lights for warehouse feel
    for (let x = -15; x <= 15; x += 10) {
      for (let z = -15; z <= 15; z += 10) {
        const ceilingLight = new THREE.PointLight(0xffffff, 0.5, 12);
        ceilingLight.position.set(x, 12, z);
        this.scene.add(ceilingLight);
      }
    }

    this.lights = [ambientLight, directionalLight];
    console.log('💡 Lighting setup complete');
  }

  updateAnimations(deltaTime, gameState) {
    const THREE = this.THREE;
    if (!THREE || !this.objects) return;

    const time = performance.now() * 0.001;

    // Animate Spirit Lens rotation and pulsing
    const spiritLens = this.objects.get('spiritLens');
    if (spiritLens && gameState.world.spiritLens.active) {
      spiritLens.mesh.rotation.y += deltaTime * 2;
      spiritLens.mesh.rotation.x += deltaTime * 1;
      
      const pulse = 0.8 + Math.sin(time * 3) * 0.2;
      spiritLens.light.intensity = pulse * 1.5;
      spiritLens.mesh.material.emissive.setScalar(pulse * 0.1);
    }

    // Animate portals
    ['spiritTamer', 'toppler', 'witcher'].forEach(portalName => {
      const portal = this.objects.get(portalName);
      if (portal) {
        portal.pulsation += deltaTime;
        const pulse = 0.7 + Math.sin(portal.pulsation * 2) * 0.3;
        
        portal.energy.material.opacity = pulse * 0.7;
        portal.light.intensity = pulse * 2;
        portal.energy.rotation.z += deltaTime * 0.5;
      }
    });

    // Animate NPCs (subtle bobbing)
    ['explorer', 'guide', 'mystic'].forEach(npcName => {
      const npc = this.objects.get(npcName);
      if (npc) {
        npc.bobbing += deltaTime * 2;
        npc.mesh.position.y = 1.7 + Math.sin(npc.bobbing) * 0.05;
      }
    });
  }

  updateCamera(gameState) {
    if (!gameState.player) return;
    
    const player = gameState.player.position;
    
    // Smooth camera following with offset
    const targetX = player.x;
    const targetY = player.y + 6;
    const targetZ = player.z + 12;
    
    const lerpSpeed = 0.05;
    this.camera.position.x += (targetX - this.camera.position.x) * lerpSpeed;
    this.camera.position.y += (targetY - this.camera.position.y) * lerpSpeed;
    this.camera.position.z += (targetZ - this.camera.position.z) * lerpSpeed;
    
    // Look at player position
    this.camera.lookAt(player.x, player.y + 1, player.z);
  }

  render(deltaTime, gameState) {
    if (!this.renderer || !this.scene || !this.camera) return;
    
    this.updateAnimations(deltaTime, gameState);
    this.updateCamera(gameState);
    
    this.renderer.render(this.scene, this.camera);
  }

  handleResize(width, height) {
    if (!this.renderer || !this.camera) return;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    // Clean up Three.js objects
    this.scene?.clear();
  }
}

// Integration with your existing RenderWorldWebBridge
class Enhanced3DWebBridge extends RenderWorldWebBridge {
  constructor(canvas, config = {}) {
    super(canvas, config);
    this.renderer3D = new RenderWorld3D(canvas);
  }

  render() {
    if (this.renderer3D && this.state.renderer) {
      const gameState = this.state.renderer.getGameState();
      const deltaTime = 1/60; // Approximate for now
      this.renderer3D.render(deltaTime, gameState);
    } else {
      // Fallback to 2D if 3D isn't ready
      super.render();
    }
  }

  handleResize() {
    super.handleResize();
    if (this.renderer3D) {
      this.renderer3D.handleResize(this.config.width, this.config.height);
    }
  }

  cleanup() {
    super.cleanup();
    if (this.renderer3D) {
      this.renderer3D.dispose();
    }
  }
}

// Export the enhanced bridge
if (typeof window !== 'undefined') {
  window.RenderWorldWebBridge = Enhanced3DWebBridge;
}

export { Enhanced3DWebBridge as RenderWorldWebBridge, RenderWorld3D };

console.log('🎮 3D RenderWorld integration complete!');

/* renderworld_3d_integration.js - append dynamic overlay of world preview */
(function(){
	async function loadJSON(url){ const r = await fetch(url, { cache:'no-store' }); return await r.json(); }
	async function injectPreview(){
		try {
			const preview = await loadJSON('/MIFF-Make-It-For-Free/render/assets/preview.json');
			const collision = await loadJSON('/MIFF-Make-It-For-Free/render/assets/collision.json');
			console.log('[RenderWorld] assets loaded', { preview: !!preview?.preview, spawn: collision?.spawn });
			// In a future step, map preview matrix to texture/plane; for now, we log spawn
			window.__RW_COLLISION__ = collision;
		} catch (e) { console.warn('[RenderWorld] preview load failed', e); }
	}
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectPreview);
	else injectPreview();
})();
