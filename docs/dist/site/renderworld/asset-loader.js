/**
 * MIFF Asset Loader - In-House 3D Asset Management
 * Loads and manages all 3D assets for RenderWorld Hub
 */

class MIFFAssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadingPromises = new Map();
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new THREE.GLTFLoader();
        this.audioLoader = new THREE.AudioLoader();
        
        console.log('📦 MIFF Asset Loader initialized');
    }
    
    async loadAllAssets() {
        const loadPromises = [
            this.loadWarehouseAssets(),
            this.loadNPCAssets(),
            this.loadPortalAssets(),
            this.loadPlayerAssets(),
            this.loadAudioAssets()
        ];
        
        try {
            await Promise.all(loadPromises);
            console.log('✅ All assets loaded successfully');
            return true;
        } catch (error) {
            console.error('❌ Asset loading failed:', error);
            return false;
        }
    }
    
    async loadWarehouseAssets() {
        // Load warehouse textures and materials
        const warehouseAssets = {
            floorTexture: await this.loadTexture('assets/textures/warehouse_floor.jpg'),
            wallTexture: await this.loadTexture('assets/textures/warehouse_wall.jpg'),
            ceilingTexture: await this.loadTexture('assets/textures/warehouse_ceiling.jpg'),
            pillarTexture: await this.loadTexture('assets/textures/concrete_pillar.jpg')
        };
        
        this.assets.set('warehouse', warehouseAssets);
        console.log('🏭 Warehouse assets loaded');
    }
    
    async loadNPCAssets() {
        // Create in-house 3D NPC models
        const npcAssets = {
            explorer: this.createExplorerModel(),
            guide: this.createGuideModel(),
            mystic: this.createMysticModel()
        };
        
        this.assets.set('npcs', npcAssets);
        console.log('🤖 NPC assets created');
    }
    
    async loadPortalAssets() {
        // Create portal visual effects
        const portalAssets = {
            spiritTamer: this.createSpiritTamerPortal(),
            toppler: this.createTopplerPortal(),
            witcher: this.createWitcherPortal()
        };
        
        this.assets.set('portals', portalAssets);
        console.log('🚪 Portal assets created');
    }
    
    async loadPlayerAssets() {
        // Create player avatar system
        const playerAssets = {
            avatar: this.createPlayerAvatar(),
            firstPersonHands: this.createFirstPersonHands(),
            thirdPersonBody: this.createThirdPersonBody()
        };
        
        this.assets.set('player', playerAssets);
        console.log('👤 Player assets created');
    }
    
    async loadAudioAssets() {
        // Load audio files for Spirit Lens and portals
        const audioAssets = {
            spiritLensHum: await this.loadAudio('assets/audio/spirit_lens_hum.mp3'),
            spiritLensScan: await this.loadAudio('assets/audio/spirit_lens_scan.mp3'),
            portalActivation: await this.loadAudio('assets/audio/portal_activation.mp3'),
            ambientWarehouse: await this.loadAudio('assets/audio/warehouse_ambient.mp3')
        };
        
        this.assets.set('audio', audioAssets);
        console.log('🔊 Audio assets loaded');
    }
    
    // Asset creation methods
    createExplorerModel() {
        const group = new THREE.Group();
        
        // Sleek android body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x002244
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
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
        group.add(visor);
        
        // Hologram emitter
        const emitterGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const emitterMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8
        });
        const emitter = new THREE.Mesh(emitterGeometry, emitterMaterial);
        emitter.position.y = 1.5;
        group.add(emitter);
        
        return group;
    }
    
    createGuideModel() {
        const group = new THREE.Group();
        
        // Human-like body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xffaa44,
            roughness: 0.6,
            metalness: 0.1
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Friendly face
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.8;
        group.add(head);
        
        // Gesturing arm
        const armGeometry = new THREE.CapsuleGeometry(0.1, 0.6, 4, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99
        });
        const arm = new THREE.Mesh(armGeometry, armMaterial);
        arm.position.set(0.3, 0.2, 0);
        arm.rotation.z = Math.PI / 4;
        group.add(arm);
        
        return group;
    }
    
    createMysticModel() {
        const group = new THREE.Group();
        
        // Hooded figure
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xaa44ff,
            roughness: 0.7,
            metalness: 0.3,
            emissive: 0x220044
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Floating effect
        group.position.y = 0.2;
        
        // Mystical aura
        const auraGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0xaa44ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        group.add(aura);
        
        return group;
    }
    
    createSpiritTamerPortal() {
        const group = new THREE.Group();
        
        // Electric blue lightning frame
        const frameGeometry = new THREE.RingGeometry(3, 4, 8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x0088ff,
            emissive: 0x002244,
            metalness: 0.9,
            roughness: 0.1
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        group.add(frame);
        
        // LED strips
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const ledGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5);
            const ledMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                emissive: 0x004488
            });
            const led = new THREE.Mesh(ledGeometry, ledMaterial);
            led.position.set(
                Math.cos(angle) * 3.5,
                0,
                Math.sin(angle) * 3.5
            );
            led.rotation.y = angle;
            group.add(led);
        }
        
        // Energy field
        const energyGeometry = new THREE.RingGeometry(0, 3, 16);
        const energyMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const energy = new THREE.Mesh(energyGeometry, energyMaterial);
        group.add(energy);
        
        return group;
    }
    
    createTopplerPortal() {
        const group = new THREE.Group();
        
        // Emerald shimmer frame
        const frameGeometry = new THREE.RingGeometry(3, 4, 8);
        const frameMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            emissive: 0x002244,
            metalness: 0.7,
            roughness: 0.3
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        group.add(frame);
        
        // Industrial pipes
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
            const pipeMaterial = new THREE.MeshStandardMaterial({
                color: 0x666666,
                metalness: 0.8,
                roughness: 0.2
            });
            const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
            pipe.position.set(
                Math.cos(angle) * 4,
                1,
                Math.sin(angle) * 4
            );
            pipe.rotation.z = Math.PI / 2;
            group.add(pipe);
        }
        
        // Steam vents
        const steamGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const steamMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        const steam = new THREE.Mesh(steamGeometry, steamMaterial);
        steam.position.y = 1;
        group.add(steam);
        
        return group;
    }
    
    createWitcherPortal() {
        const group = new THREE.Group();
        
        // Crimson glow stone arch
        const archGeometry = new THREE.TorusGeometry(3, 0.5, 8, 16);
        const archMaterial = new THREE.MeshStandardMaterial({
            color: 0xff4444,
            emissive: 0x440022,
            metalness: 0.3,
            roughness: 0.7
        });
        const arch = new THREE.Mesh(archGeometry, archMaterial);
        group.add(arch);
        
        // Mystical runes
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const runeGeometry = new THREE.BoxGeometry(0.2, 0.4, 0.1);
            const runeMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa44,
                emissive: 0x442200
            });
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.set(
                Math.cos(angle) * 3.2,
                0,
                Math.sin(angle) * 3.2
            );
            rune.rotation.y = angle;
            group.add(rune);
        }
        
        // Embers
        const emberGeometry = new THREE.SphereGeometry(0.1, 4, 4);
        const emberMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            emissive: 0x220000
        });
        for (let i = 0; i < 20; i++) {
            const ember = new THREE.Mesh(emberGeometry, emberMaterial);
            ember.position.set(
                (Math.random() - 0.5) * 6,
                Math.random() * 2,
                (Math.random() - 0.5) * 6
            );
            group.add(ember);
        }
        
        return group;
    }
    
    createPlayerAvatar() {
        const group = new THREE.Group();
        
        // Player body
        const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ff88,
            roughness: 0.5,
            metalness: 0.3
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        group.add(body);
        
        // Player head
        const headGeometry = new THREE.SphereGeometry(0.25, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.8;
        group.add(head);
        
        return group;
    }
    
    createFirstPersonHands() {
        const group = new THREE.Group();
        
        // Left hand
        const leftHandGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const leftHandMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99
        });
        const leftHand = new THREE.Mesh(leftHandGeometry, leftHandMaterial);
        leftHand.position.set(-0.3, 0.2, 0.5);
        group.add(leftHand);
        
        // Right hand
        const rightHandGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const rightHandMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc99
        });
        const rightHand = new THREE.Mesh(rightHandGeometry, rightHandMaterial);
        rightHand.position.set(0.3, 0.2, 0.5);
        group.add(rightHand);
        
        return group;
    }
    
    createThirdPersonBody() {
        // Same as player avatar but with different positioning
        return this.createPlayerAvatar();
    }
    
    async loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                resolve,
                undefined,
                reject
            );
        });
    }
    
    async loadAudio(url) {
        return new Promise((resolve, reject) => {
            this.audioLoader.load(
                url,
                resolve,
                undefined,
                reject
            );
        });
    }
    
    getAsset(category, name) {
        const categoryAssets = this.assets.get(category);
        return categoryAssets ? categoryAssets[name] : null;
    }
    
    getAllAssets() {
        return this.assets;
    }
}

// Export for use in RenderWorld
if (typeof window !== 'undefined') {
    window.MIFFAssetLoader = MIFFAssetLoader;
}

export { MIFFAssetLoader };

console.log('📦 MIFF Asset Loader ready!');