// RenderWorld Hub - 3D Interactive Experience
class RenderWorldHub {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = new THREE.Clock();
        
        // Game state
        this.isFirstPerson = false;
        this.player = null;
        this.playerAvatar = null;
        this.spiritLens = null;
        this.portals = [];
        this.npcs = [];
        
        // Mobile controls
        this.isMobile = window.innerWidth <= 768;
        this.joystickActive = false;
        this.joystickPosition = { x: 0, y: 0 };
        this.movementVector = new THREE.Vector3();
        
        // Performance
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 60;
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    async init() {
        try {
            await this.setupScene();
            await this.loadAssets();
            this.setupControls();
            this.setupAudio();
            this.setupMobileControls();
            this.setupEventListeners();
            this.hideLoadingScreen();
            this.animate();
        } catch (error) {
            console.error('RenderWorld initialization failed:', error);
            this.showError('Failed to initialize RenderWorld. Please refresh the page.');
        }
    }
    
    async setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 100);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 5, 10);
        
        // Create renderer
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        
        // Lighting setup
        this.setupLighting();
        
        // Create warehouse environment
        this.createWarehouse();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light (fluorescent)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 20, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -25;
        directionalLight.shadow.camera.right = 25;
        directionalLight.shadow.camera.top = 25;
        directionalLight.shadow.camera.bottom = -25;
        this.scene.add(directionalLight);
        
        // Cyan accent lights
        const cyanLight1 = new THREE.PointLight(0x00ffff, 0.8, 15);
        cyanLight1.position.set(-15, 8, 0);
        this.scene.add(cyanLight1);
        
        const cyanLight2 = new THREE.PointLight(0x00ffff, 0.8, 15);
        cyanLight2.position.set(15, 8, 0);
        this.scene.add(cyanLight2);
        
        // Portal lights
        this.portalLights = [];
    }
    
    createWarehouse() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x333333,
            roughness: 0.1,
            metalness: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Walls
        this.createWalls();
        
        // Pillars
        this.createPillars();
        
        // Ceiling
        this.createCeiling();
    }
    
    createWalls() {
        const wallMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xffffff,
            roughness: 0.2
        });
        
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(100, 40);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, 20, -50);
        backWall.receiveShadow = true;
        this.scene.add(backWall);
        
        // Side walls
        const sideWallGeometry = new THREE.PlaneGeometry(100, 40);
        const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        leftWall.position.set(-50, 20, 0);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.receiveShadow = true;
        this.scene.add(leftWall);
        
        const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
        rightWall.position.set(50, 20, 0);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.receiveShadow = true;
        this.scene.add(rightWall);
    }
    
    createPillars() {
        const pillarGeometry = new THREE.CylinderGeometry(1, 1, 40, 8);
        const pillarMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xcccccc,
            roughness: 0.1
        });
        
        const pillarPositions = [
            [-20, 20, -20], [20, 20, -20],
            [-20, 20, 20], [20, 20, 20],
            [-20, 20, 0], [20, 20, 0]
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(pos[0], pos[1], pos[2]);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
        });
    }
    
    createCeiling() {
        const ceilingGeometry = new THREE.PlaneGeometry(100, 100);
        const ceilingMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xf0f0f0,
            roughness: 0.1
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = 40;
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
    }
    
    async loadAssets() {
        // Create Spirit Lens
        this.createSpiritLens();
        
        // Create Portals
        this.createPortals();
        
        // Create NPCs
        this.createNPCs();
        
        // Create Player Avatar
        this.createPlayerAvatar();
    }
    
    createSpiritLens() {
        // Central crystalline object
        const lensGeometry = new THREE.OctahedronGeometry(2);
        const lensMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            emissive: 0x004444
        });
        
        this.spiritLens = new THREE.Mesh(lensGeometry, lensMaterial);
        this.spiritLens.position.set(0, 3, 0);
        this.spiritLens.castShadow = true;
        this.scene.add(this.spiritLens);
        
        // Pedestal
        const pedestalGeometry = new THREE.CylinderGeometry(3, 3, 1, 8);
        const pedestalMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x666666,
            metalness: 0.8,
            roughness: 0.2
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(0, 0.5, 0);
        pedestal.castShadow = true;
        this.scene.add(pedestal);
        
        // Particle system
        this.createLensParticles();
    }
    
    createLensParticles() {
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        this.lensParticles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.lensParticles);
    }
    
    createPortals() {
        // Spirit Tamer Portal
        this.createPortal('spirit-tamer', -15, 0, 0, 0x0088ff, 'Spirit Tamer');
        
        // Toppler Portal
        this.createPortal('toppler', 0, 0, -15, 0x00ff88, 'Toppler');
        
        // Witcher Grove Portal
        this.createPortal('witcher', 15, 0, 0, 0xff4444, 'Witcher Grove');
    }
    
    createPortal(id, x, y, z, color, name) {
        // Portal frame
        const frameGeometry = new THREE.RingGeometry(4, 6, 16);
        const frameMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(x, y, z);
        frame.rotation.x = -Math.PI / 2;
        this.scene.add(frame);
        
        // Portal effect
        const portalGeometry = new THREE.CircleGeometry(4, 16);
        const portalMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.set(x, y, z);
        portal.rotation.x = -Math.PI / 2;
        this.scene.add(portal);
        
        // Portal light
        const portalLight = new THREE.PointLight(color, 1, 20);
        portalLight.position.set(x, y, z);
        this.scene.add(portalLight);
        this.portalLights.push(portalLight);
        
        // Store portal data
        this.portals.push({
            id: id,
            mesh: frame,
            light: portalLight,
            position: new THREE.Vector3(x, y, z),
            color: color,
            name: name
        });
    }
    
    createNPCs() {
        // Explorer NPC
        this.createNPC('explorer', -10, 0, 5, 0x00ffff, 'Explorer');
        
        // Guide NPC
        this.createNPC('guide', 0, 0, 5, 0x00ff88, 'Guide');
        
        // Mystic NPC
        this.createNPC('mystic', 10, 0, 5, 0xff00ff, 'Mystic');
    }
    
    createNPC(id, x, y, z, color, name) {
        // Simple NPC geometry (placeholder)
        const npcGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
        const npcMaterial = new THREE.MeshLambertMaterial({ color: color });
        const npc = new THREE.Mesh(npcGeometry, npcMaterial);
        npc.position.set(x, y, z);
        npc.castShadow = true;
        this.scene.add(npc);
        
        // NPC data
        this.npcs.push({
            id: id,
            mesh: npc,
            position: new THREE.Vector3(x, y, z),
            color: color,
            name: name,
            animation: 0
        });
    }
    
    createPlayerAvatar() {
        // Player avatar geometry
        const avatarGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
        const avatarMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ff88,
            emissive: 0x004400
        });
        
        this.playerAvatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
        this.playerAvatar.position.set(0, 1, 5);
        this.playerAvatar.castShadow = true;
        this.scene.add(this.playerAvatar);
        
        // Player object for physics
        this.player = {
            position: new THREE.Vector3(0, 1, 5),
            velocity: new THREE.Vector3(0, 0, 0),
            onGround: true
        };
    }
    
    setupControls() {
        // Keyboard controls
        this.keys = {};
        
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('click', (event) => {
            this.handleClick(event);
        });
        
        // View toggle
        document.getElementById('viewToggle').addEventListener('click', () => {
            this.toggleView();
        });
        
        // Menu button
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showMenu();
        });
    }
    
    setupMobileControls() {
        if (!this.isMobile) return;
        
        // Joystick
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystickKnob');
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
        });
        
        joystick.addEventListener('touchmove', (e) => {
            if (!this.joystickActive) return;
            e.preventDefault();
            
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = rect.width / 2 - 15;
            
            if (distance > maxDistance) {
                const angle = Math.atan2(deltaY, deltaX);
                this.joystickPosition.x = Math.cos(angle) * maxDistance;
                this.joystickPosition.y = Math.sin(angle) * maxDistance;
            } else {
                this.joystickPosition.x = deltaX;
                this.joystickPosition.y = deltaY;
            }
            
            joystickKnob.style.transform = `translate(${this.joystickPosition.x}px, ${this.joystickPosition.y}px)`;
            
            // Update movement
            this.movementVector.set(
                this.joystickPosition.x / maxDistance,
                0,
                this.joystickPosition.y / maxDistance
            );
        });
        
        joystick.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.joystickActive = false;
            this.joystickPosition.x = 0;
            this.joystickPosition.y = 0;
            joystickKnob.style.transform = 'translate(0px, 0px)';
            this.movementVector.set(0, 0, 0);
        });
        
        // Action buttons
        document.getElementById('spiritLensBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.activateSpiritLens();
        });
        
        document.getElementById('interactBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.interact();
        });
        
        document.getElementById('jumpBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported:', error);
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    handleClick(event) {
        // Raycasting for interactions
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // Check portal interactions
        this.portals.forEach(portal => {
            const intersects = raycaster.intersectObject(portal.mesh);
            if (intersects.length > 0) {
                this.enterPortal(portal.id);
            }
        });
        
        // Check NPC interactions
        this.npcs.forEach(npc => {
            const intersects = raycaster.intersectObject(npc.mesh);
            if (intersects.length > 0) {
                this.interactWithNPC(npc);
            }
        });
        
        // Check Spirit Lens interaction
        if (this.spiritLens) {
            const intersects = raycaster.intersectObject(this.spiritLens);
            if (intersects.length > 0) {
                this.activateSpiritLens();
            }
        }
    }
    
    enterPortal(portalId) {
        console.log(`Entering portal: ${portalId}`);
        
        // Route to correct game
        switch (portalId) {
            case 'spirit-tamer':
                window.open('/site/#spirit-tamer', '_blank');
                break;
            case 'toppler':
                window.open('/site/#toppler', '_blank');
                break;
            case 'witcher':
                window.open('/site/grove.html', '_blank');
                break;
        }
    }
    
    interactWithNPC(npc) {
        console.log(`Interacting with ${npc.name}`);
        // Add NPC interaction logic here
    }
    
    activateSpiritLens() {
        console.log('Activating Spirit Lens');
        
        // Toggle scanning mode
        const status = document.getElementById('spiritLensStatus');
        if (status.textContent.includes('Scanning')) {
            status.textContent = 'Spirit Lens: Ready';
            this.disableScanningMode();
        } else {
            status.textContent = 'Spirit Lens: Scanning';
            this.enableScanningMode();
        }
    }
    
    enableScanningMode() {
        // Highlight NPCs and portals
        this.npcs.forEach(npc => {
            npc.mesh.material.emissive.setHex(0x004400);
        });
        
        this.portals.forEach(portal => {
            portal.light.intensity = 2;
        });
    }
    
    disableScanningMode() {
        // Remove highlights
        this.npcs.forEach(npc => {
            npc.mesh.material.emissive.setHex(0x000000);
        });
        
        this.portals.forEach(portal => {
            portal.light.intensity = 1;
        });
    }
    
    interact() {
        console.log('Interacting with environment');
        // Add interaction logic here
    }
    
    jump() {
        if (this.player.onGround) {
            this.player.velocity.y = 8;
            this.player.onGround = false;
        }
    }
    
    toggleView() {
        this.isFirstPerson = !this.isFirstPerson;
        
        if (this.isFirstPerson) {
            // First person view
            this.camera.position.copy(this.playerAvatar.position);
            this.camera.position.y += 1.6; // Eye height
            this.controls.enabled = false;
            document.getElementById('viewMode').textContent = 'First Person';
        } else {
            // Third person view
            this.camera.position.set(0, 5, 10);
            this.controls.enabled = true;
            document.getElementById('viewMode').textContent = 'Third Person';
        }
    }
    
    showMenu() {
        // Show menu overlay
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        menu.innerHTML = `
            <div style="background: #1a1a1f; padding: 2rem; border-radius: 8px; text-align: center;">
                <h3 style="color: #00ff88; margin-bottom: 1rem;">RenderWorld Menu</h3>
                <button onclick="window.open('/', '_blank')" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #00ff88; color: #000; border: none; border-radius: 4px; cursor: pointer;">Home</button>
                <button onclick="window.open('/sampler/', '_blank')" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #00ff88; color: #000; border: none; border-radius: 4px; cursor: pointer;">Sampler</button>
                <button onclick="document.body.removeChild(this.parentElement.parentElement)" style="margin: 0.5rem; padding: 0.5rem 1rem; background: #666; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(menu);
    }
    
    updateMovement() {
        if (!this.player) return;
        
        // Keyboard movement
        const moveSpeed = 0.2;
        const moveVector = new THREE.Vector3();
        
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveVector.z -= moveSpeed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveVector.z += moveSpeed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveVector.x -= moveSpeed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveVector.x += moveSpeed;
        
        // Mobile joystick movement
        if (this.isMobile && this.joystickActive) {
            moveVector.x += this.movementVector.x * moveSpeed;
            moveVector.z += this.movementVector.z * moveSpeed;
        }
        
        // Apply movement
        this.player.position.add(moveVector);
        this.playerAvatar.position.copy(this.player.position);
        
        // Update camera for first person
        if (this.isFirstPerson) {
            this.camera.position.copy(this.playerAvatar.position);
            this.camera.position.y += 1.6;
        }
        
        // Update HUD
        document.getElementById('playerPosition').textContent = 
            `${this.player.position.x.toFixed(1)}, ${this.player.position.y.toFixed(1)}, ${this.player.position.z.toFixed(1)}`;
    }
    
    updateAnimations() {
        const time = this.clock.getElapsedTime();
        
        // Spirit Lens animation
        if (this.spiritLens) {
            this.spiritLens.rotation.y = time * 0.5;
            this.spiritLens.position.y = 3 + Math.sin(time * 2) * 0.1;
        }
        
        // Lens particles animation
        if (this.lensParticles) {
            this.lensParticles.rotation.y = time * 0.1;
        }
        
        // NPC animations
        this.npcs.forEach((npc, index) => {
            npc.animation += 0.02;
            npc.mesh.position.y = npc.position.y + Math.sin(npc.animation + index) * 0.05;
            npc.mesh.rotation.y = Math.sin(npc.animation * 0.5 + index) * 0.1;
        });
        
        // Portal animations
        this.portals.forEach((portal, index) => {
            portal.mesh.rotation.z = time * 0.5 + index;
            portal.light.intensity = 1 + Math.sin(time * 2 + index) * 0.3;
        });
    }
    
    updateFPS() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            document.getElementById('fpsCounter').textContent = this.fps;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateMovement();
        this.updateAnimations();
        this.updateFPS();
        
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 1000);
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }
}

// Initialize RenderWorld when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RenderWorldHub();
});