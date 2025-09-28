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
        this.mobileControlsSystem = null;
        
        // Performance
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 60;
        
        // Audio
        this.audioContext = null;
        this.sounds = {};
        
        // Performance optimization
        this.performanceSettings = {
            targetFPS: 60,
            dynamicQuality: true,
            cullingDistance: 50,
            shadowMapSize: this.isMobile ? 1024 : 2048,
            antialias: !this.isMobile,
            maxParticles: this.isMobile ? 50 : 100
        };
        
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
            this.loadPlayerState(); // Restore saved player state
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
        
        // Create renderer with performance optimizations
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: this.performanceSettings.antialias,
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 2 : 3));
        
        // Shadow settings based on performance
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        this.renderer.shadowMap.autoUpdate = true;
        
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Performance optimizations
        this.setupPerformanceOptimizations();
        
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
        // Enhanced atmospheric lighting system
        
        // Ambient light - reduced for more dramatic shadows
        const ambientLight = new THREE.AmbientLight(0x404040, 0.15);
        this.scene.add(ambientLight);
        
        // Main directional light (harsh fluorescent from ceiling)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(0, 30, 0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = this.performanceSettings.shadowMapSize;
        directionalLight.shadow.mapSize.height = this.performanceSettings.shadowMapSize;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 60;
        directionalLight.shadow.camera.left = -40;
        directionalLight.shadow.camera.right = 40;
        directionalLight.shadow.camera.top = 40;
        directionalLight.shadow.camera.bottom = -40;
        directionalLight.shadow.bias = -0.0005;
        directionalLight.shadow.normalBias = 0.02;
        this.scene.add(directionalLight);
        
        // Create volumetric light beams from ceiling fixtures
        this.createVolumetricLights();
        
        // Dynamic accent lights with portal light bleeding
        this.createDynamicLights();
        
        // Spirit Lens illumination system
        this.setupSpiritLensLighting();
        
        // Initialize particle systems
        this.createParticleSystems();
        
        console.log('💡 Enhanced atmospheric lighting system created');
    }
    
    createVolumetricLights() {
        // Create volumetric light beam effects
        this.volumetricLights = [];
        
        const lightPositions = [
            { x: 0, y: 25, z: 0 },
            { x: -20, y: 25, z: -20 },
            { x: 20, y: 25, z: -20 },
            { x: -20, y: 25, z: 20 },
            { x: 20, y: 25, z: 20 }
        ];
        
        lightPositions.forEach((pos, index) => {
            // Spot light for each ceiling fixture
            const spotLight = new THREE.SpotLight(0xffffff, 0.8, 30, Math.PI / 6, 0.3, 2);
            spotLight.position.set(pos.x, pos.y, pos.z);
            spotLight.target.position.set(pos.x, 0, pos.z);
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            spotLight.shadow.camera.near = 1;
            spotLight.shadow.camera.far = 30;
            this.scene.add(spotLight);
            this.scene.add(spotLight.target);
            
            // Volumetric light beam geometry
            const beamGeometry = new THREE.ConeGeometry(0.1, 25, 8, 1, true);
            const beamMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            
            const lightBeam = new THREE.Mesh(beamGeometry, beamMaterial);
            lightBeam.position.set(pos.x, pos.y - 12.5, pos.z);
            lightBeam.rotation.x = Math.PI;
            this.scene.add(lightBeam);
            
            this.volumetricLights.push({
                spotlight: spotLight,
                beam: lightBeam,
                originalIntensity: 0.8
            });
        });
    }
    
    createDynamicLights() {
        // Portal light bleeding onto nearby surfaces
        this.dynamicLights = [];
        
        // Cyan accent lights that respond to player proximity
        const accentPositions = [
            { x: -15, y: 8, z: 0, color: 0x00ffff },
            { x: 15, y: 8, z: 0, color: 0x00ffff },
            { x: 0, y: 8, z: -15, color: 0x4488ff },
            { x: 0, y: 8, z: 15, color: 0xff4488 }
        ];
        
        accentPositions.forEach(pos => {
            const light = new THREE.PointLight(pos.color, 0.6, 20, 2);
            light.position.set(pos.x, pos.y, pos.z);
            this.scene.add(light);
            
            this.dynamicLights.push({
                light: light,
                originalIntensity: 0.6,
                originalColor: pos.color,
                position: pos
            });
        });
    }
    
    setupSpiritLensLighting() {
        // Dynamic lighting that follows Spirit Lens usage
        this.spiritLensLight = new THREE.PointLight(0x00ffff, 0, 8, 2);
        this.spiritLensLight.position.set(0, 3, 0);
        this.scene.add(this.spiritLensLight);
        
        // Moving light patterns when Spirit Lens is active
        this.scanLights = [];
        for (let i = 0; i < 3; i++) {
            const scanLight = new THREE.PointLight(0x00ffff, 0, 5, 3);
            this.scene.add(scanLight);
            this.scanLights.push(scanLight);
        }
    }
    
    updateDynamicLighting(time) {
        // Update volumetric light intensity based on atmosphere
        this.volumetricLights.forEach((light, index) => {
            const flicker = 1 + Math.sin(time * 2 + index) * 0.05;
            light.spotlight.intensity = light.originalIntensity * flicker;
            light.beam.material.opacity = 0.05 * flicker;
        });
        
        // Update dynamic accent lights based on player proximity
        if (this.player) {
            this.dynamicLights.forEach(lightData => {
                const distance = this.player.position.distanceTo(
                    new THREE.Vector3(lightData.position.x, lightData.position.y, lightData.position.z)
                );
                const proximityFactor = Math.max(0.3, 1 - distance / 15);
                lightData.light.intensity = lightData.originalIntensity * proximityFactor;
            });
        }
        
        // Update Spirit Lens lighting effects
        this.updateSpiritLensLighting(time);
    }
    
    updateSpiritLensLighting(time) {
        if (this.scanningMode) {
            // Pulsing light from Spirit Lens during scanning
            const pulse = 1 + Math.sin(time * 4) * 0.5;
            this.spiritLensLight.intensity = 1.5 * pulse;
            
            // Moving scan lights
            this.scanLights.forEach((light, index) => {
                const angle = time * 2 + (index * Math.PI * 2 / 3);
                const radius = 8 + Math.sin(time * 3) * 2;
                light.position.set(
                    Math.cos(angle) * radius,
                    2 + Math.sin(time * 4 + index) * 0.5,
                    Math.sin(angle) * radius
                );
                light.intensity = 0.8;
            });
            
            // Create moving light patterns on surfaces
            this.createScanLightPatterns(time);
        } else {
            // Gentle Spirit Lens glow when not scanning
            this.spiritLensLight.intensity = 0.3;
            this.scanLights.forEach(light => {
                light.intensity = 0;
            });
        }
    }
    
    createScanLightPatterns(time) {
        // Create dynamic light patterns during scanning
        // This creates the effect of Spirit Lens illumination creating moving patterns
        
        // Modulate existing lights to create scanning pattern
        this.dynamicLights.forEach((lightData, index) => {
            const scanWave = Math.sin(time * 3 + index) * 0.3;
            const newIntensity = lightData.originalIntensity + scanWave;
            lightData.light.intensity = Math.max(0.1, newIntensity);
            
            // Temporary color shift during scanning
            if (this.scanningMode) {
                lightData.light.color.setHex(0x00ffff);
            } else {
                lightData.light.color.setHex(lightData.originalColor);
            }
        });
    }
    
    createParticleSystems() {
        // Create atmospheric particle systems for immersion
        this.particleSystems = [];
        
        // Dust motes floating in light beams
        this.createDustMotes();
        
        // Energy particles around interactive objects
        this.createEnergyParticles();
        
        // Portal-specific particle effects
        this.createPortalParticles();
        
        // Scan pulse effect system
        this.createScanPulseSystem();
        
        console.log('✨ Particle systems initialized');
    }
    
    createDustMotes() {
        // Create floating dust motes in volumetric light beams
        const dustCount = Math.min(this.performanceSettings.maxParticles, 60);
        const dustGeometry = new THREE.BufferGeometry();
        const dustPositions = new Float32Array(dustCount * 3);
        const dustVelocities = new Float32Array(dustCount * 3);
        
        // Initialize dust particles
        for (let i = 0; i < dustCount; i++) {
            const i3 = i * 3;
            
            // Random positions within warehouse
            dustPositions[i3] = (Math.random() - 0.5) * 60;
            dustPositions[i3 + 1] = Math.random() * 25 + 2;
            dustPositions[i3 + 2] = (Math.random() - 0.5) * 60;
            
            // Slow floating velocities
            dustVelocities[i3] = (Math.random() - 0.5) * 0.02;
            dustVelocities[i3 + 1] = Math.random() * 0.01 + 0.005;
            dustVelocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }
        
        dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
        
        const dustMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.03,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true,
            alphaTest: 0.1
        });
        
        this.dustMotes = new THREE.Points(dustGeometry, dustMaterial);
        this.dustMotes.userData = { velocities: dustVelocities };
        this.scene.add(this.dustMotes);
    }
    
    createEnergyParticles() {
        // Energy particles around Spirit Lens
        this.createSpiritLensParticles();
    }
    
    createSpiritLensParticles() {
        const particleCount = 15;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = 1.5 + Math.random() * 0.5;
            
            positions[i3] = Math.cos(angle) * radius;
            positions[i3 + 1] = (Math.random() - 0.5) * 1;
            positions[i3 + 2] = Math.sin(angle) * radius;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        this.spiritLensParticles = new THREE.Points(geometry, material);
        this.spiritLensParticles.position.set(0, 3, 0);
        this.scene.add(this.spiritLensParticles);
    }
    
    createPortalParticles() {
        // Portal particle effects will be added when portals are created
        this.portalParticleEffects = [];
    }
    
    createScanPulseSystem() {
        // Scan pulse effect system
        this.scanPulseActive = false;
    }
    
    createScanPulseEffect() {
        if (this.scanPulseActive) return;
        
        this.scanPulseActive = true;
        
        // Create expanding ring effect
        const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const scanRing = new THREE.Mesh(ringGeometry, ringMaterial);
        scanRing.position.set(0, 0.1, 0);
        scanRing.rotation.x = -Math.PI / 2;
        this.scene.add(scanRing);
        
        // Animate the pulse
        let startTime = performance.now();
        const duration = 1500;
        
        const animate = () => {
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            if (progress < 1) {
                const scale = 1 + progress * 15;
                scanRing.scale.set(scale, scale, 1);
                scanRing.material.opacity = 0.8 * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(scanRing);
                this.scanPulseActive = false;
            }
        };
        
        animate();
    }
    
    updateParticleSystems(time) {
        // Update dust motes
        if (this.dustMotes) {
            const positions = this.dustMotes.geometry.attributes.position.array;
            const velocities = this.dustMotes.userData.velocities;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];
                
                // Reset particles that float too high or far
                if (positions[i + 1] > 30) {
                    positions[i + 1] = 2;
                }
                if (Math.abs(positions[i]) > 35 || Math.abs(positions[i + 2]) > 35) {
                    positions[i] = (Math.random() - 0.5) * 60;
                    positions[i + 2] = (Math.random() - 0.5) * 60;
                }
            }
            
            this.dustMotes.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update Spirit Lens particles
        if (this.spiritLensParticles) {
            this.spiritLensParticles.rotation.y = time * 0.5;
            
            const positions = this.spiritLensParticles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                const angle = time * 2 + (i / 3) * 0.5;
                const radius = 1.5 + Math.sin(time * 3 + i) * 0.3;
                
                positions[i] = Math.cos(angle) * radius;
                positions[i + 1] = Math.sin(time * 4 + i) * 0.5;
                positions[i + 2] = Math.sin(angle) * radius;
            }
            
            this.spiritLensParticles.geometry.attributes.position.needsUpdate = true;
        }
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
    
    setupPerformanceOptimizations() {
        // Enable frustum culling
        this.scene.autoUpdate = true;
        
        // Set up LOD (Level of Detail) system
        this.setupLODSystem();
        
        // Set up dynamic quality scaling
        if (this.performanceSettings.dynamicQuality) {
            this.setupDynamicQuality();
        }
        
        // Optimize shadows
        this.optimizeShadows();
        
        console.log('⚡ Performance optimizations applied');
    }
    
    setupLODSystem() {
        // Create LOD groups for distance-based quality
        this.lodObjects = [];
        
        // NPCs will use LOD
        this.npcs.forEach(npc => {
            if (npc.group) {
                this.createLODForObject(npc.group, 'npc');
            }
        });
        
        // Portals will use LOD
        this.portals.forEach(portal => {
            if (portal.mesh) {
                this.createLODForObject(portal.mesh, 'portal');
            }
        });
    }
    
    createLODForObject(object, type) {
        const lod = new THREE.LOD();
        
        // High detail (close)
        lod.addLevel(object, 0);
        
        // Medium detail (medium distance)
        if (type === 'npc') {
            const mediumDetail = this.createSimplifiedNPC(object);
            lod.addLevel(mediumDetail, 20);
        }
        
        // Low detail (far distance)
        const lowDetail = this.createBillboard(object);
        lod.addLevel(lowDetail, 40);
        
        this.lodObjects.push(lod);
        this.scene.add(lod);
    }
    
    createSimplifiedNPC(originalNPC) {
        // Create a simplified version with fewer polygons
        const simplified = new THREE.Group();
        
        // Just a basic capsule for medium distance
        const geometry = new THREE.CapsuleGeometry(0.4, 1.5, 3, 6);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
        const mesh = new THREE.Mesh(geometry, material);
        
        simplified.add(mesh);
        simplified.position.copy(originalNPC.position);
        
        return simplified;
    }
    
    createBillboard(object) {
        // Create a billboard sprite for far distances
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Draw a simple representation
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(20, 10, 24, 44);
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(32, 20, 12, 0, Math.PI * 2);
        ctx.fill();
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.copy(object.position);
        sprite.scale.set(2, 2, 1);
        
        return sprite;
    }
    
    setupDynamicQuality() {
        // Monitor performance and adjust quality dynamically
        this.qualityCheckInterval = setInterval(() => {
            this.checkPerformanceAndAdjust();
        }, 2000); // Check every 2 seconds
    }
    
    checkPerformanceAndAdjust() {
        const currentFPS = this.fps;
        const targetFPS = this.performanceSettings.targetFPS;
        
        if (currentFPS < targetFPS * 0.8) { // If FPS drops below 80% of target
            this.lowerQuality();
        } else if (currentFPS > targetFPS * 0.95) { // If FPS is stable above 95% of target
            this.raiseQuality();
        }
    }
    
    lowerQuality() {
        console.log('📉 Lowering quality for better performance');
        
        // Reduce shadow map size
        if (this.renderer.shadowMap.getSize().width > 512) {
            const newSize = Math.max(512, this.renderer.shadowMap.getSize().width / 2);
            this.updateShadowMapSize(newSize);
        }
        
        // Reduce particle count
        this.performanceSettings.maxParticles = Math.max(20, this.performanceSettings.maxParticles * 0.7);
        
        // Disable some visual effects
        this.scene.fog.far = Math.max(30, this.scene.fog.far * 0.8);
    }
    
    raiseQuality() {
        console.log('📈 Raising quality - performance is good');
        
        // Increase shadow map size (up to original)
        const originalSize = this.isMobile ? 1024 : 2048;
        if (this.renderer.shadowMap.getSize().width < originalSize) {
            const newSize = Math.min(originalSize, this.renderer.shadowMap.getSize().width * 1.5);
            this.updateShadowMapSize(newSize);
        }
        
        // Increase particle count
        this.performanceSettings.maxParticles = Math.min(
            this.isMobile ? 50 : 100, 
            this.performanceSettings.maxParticles * 1.2
        );
        
        // Restore visual effects
        this.scene.fog.far = Math.min(100, this.scene.fog.far * 1.1);
    }
    
    updateShadowMapSize(size) {
        // Update shadow map size for all lights
        this.scene.traverse((child) => {
            if (child.isLight && child.shadow) {
                child.shadow.mapSize.width = size;
                child.shadow.mapSize.height = size;
                child.shadow.map?.dispose();
                child.shadow.map = null;
            }
        });
    }
    
    optimizeShadows() {
        // Optimize shadow settings
        this.scene.traverse((child) => {
            if (child.isLight && child.shadow) {
                // Adjust shadow camera settings for performance
                child.shadow.camera.near = 0.5;
                child.shadow.camera.far = this.isMobile ? 30 : 50;
                child.shadow.bias = -0.0001;
                child.shadow.normalBias = 0.02;
                
                // Use smaller shadow map on mobile
                child.shadow.mapSize.width = this.performanceSettings.shadowMapSize;
                child.shadow.mapSize.height = this.performanceSettings.shadowMapSize;
            }
        });
    }
    
    updateNPCBehaviors(time) {
        this.npcs.forEach(npc => {
            switch (npc.id) {
                case 'explorer':
                    this.updateExplorerBehavior(npc, time);
                    break;
                case 'guide':
                    this.updateGuideBehavior(npc, time);
                    break;
                case 'mystic':
                    this.updateMysticBehavior(npc, time);
                    break;
            }
        });
    }
    
    updateExplorerBehavior(npc, time) {
        // Explorer: scans portals, emits holograms, walks between locations
        npc.animation += 0.02;
        
        // Scanning animation - head rotation toward portals
        const scanCycle = Math.sin(time * 0.5) * Math.PI * 0.3;
        if (npc.group.children[0]) { // Head/body
            npc.group.children[0].rotation.y = scanCycle;
        }
        
        // Hologram emission effect
        const hologramEmitter = npc.group.children.find(child => child.material && child.material.color.getHex() === 0x00ffff);
        if (hologramEmitter) {
            hologramEmitter.material.emissive.setHex(0x004444);
            hologramEmitter.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;
        }
        
        // Walking between locations (every 10 seconds)
        if (time - npc.lastMoveTime > 10) {
            const targetPositions = [
                new THREE.Vector3(-15, 1.7, 8),
                new THREE.Vector3(-10, 1.7, -10),
                new THREE.Vector3(-20, 1.7, 0)
            ];
            
            const targetIndex = Math.floor(time / 10) % targetPositions.length;
            const target = targetPositions[targetIndex];
            
            // Smooth movement toward target
            npc.group.position.lerp(target, 0.01);
            npc.position.copy(npc.group.position);
            
            if (npc.group.position.distanceTo(target) < 0.5) {
                npc.lastMoveTime = time;
            }
        }
        
        // Subtle floating animation
        npc.group.position.y = npc.position.y + Math.sin(time * 2) * 0.03;
    }
    
    updateGuideBehavior(npc, time) {
        // Guide: gestures toward Spirit Lens, waves at player, demonstrates actions
        npc.animation += 0.015;
        
        // Gesturing toward Spirit Lens
        if (this.spiritLens) {
            const direction = new THREE.Vector3();
            direction.subVectors(this.spiritLens.position, npc.group.position);
            direction.normalize();
            
            // Point toward Spirit Lens
            const targetRotation = Math.atan2(direction.x, direction.z);
            npc.group.rotation.y = THREE.MathUtils.lerp(npc.group.rotation.y, targetRotation, 0.02);
            
            // Arm gesturing animation
            const gestureIntensity = 0.3 + Math.sin(time * 1.5) * 0.2;
            npc.gestureTime = time;
        }
        
        // Wave at player when nearby
        if (this.player) {
            const playerDistance = npc.group.position.distanceTo(this.player.position);
            if (playerDistance < 8) {
                // Waving animation
                const waveAnimation = Math.sin(time * 4) * 0.5;
                // Apply to arm if available
                const arm = npc.group.children.find(child => child.position.x > 0.3); // Right arm
                if (arm) {
                    arm.rotation.z = waveAnimation;
                }
            }
        }
        
        // Gentle floating
        npc.group.position.y = npc.position.y + Math.sin(time * 1.5) * 0.02;
        
        // Demonstration actions (periodic)
        const demoTime = Math.floor(time / 8) % 3;
        switch (demoTime) {
            case 0: // Point to Spirit Lens
                break;
            case 1: // Point to portals
                const portalDirection = Math.sin(time * 0.5) * Math.PI;
                npc.group.rotation.y = portalDirection;
                break;
            case 2: // Neutral stance
                npc.group.rotation.y = THREE.MathUtils.lerp(npc.group.rotation.y, 0, 0.05);
                break;
        }
    }
    
    updateMysticBehavior(npc, time) {
        // Mystic: meditates, teleports short distances, color-shifts near portals
        npc.animation += 0.01;
        
        // Meditation floating - more pronounced
        const meditationFloat = Math.sin(time * 0.8) * 0.15;
        npc.group.position.y = npc.position.y + meditationFloat;
        
        // Slow rotation while meditating
        npc.group.rotation.y += 0.005;
        
        // Color shifting based on proximity to portals
        let nearestPortalDistance = Infinity;
        let nearestPortalColor = 0xaa44ff; // Default purple
        
        this.portals.forEach(portal => {
            const distance = npc.group.position.distanceTo(portal.position);
            if (distance < nearestPortalDistance) {
                nearestPortalDistance = distance;
                // Change color based on portal type
                switch (portal.id) {
                    case 'spiritTamer':
                        nearestPortalColor = 0x4488ff; // Blue
                        break;
                    case 'toppler':
                        nearestPortalColor = 0x44ff88; // Green
                        break;
                    case 'witcher':
                        nearestPortalColor = 0xff4488; // Red
                        break;
                }
            }
        });
        
        // Apply color shifting
        if (nearestPortalDistance < 15) {
            const colorShiftIntensity = (15 - nearestPortalDistance) / 15;
            npc.colorShift = THREE.MathUtils.lerp(npc.colorShift, colorShiftIntensity, 0.02);
            
            // Update material color
            const body = npc.group.children.find(child => child.material && child.material.color);
            if (body) {
                const currentColor = new THREE.Color(0xaa44ff);
                const targetColor = new THREE.Color(nearestPortalColor);
                body.material.color.lerpColors(currentColor, targetColor, npc.colorShift);
                body.material.emissiveIntensity = npc.colorShift * 0.3;
            }
        }
        
        // Teleportation (every 15 seconds)
        if (time - npc.teleportTime > 15) {
            const teleportPositions = [
                new THREE.Vector3(0, 2.2, 15),
                new THREE.Vector3(-5, 2.2, 12),
                new THREE.Vector3(5, 2.2, 18),
                new THREE.Vector3(0, 2.2, 20)
            ];
            
            const targetIndex = Math.floor(time / 15) % teleportPositions.length;
            const target = teleportPositions[targetIndex];
            
            // Instant teleportation with particle effect
            if (npc.group.position.distanceTo(target) > 1) {
                // Fade out effect
                npc.group.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = 0.3;
                        child.material.transparent = true;
                    }
                });
                
                // Teleport after brief delay
                setTimeout(() => {
                    npc.group.position.copy(target);
                    npc.position.copy(target);
                    
                    // Fade back in
                    npc.group.children.forEach(child => {
                        if (child.material) {
                            child.material.opacity = 1;
                        }
                    });
                }, 200);
                
                npc.teleportTime = time;
            }
        }
        
        // Energy particles animation
        const particles = npc.group.children.find(child => child.type === 'Points');
        if (particles) {
            particles.rotation.y = time * 0.5;
            particles.position.y = Math.sin(time * 2) * 0.1;
        }
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
        // Create modular 3D player avatar using geometric character system
        this.playerAvatar = this.createGeometricCharacter();
        this.playerAvatar.position.set(0, 1, 5);
        this.playerAvatar.castShadow = true;
        this.scene.add(this.playerAvatar);
        
        // Player object for physics and state
        this.player = {
            position: new THREE.Vector3(0, 1, 5),
            velocity: new THREE.Vector3(0, 0, 0),
            onGround: true,
            isMoving: false,
            movementDirection: new THREE.Vector3(),
            animationState: 'idle',
            animationTime: 0
        };
        
        // Camera modes
        this.cameraOffset = new THREE.Vector3(0, 3, 8); // Third person offset
        this.firstPersonOffset = new THREE.Vector3(0, 1.7, 0); // First person offset
        
        console.log('👤 Modular player avatar created');
    }
    
    createGeometricCharacter() {
        // Create a 3D geometric character using Three.js primitives
        const character = new THREE.Group();
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const headMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc99,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.7;
        head.castShadow = true;
        character.add(head);
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 6, 4);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1, 1.75, 0.25);
        rightEye.position.set(0.1, 1.75, 0.25);
        character.add(leftEye, rightEye);
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.8, 4, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x4488ff,
            roughness: 0.6
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        character.add(body);
        
        // Arms
        const armGeometry = new THREE.CapsuleGeometry(0.1, 0.6, 3, 6);
        const armMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc99,
            roughness: 0.8
        });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 1.1, 0);
        rightArm.position.set(0.5, 1.1, 0);
        leftArm.castShadow = true;
        rightArm.castShadow = true;
        character.add(leftArm, rightArm);
        
        // Legs
        const legGeometry = new THREE.CapsuleGeometry(0.12, 0.8, 4, 8);
        const legMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2266cc,
            roughness: 0.7
        });
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15, 0.2, 0);
        rightLeg.position.set(0.15, 0.2, 0);
        leftLeg.castShadow = true;
        rightLeg.castShadow = true;
        character.add(leftLeg, rightLeg);
        
        // Store body parts for animation
        character.userData.bodyParts = {
            head,
            body,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            leftEye,
            rightEye
        };
        
        return character;
    }
    
    updatePlayerAvatar(deltaTime) {
        if (!this.playerAvatar || !this.player) return;
        
        // Update avatar position
        this.playerAvatar.position.copy(this.player.position);
        
        // Update animation state
        const wasMoving = this.player.isMoving;
        this.player.isMoving = this.player.velocity.length() > 0.01;
        
        if (this.player.isMoving !== wasMoving) {
            this.player.animationState = this.player.isMoving ? 'walk' : 'idle';
            this.player.animationTime = 0;
        }
        
        // Update animation time
        this.player.animationTime += deltaTime;
        
        // Apply animations
        this.animateCharacter(deltaTime);
        
        // Update avatar rotation based on movement direction
        if (this.player.isMoving && this.player.movementDirection.length() > 0.1) {
            const targetRotation = Math.atan2(
                this.player.movementDirection.x, 
                this.player.movementDirection.z
            );
            this.playerAvatar.rotation.y = THREE.MathUtils.lerp(
                this.playerAvatar.rotation.y, 
                targetRotation, 
                deltaTime * 8
            );
        }
    }
    
    animateCharacter(deltaTime) {
        if (!this.playerAvatar.userData.bodyParts) return;
        
        const parts = this.playerAvatar.userData.bodyParts;
        const time = this.player.animationTime;
        
        switch (this.player.animationState) {
            case 'idle':
                // Subtle breathing animation
                const breathe = Math.sin(time * 2) * 0.02;
                parts.body.scale.y = 1 + breathe;
                parts.head.position.y = 1.7 + breathe * 0.5;
                break;
                
            case 'walk':
                // Walking animation - arm and leg swinging
                const walkCycle = time * 6; // Walk speed
                const armSwing = Math.sin(walkCycle) * 0.3;
                const legSwing = Math.sin(walkCycle + Math.PI) * 0.2;
                
                // Arms swing opposite to each other
                parts.leftArm.rotation.x = armSwing;
                parts.rightArm.rotation.x = -armSwing;
                
                // Legs swing opposite to each other
                parts.leftLeg.rotation.x = legSwing;
                parts.rightLeg.rotation.x = -legSwing;
                
                // Slight body bob
                const bob = Math.sin(walkCycle * 2) * 0.05;
                parts.body.position.y = 0.9 + bob;
                parts.head.position.y = 1.7 + bob;
                break;
        }
    }
    
    toggleCameraMode() {
        this.isFirstPerson = !this.isFirstPerson;
        
        if (this.isFirstPerson) {
            // Switch to first person
            this.playerAvatar.visible = false; // Hide avatar in first person
            this.updateFirstPersonCamera();
        } else {
            // Switch to third person
            this.playerAvatar.visible = true; // Show avatar in third person
            this.updateThirdPersonCamera();
        }
        
        // Update HUD
        const viewMode = document.getElementById('viewMode');
        if (viewMode) {
            viewMode.textContent = this.isFirstPerson ? 'First Person' : 'Third Person';
        }
        
        console.log(`📷 Camera mode: ${this.isFirstPerson ? 'First Person' : 'Third Person'}`);
    }
    
    updateFirstPersonCamera() {
        if (!this.player) return;
        
        const targetPosition = this.player.position.clone().add(this.firstPersonOffset);
        this.camera.position.lerp(targetPosition, 0.1);
        
        // Disable orbit controls in first person
        this.controls.enabled = false;
    }
    
    updateThirdPersonCamera() {
        if (!this.player) return;
        
        const targetPosition = this.player.position.clone().add(this.cameraOffset);
        
        // Smooth camera following
        this.camera.position.lerp(targetPosition, 0.1);
        this.controls.target.lerp(this.player.position, 0.1);
        
        // Enable orbit controls in third person
        this.controls.enabled = true;
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
        // Initialize mobile controls system with sub-20ms touch latency
        try {
            // Import and initialize the enhanced mobile touch system
            if (typeof window.MobileGameBridge !== 'undefined') {
                this.mobileControlsSystem = new window.MobileGameBridge(this);
                console.log('📱 Enhanced mobile controls integrated');
            } else {
                // Fallback to basic mobile controls
                this.setupBasicMobileControls();
            }
        } catch (error) {
            console.warn('Mobile controls failed to initialize:', error);
            this.setupBasicMobileControls();
        }
        
        // Setup mobile-specific UI optimizations
        this.setupMobileUI();
    }
    
    setupBasicMobileControls() {
        if (!this.isMobile) return;
        
        // Enhanced joystick with better responsiveness
        const joystick = document.getElementById('joystick');
        const joystickKnob = document.getElementById('joystickKnob');
        
        if (!joystick || !joystickKnob) return;
        
        joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystickActive = true;
        }, { passive: false });
        
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
            
            // Update movement with improved responsiveness
            const normalizedX = this.joystickPosition.x / maxDistance;
            const normalizedY = this.joystickPosition.y / maxDistance;
            
            this.movementVector.set(normalizedX, 0, normalizedY);
            this.handleMobileMovement({ x: normalizedX, y: normalizedY });
        }, { passive: false });
        
        joystick.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.joystickActive = false;
            this.joystickPosition.x = 0;
            this.joystickPosition.y = 0;
            joystickKnob.style.transform = 'translate(0px, 0px)';
            this.movementVector.set(0, 0, 0);
            this.handleMobileMovement({ x: 0, y: 0 });
        }, { passive: false });
        
        // Enhanced action buttons with haptic feedback
        this.setupActionButton('spiritLensBtn', () => this.useSpiritLens());
        this.setupActionButton('interactBtn', () => this.interact());
        this.setupActionButton('jumpBtn', () => this.jump());
    }
    
    setupActionButton(buttonId, action) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(0.9)';
            button.style.background = 'rgba(0, 255, 136, 0.8)';
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
            
            action();
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            button.style.transform = 'scale(1)';
            button.style.background = 'rgba(0, 255, 136, 0.2)';
        }, { passive: false });
    }
    
    setupMobileUI() {
        // Add mobile-specific UI optimizations
        if (this.isMobile) {
            // Show mobile controls
            const mobileControls = document.querySelector('.mobile-controls');
            if (mobileControls) {
                mobileControls.style.display = 'block';
            }
            
            // Optimize touch targets for mobile
            const actionButtons = document.querySelectorAll('.action-btn');
            actionButtons.forEach(btn => {
                btn.style.minWidth = '60px';
                btn.style.minHeight = '60px';
                btn.style.fontSize = '16px';
            });
            
            // Add persistent menu icon for returning to Sampler
            this.addPersistentMenuIcon();
        }
    }
    
    addPersistentMenuIcon() {
        const existingIcon = document.getElementById('persistent-menu-icon');
        if (existingIcon) return;
        
        const menuIcon = document.createElement('div');
        menuIcon.id = 'persistent-menu-icon';
        menuIcon.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 255, 136, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10001;
            transition: all 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
            backdrop-filter: blur(10px);
        `;
        
        menuIcon.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
            </svg>
        `;
        
        menuIcon.title = 'Return to MIFF Sampler';
        
        // Add hover/touch effects
        menuIcon.addEventListener('mouseenter', () => {
            menuIcon.style.transform = 'scale(1.1)';
            menuIcon.style.background = 'rgba(0, 255, 136, 1)';
        });
        
        menuIcon.addEventListener('mouseleave', () => {
            menuIcon.style.transform = 'scale(1)';
            menuIcon.style.background = 'rgba(0, 255, 136, 0.9)';
        });
        
        menuIcon.addEventListener('click', () => {
            window.location.href = '../sampler/';
        });
        
        document.body.appendChild(menuIcon);
    }
    
    // Mobile-specific game methods
    handleMobileMovement(vector) {
        if (!this.player) return;
        
        // Convert joystick input to player movement with improved responsiveness
        const speed = 0.15; // Slightly faster for mobile
        const moveSpeed = speed * this.clock.getDelta() * 60; // Frame-rate independent
        
        // Apply movement to player
        if (this.player.position) {
            const forward = new THREE.Vector3(0, 0, -1);
            const right = new THREE.Vector3(1, 0, 0);
            
            // Get camera direction for relative movement
            const cameraDirection = new THREE.Vector3();
            this.camera.getWorldDirection(cameraDirection);
            cameraDirection.y = 0;
            cameraDirection.normalize();
            
            const cameraRight = new THREE.Vector3();
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
            
            // Apply movement relative to camera
            const movement = new THREE.Vector3();
            movement.addScaledVector(cameraRight, vector.x * moveSpeed);
            movement.addScaledVector(cameraDirection, -vector.y * moveSpeed);
            
            this.player.position.add(movement);
            
            // Update player avatar if it exists
            if (this.playerAvatar && this.playerAvatar.position) {
                this.playerAvatar.position.copy(this.player.position);
            }
            
            // Update camera follow
            if (!this.isFirstPerson) {
                this.updateThirdPersonCamera();
            }
        }
    }
    
    useSpiritLens() {
        this.activateSpiritLens();
    }
    
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.sounds = {};
            this.ambientSounds = {};
            
            // Initialize audio system
            this.initializeAudioSystem();
            
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.warn('Audio context not supported:', error);
        }
    }
    
    initializeAudioSystem() {
        // Create master gain node for volume control
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.7; // Master volume
        
        // Create separate gain nodes for different audio types
        this.musicGain = this.audioContext.createGain();
        this.sfxGain = this.audioContext.createGain();
        this.ambientGain = this.audioContext.createGain();
        
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.ambientGain.connect(this.masterGain);
        
        // Set initial volumes
        this.musicGain.gain.value = 0.5;
        this.sfxGain.gain.value = 0.8;
        this.ambientGain.gain.value = 0.6;
        
        // Generate procedural sounds
        this.generateProceduralSounds();
        
        // Start ambient warehouse sounds
        this.startAmbientAudio();
    }
    
    generateProceduralSounds() {
        // Generate electronic sounds procedurally for better mobile performance
        
        // Scan start sound - electronic chirp
        this.sounds.scanStart = this.createElectronicChirp();
        
        // Portal entry sound - dimensional whoosh
        this.sounds.portalEntry = this.createPortalWhoosh();
        
        // Interaction beep - UI feedback
        this.sounds.interact = this.createInteractionBeep();
        
        // Footstep sound - metallic click with reverb
        this.sounds.footstep = this.createFootstepSound();
        
        // Setup reverb system for footsteps
        this.setupReverbSystem();
        
        console.log('🎵 Procedural sounds generated');
    }
    
    createElectronicChirp() {
        // Create a short electronic chirp for scanning
        return {
            frequency: 800,
            duration: 0.3,
            type: 'square',
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
        };
    }
    
    createPortalWhoosh() {
        // Create a dimensional portal sound
        return {
            frequency: 200,
            duration: 1.5,
            type: 'sawtooth',
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1.1 },
            filter: { type: 'lowpass', frequency: 1000, Q: 5 }
        };
    }
    
    createInteractionBeep() {
        // Create a UI interaction beep
        return {
            frequency: 600,
            duration: 0.15,
            type: 'sine',
            envelope: { attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.09 }
        };
    }
    
    createFootstepSound() {
        // Create a metallic footstep sound
        return {
            frequency: 150,
            duration: 0.1,
            type: 'triangle',
            envelope: { attack: 0.01, decay: 0.03, sustain: 0.2, release: 0.06 }
        };
    }
    
    startAmbientAudio() {
        // Start ambient warehouse sounds
        this.playAmbientWarehouse();
        
        // Portal-specific ambient sounds
        this.portals.forEach(portal => {
            this.playPortalAmbient(portal);
        });
    }
    
    playAmbientWarehouse() {
        // Create enhanced industrial ambience
        if (!this.audioContext) return;
        
        // Low-frequency warehouse hum (HVAC system)
        const warehouseHum = this.audioContext.createOscillator();
        const warehouseGain = this.audioContext.createGain();
        const warehouseFilter = this.audioContext.createBiquadFilter();
        
        warehouseHum.type = 'sawtooth';
        warehouseHum.frequency.setValueAtTime(60, this.audioContext.currentTime);
        warehouseFilter.type = 'lowpass';
        warehouseFilter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        warehouseGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        
        warehouseHum.connect(warehouseFilter);
        warehouseFilter.connect(warehouseGain);
        warehouseGain.connect(this.ambientGain);
        
        warehouseHum.start();
        
        // Electrical hum from fluorescent lights
        const electricalHum = this.audioContext.createOscillator();
        const electricalGain = this.audioContext.createGain();
        
        electricalHum.type = 'sine';
        electricalHum.frequency.setValueAtTime(120, this.audioContext.currentTime);
        electricalGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
        
        electricalHum.connect(electricalGain);
        electricalGain.connect(this.ambientGain);
        
        electricalHum.start();
        
        // Air circulation sounds
        const airCirculation = this.audioContext.createOscillator();
        const airGain = this.audioContext.createGain();
        const airFilter = this.audioContext.createBiquadFilter();
        
        airCirculation.type = 'triangle';
        airCirculation.frequency.setValueAtTime(40, this.audioContext.currentTime);
        airFilter.type = 'highpass';
        airFilter.frequency.setValueAtTime(80, this.audioContext.currentTime);
        airGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        
        airCirculation.connect(airFilter);
        airFilter.connect(airGain);
        airGain.connect(this.ambientGain);
        
        airCirculation.start();
        
        // Store for cleanup
        this.ambientSounds.warehouse = { 
            hum: { oscillator: warehouseHum, gain: warehouseGain },
            electrical: { oscillator: electricalHum, gain: electricalGain },
            air: { oscillator: airCirculation, gain: airGain }
        };
        
        console.log('🏭 Enhanced warehouse ambient audio started');
    }
    
    playPortalAmbient(portal) {
        if (!this.audioContext) return;
        
        // Each portal has unique ambient sound
        const portalAudio = this.createPortalAmbientSound(portal.id);
        
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = portalAudio.type;
        oscillator.frequency.setValueAtTime(portalAudio.frequency, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(portalAudio.filterFreq, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(portalAudio.volume, this.audioContext.currentTime);
        
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);
        
        oscillator.start();
        
        // Store for cleanup
        this.ambientSounds[portal.id] = { oscillator, gain, filter };
    }
    
    createPortalAmbientSound(portalId) {
        const portalSounds = {
            'spirit-tamer': {
                type: 'sine',
                frequency: 440,
                filterFreq: 800,
                volume: 0.05
            },
            'toppler': {
                type: 'square',
                frequency: 330,
                filterFreq: 600,
                volume: 0.04
            },
            'witcher': {
                type: 'sawtooth',
                frequency: 220,
                filterFreq: 400,
                volume: 0.06
            }
        };
        
        return portalSounds[portalId] || portalSounds['spirit-tamer'];
    }
    
    setupReverbSystem() {
        if (!this.audioContext) return;
        
        // Create convolution reverb for warehouse acoustics
        this.reverbNode = this.audioContext.createConvolver();
        this.reverbGain = this.audioContext.createGain();
        
        // Create impulse response for warehouse reverb
        this.createWarehouseImpulseResponse();
        
        this.reverbGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.ambientGain);
        
        console.log('🔊 Reverb system initialized');
    }
    
    createWarehouseImpulseResponse() {
        // Create impulse response for large warehouse acoustics
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay * 0.3;
            }
        }
        
        this.reverbNode.buffer = impulse;
    }
    
    playFootstepSound() {
        if (!this.audioContext || !this.sounds.footstep) return;
        
        // Resume audio context if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const soundData = this.sounds.footstep;
        const now = this.audioContext.currentTime;
        
        // Create oscillator for footstep
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Randomize footstep sound slightly
        const pitchVariation = 0.8 + Math.random() * 0.4;
        oscillator.frequency.setValueAtTime(soundData.frequency * pitchVariation, now);
        oscillator.type = soundData.type;
        
        // High-pass filter for metallic sound
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(200, now);
        
        // Apply envelope
        const { attack, decay, sustain, release } = soundData.envelope;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(sustain * 0.2, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain * 0.2, now + soundData.duration - release);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + soundData.duration);
        
        // Connect with reverb
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxGain);
        gainNode.connect(this.reverbNode); // Add reverb
        
        oscillator.start(now);
        oscillator.stop(now + soundData.duration);
    }
    
    handleFootsteps(movementSpeed) {
        // Track footstep timing
        if (!this.footstepTimer) {
            this.footstepTimer = 0;
        }
        
        // Footstep interval based on movement speed
        const footstepInterval = Math.max(0.3, 0.6 - movementSpeed * 2); // Faster steps when moving faster
        
        this.footstepTimer += 0.016; // Assume 60fps
        
        if (this.footstepTimer >= footstepInterval) {
            this.playFootstepSound();
            this.footstepTimer = 0;
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
        console.log(`🚪 Entering portal: ${portalId}`);
        
        // Prevent multiple portal entries
        if (this.portalTransitioning) {
            return;
        }
        
        this.portalTransitioning = true;
        
        // Show portal entry effect
        this.showPortalTransition(portalId, () => {
            // Route to correct destination with proper URLs
            this.routeToDestination(portalId);
        });
    }
    
    showPortalTransition(portalId, callback) {
        // Create transition overlay
        const transition = document.createElement('div');
        transition.id = 'portal-transition';
        transition.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, rgba(0,255,136,0.1) 0%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,1) 100%);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
            backdrop-filter: blur(5px);
        `;
        
        // Portal-specific effects
        const portalInfo = this.getPortalInfo(portalId);
        
        transition.innerHTML = `
            <div style="
                color: ${portalInfo.color};
                font-family: 'JetBrains Mono', monospace;
                font-size: 2rem;
                font-weight: 600;
                text-align: center;
                text-shadow: 0 0 20px ${portalInfo.color};
                margin-bottom: 2rem;
                animation: portalPulse 1s infinite alternate;
            ">
                ${portalInfo.title}
            </div>
            <div style="
                color: #ffffff;
                font-family: 'JetBrains Mono', monospace;
                font-size: 1rem;
                text-align: center;
                max-width: 400px;
                line-height: 1.5;
                opacity: 0.8;
                margin-bottom: 2rem;
            ">
                ${portalInfo.description}
            </div>
            <div style="
                width: 60px;
                height: 60px;
                border: 3px solid ${portalInfo.color};
                border-top: 3px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <div style="
                color: #888;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.9rem;
                text-align: center;
                margin-top: 2rem;
            ">
                Initializing portal connection...
            </div>
        `;
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes portalPulse {
                from { transform: scale(1); }
                to { transform: scale(1.05); }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(transition);
        
        // Fade in
        setTimeout(() => {
            transition.style.opacity = '1';
        }, 50);
        
        // Portal entry sound effect
        this.playSound('portalEntry');
        
        // Portal-specific transition duration
        const transitionDuration = 2000;
        
        setTimeout(() => {
            callback();
        }, transitionDuration);
    }
    
    getPortalInfo(portalId) {
        const portalData = {
            'spirit-tamer': {
                title: '⚔️ Spirit Tamer',
                description: 'Enter the world of turn-based combat with 157+ modular systems. Master the art of spirit summoning and strategic battles.',
                color: '#4488ff',
                destination: '/site/#spirit-tamer'
            },
            'toppler': {
                title: '🎯 Toppler',
                description: 'Experience physics-based action gaming with precision platforming. Navigate challenging obstacles and master momentum.',
                color: '#44ff88',
                destination: '/site/#toppler'
            },
            'witcher': {
                title: '🧙‍♂️ Witcher Grove',
                description: 'Explore an open-world adventure with dynamic AI ecosystems. Discover mysteries in an ever-changing magical realm.',
                color: '#ff4488',
                destination: '/site/grove.html'
            }
        };
        
        return portalData[portalId] || {
            title: 'Unknown Portal',
            description: 'Destination unknown',
            color: '#ffffff',
            destination: '/site/'
        };
    }
    
    routeToDestination(portalId) {
        const portalInfo = this.getPortalInfo(portalId);
        
        // Save player progress/state
        this.savePlayerState();
        
        // Navigate to destination
        console.log(`🚀 Navigating to: ${portalInfo.destination}`);
        
        // Use same-window navigation for better UX
        window.location.href = portalInfo.destination;
    }
    
    savePlayerState() {
        // Save current player state for potential return
        const playerState = {
            position: {
                x: this.player.position.x,
                y: this.player.position.y,
                z: this.player.position.z
            },
            cameraMode: this.isFirstPerson,
            timestamp: Date.now(),
            hubVersion: '1.0'
        };
        
        localStorage.setItem('renderworld-player-state', JSON.stringify(playerState));
        console.log('💾 Player state saved');
    }
    
    loadPlayerState() {
        // Load saved player state if available
        try {
            const savedState = localStorage.getItem('renderworld-player-state');
            if (savedState) {
                const playerState = JSON.parse(savedState);
                
                // Only restore if saved recently (within 1 hour)
                const timeDiff = Date.now() - playerState.timestamp;
                if (timeDiff < 3600000) { // 1 hour
                    this.player.position.set(
                        playerState.position.x,
                        playerState.position.y,
                        playerState.position.z
                    );
                    
                    if (this.playerAvatar) {
                        this.playerAvatar.position.copy(this.player.position);
                    }
                    
                    if (playerState.cameraMode !== this.isFirstPerson) {
                        this.toggleCameraMode();
                    }
                    
                    console.log('💾 Player state restored');
                }
            }
        } catch (error) {
            console.warn('Failed to load player state:', error);
        }
    }
    
    interactWithNPC(npc) {
        console.log(`💬 Interacting with ${npc.name}`);
        
        // Show dialogue based on NPC type and current context
        const dialogue = this.getNPCDialogue(npc);
        this.showDialogue(npc, dialogue);
        
        // Trigger NPC-specific interaction behavior
        switch (npc.id) {
            case 'explorer':
                this.explorerInteraction(npc);
                break;
            case 'guide':
                this.guideInteraction(npc);
                break;
            case 'mystic':
                this.mysticInteraction(npc);
                break;
        }
    }
    
    getNPCDialogue(npc) {
        const dialogues = {
            explorer: [
                "Scanning protocols active. Portal signatures detected.",
                "My sensors indicate three dimensional gateways nearby.",
                "Holographic data suggests these portals lead to interactive experiences.",
                "The Spirit Lens enhances my scanning capabilities significantly."
            ],
            guide: [
                "Welcome to the RenderWorld Hub! I'm here to help you navigate.",
                "That crystalline device is the Spirit Lens - it reveals hidden details.",
                "Each portal leads to a different MIFF experience. Choose wisely!",
                "Try using the Spirit Lens to see what I can see!"
            ],
            mystic: [
                "The energies here are... fascinating. Multiple realities converge.",
                "I sense the portals shifting between dimensions.",
                "The Spirit Lens resonates with ancient technologies.",
                "Through meditation, I perceive the true nature of this place."
            ]
        };
        
        const npcDialogues = dialogues[npc.id] || ["Hello, traveler."];
        const randomIndex = Math.floor(Math.random() * npcDialogues.length);
        return npcDialogues[randomIndex];
    }
    
    showDialogue(npc, text) {
        // Create floating dialogue bubble
        const existingDialogue = document.getElementById('npc-dialogue');
        if (existingDialogue) {
            existingDialogue.remove();
        }
        
        const dialogue = document.createElement('div');
        dialogue.id = 'npc-dialogue';
        dialogue.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: #00ff88;
            padding: 1rem 2rem;
            border-radius: 10px;
            border: 2px solid #00ff88;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            max-width: 400px;
            text-align: center;
            z-index: 1001;
            animation: fadeInDialogue 0.3s ease-out;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        `;
        
        dialogue.innerHTML = `
            <div style="color: #ffffff; font-size: 16px; margin-bottom: 0.5rem;">${npc.name}</div>
            <div>${text}</div>
            <div style="margin-top: 1rem; font-size: 12px; opacity: 0.7;">Click anywhere to close</div>
        `;
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInDialogue {
                from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(dialogue);
        
        // Auto-close after 5 seconds or on click
        const closeDialogue = () => {
            dialogue.style.animation = 'fadeInDialogue 0.3s ease-out reverse';
            setTimeout(() => dialogue.remove(), 300);
        };
        
        setTimeout(closeDialogue, 5000);
        dialogue.addEventListener('click', closeDialogue);
        document.addEventListener('click', closeDialogue, { once: true });
    }
    
    explorerInteraction(npc) {
        // Explorer emits a holographic scan
        console.log('🤖 Explorer performing holographic scan');
        
        // Enhance hologram emission
        const hologramEmitter = npc.group.children.find(child => 
            child.material && child.material.color.getHex() === 0x00ffff
        );
        if (hologramEmitter) {
            hologramEmitter.material.emissiveIntensity = 1;
            setTimeout(() => {
                hologramEmitter.material.emissiveIntensity = 0.3;
            }, 2000);
        }
        
        // Temporary scanning effect on nearby objects
        this.performTemporaryScan();
    }
    
    guideInteraction(npc) {
        // Guide demonstrates Spirit Lens usage
        console.log('👤 Guide demonstrating Spirit Lens');
        
        // Point toward Spirit Lens with enhanced gesture
        if (this.spiritLens) {
            const direction = new THREE.Vector3();
            direction.subVectors(this.spiritLens.position, npc.group.position);
            direction.normalize();
            
            const targetRotation = Math.atan2(direction.x, direction.z);
            npc.group.rotation.y = targetRotation;
            
            // Enhance Spirit Lens glow temporarily
            if (this.spiritLens.children[0] && this.spiritLens.children[0].material) {
                const originalIntensity = this.spiritLens.children[0].material.emissiveIntensity;
                this.spiritLens.children[0].material.emissiveIntensity = 1;
                setTimeout(() => {
                    this.spiritLens.children[0].material.emissiveIntensity = originalIntensity;
                }, 3000);
            }
        }
    }
    
    mysticInteraction(npc) {
        // Mystic creates portal energy resonance
        console.log('🧙‍♂️ Mystic creating portal resonance');
        
        // Enhance portal effects temporarily
        this.portals.forEach(portal => {
            if (portal.light) {
                const originalIntensity = portal.light.intensity;
                portal.light.intensity = 3;
                setTimeout(() => {
                    portal.light.intensity = originalIntensity;
                }, 4000);
            }
        });
        
        // Color shift effect
        npc.colorShift = 1;
        setTimeout(() => {
            npc.colorShift = 0;
        }, 3000);
    }
    
    performTemporaryScan() {
        // Temporary scanning effect for Explorer interaction
        const tempScanTime = this.clock.getElapsedTime();
        
        // Brief highlight of all interactive objects
        [...this.npcs, ...this.portals].forEach(obj => {
            const target = obj.group || obj.mesh;
            if (target && target.children) {
                target.children.forEach(child => {
                    if (child.material) {
                        child.material.emissive.setHex(0x00ffff);
                        child.material.emissiveIntensity = 0.5;
                    }
                });
            }
        });
        
        // Reset after 1 second
        setTimeout(() => {
            [...this.npcs, ...this.portals].forEach(obj => {
                const target = obj.group || obj.mesh;
                if (target && target.children) {
                    target.children.forEach(child => {
                        if (child.material && !this.scanningMode) {
                            child.material.emissive.setHex(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                    });
                }
            });
        }, 1000);
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
        console.log('🔮 Spirit Lens scanning mode activated');
        
        // Enhanced scanning effects
        this.scanningMode = true;
        this.scanStartTime = this.clock.getElapsedTime();
        
        // Highlight NPCs with warm amber outlines
        this.npcs.forEach(npc => {
            if (npc.group) {
                npc.group.children.forEach(child => {
                    if (child.material) {
                        child.material.emissive.setHex(0xffaa00); // Warm amber
                        child.material.emissiveIntensity = 0.3;
                    }
                });
            } else if (npc.mesh) {
                npc.mesh.material.emissive.setHex(0xffaa00);
                npc.mesh.material.emissiveIntensity = 0.3;
            }
        });
        
        // Portal detection - distant portals pulse
        this.portals.forEach(portal => {
            if (portal.light) {
                portal.light.intensity = 2;
                portal.light.color.setHex(0x00ffff); // Cyan for scanning
            }
            if (portal.mesh) {
                portal.mesh.material.emissive.setHex(0x004444);
                portal.mesh.material.emissiveIntensity = 0.5;
            }
        });
        
        // Add wireframe overlays to interactive objects
        this.addWireframeOverlays();
        
        // Play scanning sound effect
        this.playSound('scanStart');
        
        // Electronic hum sound
        this.playAmbientHum();
        
        // Trigger scan pulse effect
        this.createScanPulseEffect();
    }
    
    disableScanningMode() {
        console.log('🔮 Spirit Lens scanning mode deactivated');
        
        this.scanningMode = false;
        
        // Remove NPC highlights
        this.npcs.forEach(npc => {
            if (npc.group) {
                npc.group.children.forEach(child => {
                    if (child.material) {
                        child.material.emissive.setHex(0x000000);
                        child.material.emissiveIntensity = 0;
                    }
                });
            } else if (npc.mesh) {
                npc.mesh.material.emissive.setHex(0x000000);
                npc.mesh.material.emissiveIntensity = 0;
            }
        });
        
        // Reset portal effects
        this.portals.forEach(portal => {
            if (portal.light) {
                portal.light.intensity = 1;
                portal.light.color.setHex(portal.originalColor || 0xffffff);
            }
            if (portal.mesh) {
                portal.mesh.material.emissive.setHex(0x000000);
                portal.mesh.material.emissiveIntensity = 0;
            }
        });
        
        // Remove wireframe overlays
        this.removeWireframeOverlays();
        
        // Stop ambient hum
        this.stopAmbientHum();
    }
    
    addWireframeOverlays() {
        // Add wireframe overlays to interactive objects for scanning mode
        this.wireframeObjects = [];
        
        // NPCs wireframes
        this.npcs.forEach(npc => {
            if (npc.group) {
                const wireframeGroup = new THREE.Group();
                npc.group.children.forEach(child => {
                    if (child.geometry) {
                        const wireframeGeometry = new THREE.WireframeGeometry(child.geometry);
                        const wireframeMaterial = new THREE.LineBasicMaterial({ 
                            color: 0x00ffff,
                            transparent: true,
                            opacity: 0.5
                        });
                        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                        wireframe.position.copy(child.position);
                        wireframe.rotation.copy(child.rotation);
                        wireframe.scale.copy(child.scale);
                        wireframeGroup.add(wireframe);
                    }
                });
                wireframeGroup.position.copy(npc.group.position);
                wireframeGroup.rotation.copy(npc.group.rotation);
                this.scene.add(wireframeGroup);
                this.wireframeObjects.push(wireframeGroup);
            }
        });
        
        // Portal wireframes
        this.portals.forEach(portal => {
            if (portal.mesh && portal.mesh.geometry) {
                const wireframeGeometry = new THREE.WireframeGeometry(portal.mesh.geometry);
                const wireframeMaterial = new THREE.LineBasicMaterial({ 
                    color: 0x00ffff,
                    transparent: true,
                    opacity: 0.3
                });
                const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
                wireframe.position.copy(portal.mesh.position);
                wireframe.rotation.copy(portal.mesh.rotation);
                this.scene.add(wireframe);
                this.wireframeObjects.push(wireframe);
            }
        });
    }
    
    removeWireframeOverlays() {
        if (this.wireframeObjects) {
            this.wireframeObjects.forEach(wireframe => {
                this.scene.remove(wireframe);
            });
            this.wireframeObjects = [];
        }
    }
    
    playSound(soundName) {
        if (!this.audioContext || !this.sounds[soundName]) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }
        
        // Resume audio context if suspended (required for mobile)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        const soundData = this.sounds[soundName];
        
        // Create oscillator and envelope
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = soundData.type;
        oscillator.frequency.setValueAtTime(soundData.frequency, this.audioContext.currentTime);
        
        // Apply envelope
        const now = this.audioContext.currentTime;
        const { attack, decay, sustain, release } = soundData.envelope;
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + attack);
        gainNode.gain.exponentialRampToValueAtTime(sustain * 0.3, now + attack + decay);
        gainNode.gain.setValueAtTime(sustain * 0.3, now + soundData.duration - release);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + soundData.duration);
        
        // Apply filter if specified
        if (soundData.filter) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = soundData.filter.type;
            filter.frequency.setValueAtTime(soundData.filter.frequency, now);
            filter.Q.setValueAtTime(soundData.filter.Q || 1, now);
            
            oscillator.connect(filter);
            filter.connect(gainNode);
        } else {
            oscillator.connect(gainNode);
        }
        
        gainNode.connect(this.sfxGain);
        
        oscillator.start(now);
        oscillator.stop(now + soundData.duration);
        
        console.log(`🔊 Playing sound: ${soundName}`);
    }
    
    playAmbientHum() {
        // Electronic hum during scanning
        this.ambientHumActive = true;
        console.log('🔊 Electronic hum started');
    }
    
    stopAmbientHum() {
        this.ambientHumActive = false;
        console.log('🔊 Electronic hum stopped');
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
        this.toggleCameraMode();
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
        
        const deltaTime = this.clock.getDelta();
        const moveSpeed = 0.2;
        const moveVector = new THREE.Vector3();
        
        // Keyboard movement
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveVector.z -= moveSpeed;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveVector.z += moveSpeed;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveVector.x -= moveSpeed;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveVector.x += moveSpeed;
        
        // Mobile joystick movement
        if (this.isMobile && this.joystickActive) {
            moveVector.x += this.movementVector.x * moveSpeed;
            moveVector.z += this.movementVector.z * moveSpeed;
        }
        
        // Update player velocity and movement direction
        this.player.velocity.copy(moveVector);
        if (moveVector.length() > 0) {
            this.player.movementDirection.copy(moveVector.clone().normalize());
            
            // Play footstep sounds
            this.handleFootsteps(moveVector.length());
        }
        
        // Apply movement
        this.player.position.add(moveVector);
        
        // Update player avatar with animations
        this.updatePlayerAvatar(deltaTime);
        
        // Update camera based on mode
        if (this.isFirstPerson) {
            this.updateFirstPersonCamera();
        } else {
            this.updateThirdPersonCamera();
        }
        
        // Update HUD - show X,Z coordinates as specified
        const positionDisplay = document.getElementById('playerPosition');
        if (positionDisplay) {
            positionDisplay.textContent = 
                `${this.player.position.x.toFixed(1)}, ${this.player.position.z.toFixed(1)}`;
        }
        
        // Update FPS counter with performance indication
        const fpsDisplay = document.getElementById('fpsCounter');
        const fpsSection = document.querySelector('.fps-counter');
        if (fpsDisplay && fpsSection) {
            fpsDisplay.textContent = Math.round(this.fps);
            
            // Color-code FPS for performance indication
            if (this.fps < 30) {
                fpsSection.classList.add('low-fps');
            } else {
                fpsSection.classList.remove('low-fps');
            }
        }
        
        // Update mobile controls system if available
        if (this.mobileControlsSystem) {
            const gameState = {
                player: this.player,
                world: {
                    spiritLens: this.spiritLens ? {
                        position: this.spiritLens.position,
                        active: true
                    } : null,
                    npcs: this.npcs,
                    portals: this.portals
                },
                game: {
                    fps: this.fps
                }
            };
            this.mobileControlsSystem.update(gameState);
        }
    }
    
    updateAnimations() {
        const time = this.clock.getElapsedTime();
        
        // Update dynamic lighting system
        this.updateDynamicLighting(time);
        
        // Update particle systems
        this.updateParticleSystems(time);
        
        // Spirit Lens animation
        if (this.spiritLens) {
            this.spiritLens.rotation.y = time * 0.5;
            this.spiritLens.position.y = 3 + Math.sin(time * 2) * 0.1;
        }
        
        // Lens particles animation
        if (this.lensParticles) {
            this.lensParticles.rotation.y = time * 0.1;
        }
        
        // Enhanced NPC behaviors and animations
        this.updateNPCBehaviors(time);
        
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