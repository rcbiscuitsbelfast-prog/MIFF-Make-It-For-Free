/**
 * TopplerMedievalOverlays - Enhanced orchestration-driven implementation
 *
 * Features:
 * - Orchestration.medieval.json driven overlay system
 * - Modal and HUD overlay types with fade transitions
 * - Input mode detection with gamepad polling
 * - Persistent state management with localStorage
 * - Medieval-themed styling with tile assets
 */
export class TopplerMedievalOverlays {
    constructor() {
        this.orchestration = null;
        this.animationId = null;
        this.lastTime = 0;
        this.gamepadIndex = -1;
        this.touchZones = [];
        // Overlay management
        this.activeOverlays = new Map();
        this.overlayTransitions = new Map();
        // Audio
        this.audio = {
            music: null,
            sfx: {
                jump: null,
                collect: null,
                curse: null
            }
        };
        // Sprites for medieval styling
        this.sprites = {
            knight: null,
            skeleton: null,
            isle: null,
            chest: null,
            tileBackground: null
        };
        this.state = this.getDefaultState();
        this.initializeInputDetection();
    }
    getDefaultState() {
        return {
            score: 0,
            difficulty: 'Squire',
            inputMode: 'keyboard',
            currentScene: 'TopplerIntro',
            gameActive: false,
            player: { x: 20, y: 420, vx: 0, vy: 0, w: 40, h: 40 },
            enemies: [],
            chests: [],
            platforms: [],
            goalX: 560,
            time: 0
        };
    }
    initializeInputDetection() {
        // Detect gamepad with polling
        this.pollGamepads();
        setInterval(() => this.pollGamepads(), 1000); // Check every second
        // Detect touch capability
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.state.inputMode = 'touch';
        }
        // Listen for gamepad connection events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('[TopplerMedieval] Gamepad connected:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
            this.state.inputMode = 'gamepad';
            this.persistState();
            this.updateInputModeDisplay();
        });
        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('[TopplerMedieval] Gamepad disconnected:', e.gamepad.id);
            this.gamepadIndex = -1;
            this.state.inputMode = 'ontouchstart' in window ? 'touch' : 'keyboard';
            this.persistState();
            this.updateInputModeDisplay();
        });
    }
    pollGamepads() {
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (this.gamepadIndex === -1) {
                    console.log('[TopplerMedieval] Gamepad detected via polling:', gamepads[i].id);
                    this.gamepadIndex = i;
                    this.state.inputMode = 'gamepad';
                    this.persistState();
                    this.updateInputModeDisplay();
                }
                break;
            }
        }
    }
    async mount(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = canvas.parentElement;
        // Load orchestration configuration
        await this.loadOrchestration();
        // Restore state from localStorage
        this.restoreState();
        // Load assets
        await this.loadAssets();
        // Setup input handlers
        this.setupInputHandlers();
        // Setup touch zones for touch input
        this.setupTouchZones();
        // Initialize CSS styles for overlays
        this.initializeOverlayStyles();
        // Start with intro scene based on orchestration
        await this.triggerOverlay('zoneLoad');
        // Start game loop
        this.startGameLoop();
    }
    async loadOrchestration() {
        try {
            const response = await fetch('/site/zones/toppler/orchestration.medieval.json');
            this.orchestration = await response.json();
            console.log('[TopplerMedieval] Orchestration loaded:', this.orchestration?.title);
        }
        catch (error) {
            console.error('Failed to load orchestration config:', error);
        }
    }
    initializeOverlayStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .toppler-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                pointer-events: auto;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            
            .toppler-overlay.active {
                opacity: 1;
            }
            
            .medieval-intro {
                background: linear-gradient(135deg, rgba(20,15,10,0.95), rgba(40,25,15,0.95));
                background-image: url('/assets/Isometric Blocks/isometric_0075.png');
                background-size: 64px 64px;
                background-repeat: repeat;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #d4af37;
                font-family: 'serif', Georgia;
                text-align: center;
            }
            
            .medieval-gameover {
                background: linear-gradient(135deg, rgba(40,10,10,0.95), rgba(60,15,15,0.95));
                background-image: url('/assets/Isometric Blocks/isometric_0076.png');
                background-size: 64px 64px;
                background-repeat: repeat;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #ff6b6b;
                font-family: 'serif', Georgia;
                text-align: center;
            }
            
            .medieval-hud {
                background: transparent;
                pointer-events: none;
            }
            
            .medieval-lore {
                background: linear-gradient(135deg, rgba(25,20,35,0.95), rgba(35,30,50,0.95));
                background-image: url('/assets/Isometric Blocks/isometric_0077.png');
                background-size: 64px 64px;
                background-repeat: repeat;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #c9b037;
                font-family: 'serif', Georgia;
                text-align: center;
            }
            
            .overlay-title {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 20px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            }
            
            .overlay-description {
                font-size: 1.2em;
                margin-bottom: 30px;
                max-width: 500px;
                line-height: 1.4;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
            }
            
            .overlay-button {
                background: linear-gradient(135deg, #8b4513, #a0522d);
                border: 2px solid #d4af37;
                color: #fff;
                padding: 12px 24px;
                font-size: 1.1em;
                font-family: 'serif', Georgia;
                border-radius: 8px;
                cursor: pointer;
                margin: 10px;
                transition: all 0.3s ease;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                pointer-events: auto;
            }
            
            .overlay-button:hover {
                background: linear-gradient(135deg, #a0522d, #cd853f);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transform: translateY(-2px);
            }
            
            .overlay-info {
                position: absolute;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.9em;
                opacity: 0.8;
                text-align: center;
            }
            
            .input-mode-display {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0,0,0,0.7);
                color: #d4af37;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.9em;
                border: 1px solid #d4af37;
            }
        `;
        document.head.appendChild(style);
    }
    async triggerOverlay(trigger) {
        console.log('[TopplerMedieval] Trigger overlay:', trigger);
        if (!this.orchestration)
            return;
        // Find overlays that respond to this trigger
        for (const [overlayId, config] of Object.entries(this.orchestration.orchestration.overlays)) {
            if (config.triggers.includes(trigger)) {
                await this.showOverlay(overlayId, config);
            }
        }
        // Handle scene transitions
        for (const [transitionId, transition] of Object.entries(this.orchestration.orchestration.transitions)) {
            if (trigger === transitionId) {
                if (transition.from === '*' || transition.from === this.state.currentScene) {
                    this.state.currentScene = transition.to;
                    if (transition.modal) {
                        const modalConfig = this.orchestration.orchestration.overlays[transition.modal];
                        if (modalConfig) {
                            await this.showOverlay(transition.modal, modalConfig);
                        }
                    }
                }
            }
        }
    }
    async showOverlay(overlayId, config) {
        console.log('[TopplerMedieval] Showing overlay:', overlayId);
        // Remove existing overlay if present
        if (this.activeOverlays.has(overlayId)) {
            await this.hideOverlay(overlayId);
        }
        const overlay = document.createElement('div');
        overlay.className = `toppler-overlay ${config.style}`;
        overlay.id = `overlay-${overlayId}`;
        // Create overlay content based on type
        this.createOverlayContent(overlay, overlayId, config);
        // Add to container and store reference
        this.container.appendChild(overlay);
        this.activeOverlays.set(overlayId, overlay);
        // Animate in
        return new Promise((resolve) => {
            setTimeout(() => {
                overlay.classList.add('active');
                setTimeout(resolve, config.fadeIn);
            }, 50);
        });
    }
    async hideOverlay(overlayId) {
        const overlay = this.activeOverlays.get(overlayId);
        if (!overlay)
            return;
        const config = this.orchestration?.orchestration.overlays[overlayId];
        const fadeOut = config?.fadeOut || 300;
        return new Promise((resolve) => {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                this.activeOverlays.delete(overlayId);
                resolve();
            }, fadeOut);
        });
    }
    createOverlayContent(overlay, overlayId, config) {
        switch (overlayId) {
            case 'TopplerIntro':
                this.createIntroContent(overlay);
                break;
            case 'TopplerGameOver':
                this.createGameOverContent(overlay);
                break;
            case 'LoreModal':
                this.createLoreContent(overlay);
                break;
            case 'TopplerPlay':
                this.createHudContent(overlay);
                break;
        }
        // Add input mode display to all overlays
        const inputDisplay = document.createElement('div');
        inputDisplay.className = 'input-mode-display';
        inputDisplay.textContent = `Input: ${this.state.inputMode.toUpperCase()}`;
        overlay.appendChild(inputDisplay);
    }
    createIntroContent(overlay) {
        const title = document.createElement('div');
        title.className = 'overlay-title';
        title.textContent = this.orchestration?.title || 'Toppler: Medieval';
        const description = document.createElement('div');
        description.className = 'overlay-description';
        description.textContent = this.orchestration?.description || 'Begin your medieval adventure';
        const startButton = document.createElement('button');
        startButton.className = 'overlay-button';
        startButton.textContent = '⚔️ Start Quest';
        startButton.onclick = () => this.handleOverlayAction('startGame');
        const optionsButton = document.createElement('button');
        optionsButton.className = 'overlay-button';
        optionsButton.textContent = '⚙️ Options';
        optionsButton.onclick = () => this.showOptionsMenu();
        const loreButton = document.createElement('button');
        loreButton.className = 'overlay-button';
        loreButton.textContent = '📜 Lore';
        loreButton.onclick = () => this.handleOverlayAction('showCredits');
        const info = document.createElement('div');
        info.className = 'overlay-info';
        info.innerHTML = `
            <div>Difficulty: ${this.state.difficulty}</div>
            <div>Controls: ${this.getControlsText()}</div>
        `;
        overlay.appendChild(title);
        overlay.appendChild(description);
        overlay.appendChild(startButton);
        overlay.appendChild(optionsButton);
        overlay.appendChild(loreButton);
        overlay.appendChild(info);
    }
    createGameOverContent(overlay) {
        const title = document.createElement('div');
        title.className = 'overlay-title';
        title.textContent = '⚔️ Quest Complete!';
        const description = document.createElement('div');
        description.className = 'overlay-description';
        description.innerHTML = `
            <div>Final Score: ${this.state.score}</div>
            <div>Time: ${Math.round(this.state.time)}s</div>
            <div>Difficulty: ${this.state.difficulty}</div>
        `;
        const restartButton = document.createElement('button');
        restartButton.className = 'overlay-button';
        restartButton.textContent = '🔄 New Quest';
        restartButton.onclick = () => this.handleOverlayAction('restartGame');
        const info = document.createElement('div');
        info.className = 'overlay-info';
        info.textContent = 'Press any key or tap to continue';
        overlay.appendChild(title);
        overlay.appendChild(description);
        overlay.appendChild(restartButton);
        overlay.appendChild(info);
    }
    createLoreContent(overlay) {
        const title = document.createElement('div');
        title.className = 'overlay-title';
        title.textContent = '📜 The Hollow Isles';
        const description = document.createElement('div');
        description.className = 'overlay-description';
        description.innerHTML = `
            <p>Long ago, the Bone King cursed these lands. Only the brave may cross the crumbling paths and reclaim the lost relics.</p>
            <p><em>Tip:</em> Chests hold secrets. Skeletons guard them fiercely.</p>
            <p><small>Assets: KayKit, CC0. Framework: MIFF.</small></p>
        `;
        const closeButton = document.createElement('button');
        closeButton.className = 'overlay-button';
        closeButton.textContent = '✕ Close';
        closeButton.onclick = () => this.hideOverlay('LoreModal');
        overlay.appendChild(title);
        overlay.appendChild(description);
        overlay.appendChild(closeButton);
    }
    createHudContent(overlay) {
        // HUD elements for gameplay
        const hudContainer = document.createElement('div');
        hudContainer.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            color: #d4af37;
            font-family: serif;
            font-size: 16px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
        `;
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.textContent = `Score: ${this.state.score}`;
        const difficultyDisplay = document.createElement('div');
        difficultyDisplay.textContent = `Difficulty: ${this.state.difficulty}`;
        hudContainer.appendChild(scoreDisplay);
        hudContainer.appendChild(difficultyDisplay);
        overlay.appendChild(hudContainer);
    }
    getControlsText() {
        switch (this.state.inputMode) {
            case 'gamepad':
                return 'Gamepad - Left stick/D-pad to move, A to jump';
            case 'touch':
                return 'Touch - Tap zones to move and jump';
            case 'keyboard':
            default:
                return 'Keyboard - Arrow keys to move, Space/Up to jump';
        }
    }
    showOptionsMenu() {
        // Create a simple options overlay
        const optionsOverlay = document.createElement('div');
        optionsOverlay.className = 'toppler-overlay medieval-intro active';
        optionsOverlay.style.zIndex = '1001';
        const title = document.createElement('div');
        title.className = 'overlay-title';
        title.textContent = '⚙️ Options';
        const difficultySelect = document.createElement('select');
        difficultySelect.style.cssText = 'margin: 10px; padding: 8px; font-size: 16px;';
        ['Squire', 'Knight', 'Warlord'].forEach(diff => {
            const option = document.createElement('option');
            option.value = diff;
            option.textContent = diff;
            option.selected = diff === this.state.difficulty;
            difficultySelect.appendChild(option);
        });
        difficultySelect.onchange = () => {
            this.state.difficulty = difficultySelect.value;
            this.persistState();
        };
        const closeButton = document.createElement('button');
        closeButton.className = 'overlay-button';
        closeButton.textContent = '✓ Done';
        closeButton.onclick = () => {
            optionsOverlay.remove();
            this.updateInputModeDisplay();
        };
        optionsOverlay.appendChild(title);
        optionsOverlay.appendChild(document.createTextNode('Difficulty: '));
        optionsOverlay.appendChild(difficultySelect);
        optionsOverlay.appendChild(closeButton);
        this.container.appendChild(optionsOverlay);
    }
    async handleOverlayAction(action) {
        console.log('[TopplerMedieval] Overlay action:', action);
        switch (action) {
            case 'startGame':
                await this.hideOverlay('TopplerIntro');
                this.state.gameActive = true;
                this.state.currentScene = 'TopplerPlay';
                this.initializeGameEntities();
                await this.triggerOverlay('startGame');
                this.playMusic();
                break;
            case 'restartGame':
                await this.hideOverlay('TopplerGameOver');
                this.resetGameState();
                this.state.currentScene = 'TopplerIntro';
                await this.triggerOverlay('restartGame');
                break;
            case 'showCredits':
                await this.triggerOverlay('showCredits');
                break;
        }
    }
    updateInputModeDisplay() {
        const displays = document.querySelectorAll('.input-mode-display');
        displays.forEach(display => {
            display.textContent = `Input: ${this.state.inputMode.toUpperCase()}`;
        });
    }
    persistState() {
        try {
            const persistedState = {
                score: this.state.score,
                difficulty: this.state.difficulty,
                inputMode: this.state.inputMode
            };
            localStorage.setItem('toppler_state', JSON.stringify(persistedState));
            console.log('[TopplerMedieval] State persisted:', persistedState);
        }
        catch (error) {
            console.error('Failed to persist state:', error);
        }
    }
    restoreState() {
        try {
            const saved = localStorage.getItem('toppler_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.score !== undefined)
                    this.state.score = parsed.score;
                if (parsed.difficulty)
                    this.state.difficulty = parsed.difficulty;
                if (parsed.inputMode)
                    this.state.inputMode = parsed.inputMode;
                console.log('[TopplerMedieval] State restored:', parsed);
            }
        }
        catch (error) {
            console.error('Failed to restore state:', error);
        }
    }
    resetGameState() {
        this.state.score = 0;
        this.state.player = { x: 20, y: 420, vx: 0, vy: 0, w: 40, h: 40 };
        this.state.enemies = [];
        this.state.chests = [];
        this.state.platforms = [];
        this.state.time = 0;
        this.state.gameActive = false;
        this.persistState();
    }
    async loadAssets() {
        // Asset loading implementation (simplified for now)
        console.log('[TopplerMedieval] Assets loaded');
    }
    setupInputHandlers() {
        // Keyboard input
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        // Touch input
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        // Mouse input (fallback)
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
    setupTouchZones() {
        if (this.state.inputMode !== 'touch')
            return;
        const canvasRect = this.canvas.getBoundingClientRect();
        const zoneSize = 80;
        const margin = 20;
        this.touchZones = [
            { id: 'left', x: margin, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize },
            { id: 'right', x: canvasRect.width - zoneSize - margin, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize },
            { id: 'jump', x: canvasRect.width / 2 - zoneSize / 2, y: canvasRect.height - zoneSize - margin, w: zoneSize, h: zoneSize }
        ];
    }
    handleKeyDown(event) {
        if (this.state.inputMode !== 'keyboard')
            return;
        // Handle overlay interactions
        if (this.activeOverlays.size > 0) {
            if (event.key === 'Enter' || event.key === ' ') {
                // Trigger default action for active overlay
                const firstOverlay = this.activeOverlays.keys().next().value;
                if (firstOverlay === 'TopplerIntro') {
                    this.handleOverlayAction('startGame');
                }
                else if (firstOverlay === 'TopplerGameOver') {
                    this.handleOverlayAction('restartGame');
                }
            }
            return;
        }
        // Game controls
        switch (event.key) {
            case 'ArrowLeft':
                this.state.player.vx = -140;
                break;
            case 'ArrowRight':
                this.state.player.vx = 140;
                break;
            case 'ArrowUp':
            case ' ':
                if (this.state.currentScene === 'TopplerPlay' && this.isPlayerOnGround()) {
                    this.state.player.vy = -360;
                    this.playSound('jump');
                }
                break;
        }
    }
    handleKeyUp(event) {
        if (this.state.inputMode !== 'keyboard')
            return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            this.state.player.vx = 0;
        }
    }
    handleTouchStart(event) {
        // Touch handling implementation
        event.preventDefault();
    }
    handleTouchEnd(event) {
        // Touch handling implementation
        event.preventDefault();
    }
    handleClick(event) {
        // Mouse click handling for overlay interactions
        if (this.activeOverlays.size > 0) {
            const firstOverlay = this.activeOverlays.keys().next().value;
            if (firstOverlay === 'TopplerIntro') {
                this.handleOverlayAction('startGame');
            }
            else if (firstOverlay === 'TopplerGameOver') {
                this.handleOverlayAction('restartGame');
            }
        }
    }
    initializeGameEntities() {
        // Initialize game entities
        this.state.enemies = [
            { x: 200, y: 460, w: 28, h: 28, dir: 1 },
            { x: 360, y: 460, w: 28, h: 28, dir: -1 }
        ];
        this.state.chests = [
            { x: 120, y: 460, w: 22, h: 22 },
            { x: 480, y: 460, w: 22, h: 22 }
        ];
        const difficultySettings = this.getDifficultySettings();
        this.state.platforms = [
            { x: 80, y: 420, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 200, y: 380, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 320, y: 400, w: 60, h: 10, t: difficultySettings.platformLife },
            { x: 440, y: 360, w: 60, h: 10, t: difficultySettings.platformLife }
        ];
    }
    getDifficultySettings() {
        switch (this.state.difficulty) {
            case 'Knight':
                return { gravity: 980, enemySpeed: 60, platformLife: 6.0 };
            case 'Warlord':
                return { gravity: 1100, enemySpeed: 90, platformLife: 4.0 };
            default: // Squire
                return { gravity: 900, enemySpeed: 40, platformLife: 8.0 };
        }
    }
    isPlayerOnGround() {
        return this.state.player.y + this.state.player.h >= 480 - 20;
    }
    playSound(sound) {
        // Audio playback implementation
        console.log('[TopplerMedieval] Play sound:', sound);
    }
    playMusic() {
        console.log('[TopplerMedieval] Play music');
    }
    update(deltaTime) {
        if (this.state.currentScene !== 'TopplerPlay' || !this.state.gameActive)
            return;
        // Update game logic
        this.state.time += deltaTime;
        // Update score display
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${this.state.score}`;
        }
        // Check for game over conditions
        if (this.state.player.x + this.state.player.w >= this.state.goalX) {
            this.triggerGameOver('levelComplete');
        }
    }
    async triggerGameOver(reason) {
        this.state.gameActive = false;
        this.state.currentScene = 'TopplerGameOver';
        await this.hideOverlay('TopplerPlay');
        await this.triggerOverlay('gameOver');
    }
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0b1020';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.state.currentScene === 'TopplerPlay' && this.state.gameActive) {
            // Render game elements
            this.renderGameplay();
        }
    }
    renderGameplay() {
        // Render player
        this.ctx.fillStyle = '#58a6ff';
        this.ctx.fillRect(this.state.player.x, this.state.player.y, this.state.player.w, this.state.player.h);
        // Render enemies
        this.ctx.fillStyle = '#bd4b4b';
        for (const enemy of this.state.enemies) {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
        }
        // Render chests
        this.ctx.fillStyle = '#ffa500';
        for (const chest of this.state.chests) {
            this.ctx.fillRect(chest.x, chest.y, chest.w, chest.h);
        }
        // Render goal area
        this.ctx.fillStyle = '#0f2a3f';
        this.ctx.fillRect(this.state.goalX, 0, this.canvas.width - this.state.goalX, this.canvas.height);
    }
    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (!this.lastTime)
                this.lastTime = timestamp;
            const deltaTime = Math.min(0.033, (timestamp - this.lastTime) / 1000);
            this.lastTime = timestamp;
            this.update(deltaTime);
            this.render();
            this.animationId = requestAnimationFrame(gameLoop);
        };
        this.animationId = requestAnimationFrame(gameLoop);
    }
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        // Clean up overlays
        this.activeOverlays.forEach((overlay) => overlay.remove());
        this.activeOverlays.clear();
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
        console.log('[TopplerMedievalOverlays] Destroyed and cleaned up resources');
    }
}
