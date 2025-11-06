/**
 * K-pop Monster Hunter - MIFF Edition
 * 
 * A proper TypeScript game using MIFF Pure modules:
 * - AssetLoaderPure for asset management
 * - RhythmInputPure for rhythm gameplay
 * - RhythmBattleSystemPure for battles
 * - SpiritsPure for spirit management
 * - Real LPC sprite rendering
 */

import { AssetLoaderManager, AssetType } from '../../miff/pure/AssetLoaderPure';
import { RhythmInputManager, RhythmDifficulty } from '../../miff/pure/RhythmInputPure';
import { RhythmBattleManager, RhythmBattleConfig } from '../../miff/pure/RhythmBattleSystemPure';
import { Spirit, SpiritType, SpiritRarity } from '../../miff/pure/SpiritsPure';

// Game state
interface GameState {
  phase: 'loading' | 'menu' | 'playing' | 'battle';
  player: {
    x: number;
    y: number;
    speed: number;
    sprite?: HTMLImageElement;
    frame: number;
    direction: 'down' | 'up' | 'left' | 'right';
  };
  spirits: Array<{
    id: number;
    name: string;
    x: number;
    y: number;
    type: SpiritType;
    rarity: SpiritRarity;
    captured: boolean;
    sprite?: HTMLImageElement;
  }>;
  capturedSpirits: Spirit[];
  currentBattle?: {
    spirit: any;
    manager: RhythmBattleManager;
  };
}

class KpopGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private assetLoader: AssetLoaderManager;
  private rhythmInput: RhythmInputManager;
  private state: GameState;
  private keys: Set<string> = new Set();
  private rafId: number = 0;

  constructor() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'gameCanvas';
    document.getElementById('app')!.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    
    // Resize canvas
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Initialize MIFF modules
    this.assetLoader = new AssetLoaderManager();
    this.rhythmInput = new RhythmInputManager();

    // Initialize game state
    this.state = {
      phase: 'loading',
      player: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        speed: 4,
        frame: 0,
        direction: 'down'
      },
      spirits: [
        { id: 1, name: 'Shadow Slime', x: window.innerWidth * 0.25, y: window.innerHeight * 0.3, 
          type: SpiritType.SHADOW, rarity: SpiritRarity.COMMON, captured: false },
        { id: 2, name: 'Light Fairy', x: window.innerWidth * 0.75, y: window.innerHeight * 0.3,
          type: SpiritType.LIGHT, rarity: SpiritRarity.UNCOMMON, captured: false },
        { id: 3, name: 'Water Spirit', x: window.innerWidth * 0.5, y: window.innerHeight * 0.65,
          type: SpiritType.WATER, rarity: SpiritRarity.RARE, captured: false }
      ],
      capturedSpirits: []
    };

    // Input handling
    this.setupInput();

    // Start loading
    this.loadAssets();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      this.keys.add(e.code.toLowerCase());
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
      this.keys.delete(e.code.toLowerCase());
    });
  }

  private async loadAssets() {
    console.log('🎨 Loading assets with AssetLoaderPure...');
    
    try {
      // Queue player sprite
      this.assetLoader.queueAsset(
        'player-walk',
        AssetType.IMAGE,
        '/assets/sprites/spirits/K-pop/Mira-Sprite/walk.png'
      );
      
      this.assetLoader.queueAsset(
        'player-idle',
        AssetType.IMAGE,
        '/assets/sprites/spirits/K-pop/Mira-Sprite/idle.png'
      );

      // Queue audio
      this.assetLoader.queueAsset(
        'music-instrumental',
        AssetType.AUDIO,
        '/assets/K pop new/We Are Light-instrumental-stem.mp3'
      );
      
      this.assetLoader.queueAsset(
        'music-vocal',
        AssetType.AUDIO,
        '/assets/K pop new/We Are Light-vocals-stem.mp3'
      );

      // Load all with progress tracking
      await this.assetLoader.loadAll((loaded, total) => {
        const percent = Math.floor((loaded / total) * 100);
        console.log(`Loading: ${percent}% (${loaded}/${total})`);
        this.drawLoadingScreen(percent);
      });

      console.log('✅ All assets loaded!');
      
      // Get loaded sprites
      const walkAsset = this.assetLoader.getAsset('player-walk');
      if (walkAsset && walkAsset.data instanceof HTMLImageElement) {
        this.state.player.sprite = walkAsset.data;
      }

      // Start game
      this.state.phase = 'playing';
      this.startGameLoop();

    } catch (err) {
      console.error('❌ Asset loading failed:', err);
      this.drawError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  private drawLoadingScreen(percent: number) {
    this.ctx.fillStyle = '#1a0033';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#0ff';
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎵 K-POP MONSTER HUNTER 🎵', this.canvas.width / 2, this.canvas.height / 2 - 60);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px monospace';
    this.ctx.fillText('Powered by MIFF Framework', this.canvas.width / 2, this.canvas.height / 2 - 20);
    
    // Progress bar
    const barWidth = 400;
    const barHeight = 40;
    const barX = this.canvas.width / 2 - barWidth / 2;
    const barY = this.canvas.height / 2 + 20;
    
    this.ctx.strokeStyle = '#0ff';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    this.ctx.fillStyle = '#0ff';
    this.ctx.fillRect(barX, barY, barWidth * (percent / 100), barHeight);
    
    this.ctx.fillStyle = '#0ff';
    this.ctx.font = 'bold 18px monospace';
    this.ctx.fillText(`${percent}%`, this.canvas.width / 2, barY + 27);
  }

  private drawError(message: string) {
    this.ctx.fillStyle = '#1a0033';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#f00';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('❌ ERROR', this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
  }

  private startGameLoop() {
    const loop = () => {
      this.update();
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  private update() {
    if (this.state.phase !== 'playing') return;

    // Player movement
    const moved = { x: 0, y: 0 };
    
    if (this.keys.has('w') || this.keys.has('arrowup')) {
      moved.y = -this.state.player.speed;
      this.state.player.direction = 'up';
    }
    if (this.keys.has('s') || this.keys.has('arrowdown')) {
      moved.y = this.state.player.speed;
      this.state.player.direction = 'down';
    }
    if (this.keys.has('a') || this.keys.has('arrowleft')) {
      moved.x = -this.state.player.speed;
      this.state.player.direction = 'left';
    }
    if (this.keys.has('d') || this.keys.has('arrowright')) {
      moved.x = this.state.player.speed;
      this.state.player.direction = 'right';
    }

    if (moved.x !== 0 || moved.y !== 0) {
      this.state.player.x += moved.x;
      this.state.player.y += moved.y;
      this.state.player.frame = (this.state.player.frame + 0.1) % 4;
    }

    // Bounds check
    this.state.player.x = Math.max(32, Math.min(this.canvas.width - 32, this.state.player.x));
    this.state.player.y = Math.max(32, Math.min(this.canvas.height - 32, this.state.player.y));

    // Check spirit collisions
    if (this.keys.has(' ') || this.keys.has('space')) {
      this.checkSpiritInteraction();
    }
  }

  private checkSpiritInteraction() {
    this.state.spirits.forEach(spirit => {
      if (spirit.captured) return;
      
      const dist = Math.sqrt(
        (this.state.player.x - spirit.x) ** 2 +
        (this.state.player.y - spirit.y) ** 2
      );
      
      if (dist < 60) {
        this.startBattle(spirit);
      }
    });
  }

  private startBattle(spirit: any) {
    console.log('🎮 Starting battle with:', spirit.name);
    // TODO: Integrate RhythmBattleSystemPure here
    // For now, just mark as captured
    spirit.captured = true;
    
    const miffSpirit = Spirit.create({
      name: spirit.name,
      type: spirit.type,
      rarity: spirit.rarity,
      level: 1
    });
    
    this.state.capturedSpirits.push(miffSpirit);
    console.log('✅ Captured!', this.state.capturedSpirits.length, 'total');
  }

  private render() {
    // Clear
    this.ctx.fillStyle = '#2d5016';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid
    this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 32) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Draw spirits
    this.state.spirits.forEach(spirit => {
      if (spirit.captured) return;
      
      const colors: Record<number, string> = {
        [SpiritType.SHADOW]: '#8b00ff',
        [SpiritType.LIGHT]: '#ffeb3b',
        [SpiritType.WATER]: '#00bcd4',
        [SpiritType.FIRE]: '#f00',
        [SpiritType.EARTH]: '#8b4513',
        [SpiritType.AIR]: '#87ceeb'
      };
      
      this.ctx.fillStyle = colors[spirit.type] || '#fff';
      this.ctx.beginPath();
      this.ctx.arc(spirit.x, spirit.y, 24, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 13px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(spirit.name, spirit.x, spirit.y - 35);
    });

    // Draw player
    if (this.state.player.sprite) {
      // Draw LPC sprite (64x64 frames)
      const frame = Math.floor(this.state.player.frame);
      const dirRow = { down: 0, left: 1, right: 2, up: 3 }[this.state.player.direction];
      
      this.ctx.drawImage(
        this.state.player.sprite,
        frame * 64, // Source X
        dirRow * 64, // Source Y
        64, // Source width
        64, // Source height
        this.state.player.x - 32, // Dest X
        this.state.player.y - 32, // Dest Y
        64, // Dest width
        64  // Dest height
      );
    } else {
      // Fallback to rectangle
      this.ctx.fillStyle = '#ff69b4';
      this.ctx.fillRect(this.state.player.x - 16, this.state.player.y - 16, 32, 32);
    }

    // HUD
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);
    
    this.ctx.fillStyle = '#0ff';
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('🎮 K-POP MONSTER HUNTER', 10, 25);
    
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Captured: ${this.state.capturedSpirits.length}/3`, this.canvas.width - 10, 25);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`v2.0 - MIFF Edition`, this.canvas.width - 10, 45);
  }
}

// Start game
console.log('🎮 Initializing K-pop Monster Hunter (MIFF Edition)...');
new KpopGame();
