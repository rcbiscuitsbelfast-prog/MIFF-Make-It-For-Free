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
        // BRUTALIST WAREHOUSE - 40-foot ceilings, stark white concrete
        const warehouseSize = 80; // Larger warehouse
        const ceilingHeight = 40; // 40-foot equivalent
        
        // Polished concrete floor with slight reflectivity
        const floorGeometry = new THREE.PlaneGeometry(warehouseSize, warehouseSize);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.9,
            envMapIntensity: 0.3
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Stark white concrete walls with subtle weathering
        this.createBrutalistWalls(warehouseSize, ceilingHeight);
        
        // Geometric support pillars creating dramatic shadows
        this.createBrutalistPillars(warehouseSize, ceilingHeight);
        
        // Industrial ceiling with harsh fluorescent lighting
        this.createIndustrialCeiling(warehouseSize, ceilingHeight);
        
        // Central pedestal for Spirit Lens - sleek metal design
        this.createSpiritLensPedestal();
        
        // Add industrial details - exposed beams and conduits
        this.createIndustrialDetails(warehouseSize, ceilingHeight);
        
        console.log('🏭 Brutalist warehouse created with 40-foot ceilings');
    }
    
    createBrutalistWalls(size, height) {
        // Stark white concrete walls with subtle weathering
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf8f8f8,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const wallThickness = 2;
        const wallPositions = [
            { pos: [0, height/2, -size/2], size: [size, height, wallThickness] },
            { pos: [0, height/2, size/2], size: [size, height, wallThickness] },
            { pos: [-size/2, height/2, 0], size: [wallThickness, height, size] },
            { pos: [size/2, height/2, 0], size: [wallThickness, height, size] }
        ];

        wallPositions.forEach((wall, index) => {
            const wallMesh = new THREE.Mesh(
                new THREE.BoxGeometry(...wall.size),
                wallMaterial
            );
            wallMesh.position.set(...wall.pos);
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            this.scene.add(wallMesh);
        });
    }
    
    createBrutalistPillars(size, height) {
        // Geometric support pillars creating dramatic shadows
        const pillarPositions = [
            [-20, height/2, -20], [20, height/2, -20],
            [-20, height/2, 20], [20, height/2, 20],
            [-20, height/2, 0], [20, height/2, 0],
            [0, height/2, -20], [0, height/2, 20],
            [-10, height/2, -10], [10, height/2, -10],
            [-10, height/2, 10], [10, height/2, 10]
        ];

        pillarPositions.forEach(pos => {
            const pillarGeometry = new THREE.CylinderGeometry(0.8, 1.2, height, 8);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0xe8e8e8,
                roughness: 0.6,
                metalness: 0.2
            });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(...pos);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.scene.add(pillar);
        });
    }
    
    createIndustrialCeiling(size, height) {
        // Industrial ceiling with harsh fluorescent lighting
        const ceilingGeometry = new THREE.PlaneGeometry(size, size);
        const ceilingMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf0f0f0,
            roughness: 0.1,
            metalness: 0.3
        });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
        
        // Add harsh fluorescent lights
        this.createFluorescentLights(size, height);
    }
    
    createFluorescentLights(size, height) {
        // Harsh fluorescent lighting casting sharp, angular shadows
        const lightSpacing = 15;
        const lightPositions = [];
        
        for (let x = -size/2 + lightSpacing; x < size/2; x += lightSpacing) {
            for (let z = -size/2 + lightSpacing; z < size/2; z += lightSpacing) {
                lightPositions.push([x, height - 2, z]);
            }
        }
        
        lightPositions.forEach(pos => {
            const light = new THREE.PointLight(0xffffff, 0.8, 20);
            light.position.set(...pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.scene.add(light);
        });
    }
    
    createSpiritLensPedestal() {
        // Central pedestal for Spirit Lens - sleek metal design
        const pedestalGeometry = new THREE.CylinderGeometry(1.5, 2, 1.5, 12);
        const pedestalMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x404040,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x001122
        });
        const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
        pedestal.position.set(0, 0.75, 0);
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        this.scene.add(pedestal);
        this.objects.set('pedestal', pedestal);
    }
    
    createIndustrialDetails(size, height) {
        // Exposed steel beams
        const beamGeometry = new THREE.BoxGeometry(0.3, 0.3, size * 0.8);
        const beamMaterial = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.2
        });

        // Cross beams
        for (let i = -2; i <= 2; i++) {
            const beam = new THREE.Mesh(beamGeometry, beamMaterial);
            beam.position.set(i * 16, height - 2, 0);
            beam.rotation.y = Math.PI / 2;
            beam.castShadow = true;
            this.scene.add(beam);
        }

        // Conduits and pipes
        const conduitGeometry = new THREE.CylinderGeometry(0.1, 0.1, size * 0.6, 8);
        const conduitMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            metalness: 0.6,
            roughness: 0.3
        });

        for (let i = 0; i < 6; i++) {
            const conduit = new THREE.Mesh(conduitGeometry, conduitMaterial);
            conduit.position.set(
                (Math.random() - 0.5) * size * 0.8,
                height - 3,
                (Math.random() - 0.5) * size * 0.8
            );
            conduit.rotation.z = Math.random() * Math.PI / 4;
            this.scene.add(conduit);
        }
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
        // Create Spirit Lens group for complex crystalline structure
        this.spiritLens = new THREE.Group();
        this.spiritLens.position.set(0, 3, 0);
        
        // Main crystalline structure with faceted surfaces
        const lensGeometry = new THREE.OctahedronGeometry(1.5, 3);
        const lensMaterial = new THREE.MeshStandardMaterial({
            color: 0x00d4ff,
            transparent: true,
            opacity: 0.9,
            emissive: 0x002244,
            roughness: 0.1,
            metalness: 0.9,
            envMapIntensity: 1.0
        });
        
        const mainCrystal = new THREE.Mesh(lensGeometry, lensMaterial);
        mainCrystal.castShadow = true;
        this.spiritLens.add(mainCrystal);
        
        // Inner core with different material
        const coreGeometry = new THREE.IcosahedronGeometry(0.8, 2);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x004488,
            roughness: 0.05,
            metalness: 0.95
        });
        
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.spiritLens.add(core);
        
        // Floating 2 feet above pedestal
        this.spiritLens.position.y = 3.5;
        
        // Add pulsing cyan glow with point light
        const glowLight = new THREE.PointLight(0x00d4ff, 2, 15);
        glowLight.position.set(0, 0, 0);
        this.spiritLens.add(glowLight);
        this.spiritLens.glowLight = glowLight;
        
        // Light rays emanating outward
        this.createLightRays();
        
        // Particle effects - tiny motes of light orbiting
        this.createLensParticles();
        
        // Add to scene
        this.scene.add(this.spiritLens);
        
        // Store for animation
        this.spiritLens.rotationSpeed = 0.02;
        this.spiritLens.pulseSpeed = 0.03;
        this.spiritLens.baseIntensity = 2;
        
        console.log('🔮 Spirit Lens created with crystalline structure');
    }
    
    createLightRays() {
        // Light rays emanating outward creating geometric patterns
        const rayCount = 8;
        const rayLength = 8;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const rayGeometry = new THREE.CylinderGeometry(0.05, 0.02, rayLength, 8);
            const rayMaterial = new THREE.MeshBasicMaterial({
                color: 0x00d4ff,
                transparent: true,
                opacity: 0.6,
                emissive: 0x002244
            });
            
            const ray = new THREE.Mesh(rayGeometry, rayMaterial);
            ray.position.set(
                Math.cos(angle) * rayLength / 2,
                0,
                Math.sin(angle) * rayLength / 2
            );
            ray.rotation.z = Math.PI / 2;
            ray.rotation.y = angle;
            
            this.spiritLens.add(ray);
        }
    }
    
    createLensParticles() {
        // Tiny motes of light orbiting around the Spirit Lens
        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const radius = 2 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            const height = (Math.random() - 0.5) * 2;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Cyan color variations
            colors[i * 3] = 0.0;     // R
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2; // G
            colors[i * 3 + 2] = 1.0; // B
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        this.lensParticles = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.lensParticles);
    }
    
    createPortals() {
        // Create three distinct 12-foot tall portals with unique visual effects
        this.createSpiritTamerPortal();
        this.createTopplerPortal();
        this.createWitcherPortal();
    }
    
    createSpiritTamerPortal() {
        // Electric blue energy field with digital lightning
        const portalGroup = new THREE.Group();
        portalGroup.position.set(-20, 6, -25);
        
        // Hexagonal frame with LED strips
        const hexFrameGeometry = new THREE.RingGeometry(5, 6, 6);
        const hexFrameMaterial = new THREE.MeshStandardMaterial({
            color: 0x0088ff,
            emissive: 0x002244,
            metalness: 0.9,
            roughness: 0.1
        });
        const hexFrame = new THREE.Mesh(hexFrameGeometry, hexFrameMaterial);
        hexFrame.rotation.x = -Math.PI / 2;
        portalGroup.add(hexFrame);
        
        // LED strips around the frame
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const ledGeometry = new THREE.BoxGeometry(0.1, 0.1, 1);
            const ledMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                emissive: 0x004488
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(
                Math.cos(angle) * 5.5,
                0,
                Math.sin(angle) * 5.5
            );
            led.rotation.y = angle;
            portalGroup.add(led);
        }
        
        // Electric blue energy field
        const energyGeometry = new THREE.RingGeometry(0, 5, 16);
        const energyMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.rotation.x = -Math.PI / 2;
        portalGroup.add(energy);
        
        // Particle stream effect - blue energy motes flowing upward
        this.createParticleStream(portalGroup, 0x0088ff, 0x00ffff);
        
        // Portal light
        const portalLight = new THREE.PointLight(0x0088ff, 3, 25);
        portalLight.position.set(0, 0, 0);
        portalGroup.add(portalLight);
        
        this.scene.add(portalGroup);
        this.portals.push({
            id: 'spirit-tamer',
            group: portalGroup,
            light: portalLight,
            position: new THREE.Vector3(-20, 6, -25),
            name: 'Spirit Tamer',
            color: 0x0088ff
        });
        
        console.log('⚡ Spirit Tamer Portal created with electric blue lightning');
    }
    
    createTopplerPortal() {
        // Emerald green shimmer with industrial pipes and steam
        const portalGroup = new THREE.Group();
        portalGroup.position.set(0, 6, -25);
        
        // Industrial pipe framework
        const pipePositions = [
            [-6, 0, 0], [6, 0, 0], [0, 0, -6], [0, 0, 6]
        ];
        
        pipePositions.forEach(pos => {
            const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12, 8);
            const pipeMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 0.8,
                roughness: 0.2
            });
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe.position.set(...pos);
            pipe.rotation.z = Math.PI / 2;
            portalGroup.add(pipe);
        });
        
        // Steam vents
        const steamGeometry = new THREE.SphereGeometry(1, 8, 8);
        const steamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.4
        });
        const steam = new THREE.Mesh(steamGeometry, steamMaterial);
        steam.position.y = 2;
        portalGroup.add(steam);
        
        // Emerald shimmer effect
        const shimmerGeometry = new THREE.RingGeometry(0, 5, 16);
        const shimmerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const shimmer = new THREE.Mesh(shimmerGeometry, shimmerMaterial);
        shimmer.rotation.x = -Math.PI / 2;
        portalGroup.add(shimmer);
        
        // Portal light
        const portalLight = new THREE.PointLight(0x00ff88, 3, 25);
        portalLight.position.set(0, 0, 0);
        portalGroup.add(portalLight);
        
        this.scene.add(portalGroup);
        this.portals.push({
            id: 'toppler',
            group: portalGroup,
            light: portalLight,
            position: new THREE.Vector3(0, 6, -25),
            name: 'Toppler',
            color: 0x00ff88
        });
        
        console.log('🏭 Toppler Portal created with emerald shimmer and industrial pipes');
    }
    
    createWitcherPortal() {
        // Deep crimson glow with stone arch and mystical runes
        const portalGroup = new THREE.Group();
        portalGroup.position.set(20, 6, -25);
        
        // Stone archway
        const archGeometry = new THREE.TorusGeometry(5, 1, 8, 16);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.1
        });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        arch.rotation.x = -Math.PI / 2;
        portalGroup.add(arch);
        
        // Mystical runes that glow and fade
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const runeGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.1);
            const runeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                emissive: 0x442200
            });
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                Math.cos(angle) * 5.2,
                0,
                Math.sin(angle) * 5.2
            );
            rune.rotation.y = angle;
            portalGroup.add(rune);
        }
        
        // Floating embers
        for (let i = 0; i < 30; i++) {
            const emberGeometry = new THREE.SphereGeometry(0.1, 4, 4);
            const emberMaterial = new THREE.MeshBasicMaterial({
                color: 0xff6600,
                emissive: 0x220000
            });
            const ember = new THREE.Mesh(emberGeometry, emberMaterial);
            ember.position.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 4,
                (Math.random() - 0.5) * 10
            );
            portalGroup.add(ember);
        }
        
        // Deep crimson energy field
        const energyGeometry = new THREE.RingGeometry(0, 5, 16);
        const energyMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        energy.rotation.x = -Math.PI / 2;
        portalGroup.add(energy);
        
        // Portal light
        const portalLight = new THREE.PointLight(0xff4444, 3, 25);
        portalLight.position.set(0, 0, 0);
        portalGroup.add(portalLight);
        
        this.scene.add(portalGroup);
        this.portals.push({
            id: 'witcher',
            group: portalGroup,
            light: portalLight,
            position: new THREE.Vector3(20, 6, -25),
            name: 'Witcher Grove',
            color: 0xff4444
        });
        
        console.log('🧙‍♂️ Witcher Portal created with crimson glow and mystical runes');
    }
    
    createParticleStream(portalGroup, baseColor, particleColor) {
        // Create particle stream effect flowing upward
        const particleCount = 100;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * 5;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 8;
            
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            
            // Color based on portal type
            const r = (particleColor >> 16) / 255;
            const g = ((particleColor >> 8) & 0xff) / 255;
            const b = (particleColor & 0xff) / 255;
            
            colors[i * 3] = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        portalGroup.add(particleSystem);
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
        // Create three distinct AI NPCs with unique behaviors
        this.createExplorerNPC();
        this.createGuideNPC();
        this.createMysticNPC();
    }
    
    createExplorerNPC() {
        // Sleek android design with white chassis and blue LED details
        const explorerGroup = new THREE.Group();
        explorerGroup.position.set(-15, 1.7, 8);
        
        // Sleek android body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            emissive: 0x002244
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        explorerGroup.add(body);
        
        // Blue LED details
        const ledGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const ledMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            emissive: 0x004488
        });
        
        // LED strips on body
        for (let i = 0; i < 4; i++) {
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(
                (Math.random() - 0.5) * 0.6,
                (Math.random() - 0.5) * 1.2,
                0.3
            );
            explorerGroup.add(led);
        }
        
        // Scanning visor
        const visorGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8);
        const visorMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7,
            emissive: 0x004488
        });
        const visor = new THREE.Mesh(visorGeometry, visorMaterial);
        visor.position.y = 0.8;
        explorerGroup.add(visor);
        
        // Hologram emitter
        const emitterGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const emitterMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8
        });
        const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
        emitter.position.y = 1.5;
        explorerGroup.add(emitter);
        
        this.scene.add(explorerGroup);
        this.npcs.push({
            id: 'explorer',
            group: explorerGroup,
            position: new THREE.Vector3(-15, 1.7, 8),
            name: 'Explorer',
            type: 'android',
            behavior: 'scanning',
            animation: 0,
            lastMoveTime: 0
        });
        
        console.log('🤖 Explorer NPC created - sleek android with scanning behavior');
    }
    
    createGuideNPC() {
        // More human-like appearance but clearly artificial - uncanny valley effect
        const guideGroup = new THREE.Group();
        guideGroup.position.set(15, 1.7, 8);
        
        // Human-like body with golden accents
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa44,
            roughness: 0.6,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        guideGroup.add(body);
        
        // Friendly face
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.8;
        guideGroup.add(head);
        
        // Gesturing arm
        const armGeometry = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(0.3, 0.2, 0);
        arm.rotation.z = Math.PI / 4;
        guideGroup.add(arm);
        
        // Golden accent lighting
        const accentLight = new THREE.PointLight(0xffaa44, 0.5, 3);
        accentLight.position.set(0, 1, 0);
        guideGroup.add(accentLight);
        
        this.scene.add(guideGroup);
        this.npcs.push({
            id: 'guide',
            group: guideGroup,
            position: new THREE.Vector3(15, 1.7, 8),
            name: 'Guide',
            type: 'human-like',
            behavior: 'gesturing',
            animation: 0,
            gestureTime: 0
        });
        
        console.log('👤 Guide NPC created - human-like with gesturing behavior');
    }
    
    createMysticNPC() {
        // Hooded figure with energy coursing through transparent body sections
        const mysticGroup = new THREE.Group();
        mysticGroup.position.set(0, 2, 15); // Floating slightly above ground
        
        // Hooded figure
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa44ff,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x220044,
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        mysticGroup.add(body);
        
        // Floating effect
        mysticGroup.position.y = 2.2;
        
        // Mystical aura
        const auraGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0xaa44ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        mysticGroup.add(aura);
        
        // Energy coursing through body
        const energyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 8);
        const energyMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            emissive: 0x004488
        });
        
        for (let i = 0; i < 3; i++) {
            const energy = new THREE.Mesh(energyGeometry, energyMaterial);
            energy.position.set(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 1.2,
                0
            );
            energy.rotation.z = Math.random() * Math.PI;
            mysticGroup.add(energy);
        }
        
        // Particle effects beneath feet
        this.createMysticParticles(mysticGroup);
        
        this.scene.add(mysticGroup);
        this.npcs.push({
            id: 'mystic',
            group: mysticGroup,
            position: new THREE.Vector3(0, 2.2, 15),
            name: 'Mystic',
            type: 'hooded',
            behavior: 'meditating',
            animation: 0,
            teleportTime: 0,
            colorShift: 0
        });
        
        console.log('🧙‍♂️ Mystic NPC created - hooded figure with floating and color-shifting');
    }
    
    createMysticParticles(mysticGroup) {
        // Particle effects beneath floating mystic
        const particleCount = 20;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2;
            positions[i * 3 + 1] = -1;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
            
            // Purple to cyan color shift
            colors[i * 3] = 0.7;     // R
            colors[i * 3 + 1] = 0.3; // G
            colors[i * 3 + 2] = 1.0; // B
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        mysticGroup.add(particleSystem);
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