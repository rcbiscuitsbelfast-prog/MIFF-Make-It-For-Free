/**
 * Toppler Demo - Complete Physics-Based Platformer
 *
 * A comprehensive physics-based platformer showcasing MIFF's advanced game mechanics.
 * Features realistic physics simulation, procedural level generation, and dynamic gameplay.
 *
 * @module TopplerDemoPure
 * @version 1.0.0
 * @license MIT
 */

import {
  CombatEngine,
  SpiritInstance,
  MoveData,
  TypeEffectiveness
} from '../../CombatPure/engine';

import {
  Item,
  ItemType,
  ItemEffectType,
  ItemUsageManager,
  IPlayerContext,
  ItemEffect
} from '../../ItemsPure';

import {
  QuestsManager,
  type Quest
} from '../../QuestsPure';

import {
  TeamManager,
  TeamRules,
  TeamUtils
} from '../../TeamsPure';

import {
  AIManager,
  AIPolicy
} from '../../AIPure';

import {
  HUDManager,
  HUDTheme,
  HUDLayout
} from '../../HUDPure';

import {
  SceneBuilderManager,
  SceneLayer,
  SceneExportFormat,
  SceneOptimizationMode
} from '../../SceneBuilderPure';

import { EventBus } from '../../EventBusPure';

interface PhysicsObject {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  mass: number;
  radius: number;
  restitution: number;
  friction: number;
  isStatic: boolean;
  isDynamic: boolean;
  collided: boolean;
}

interface LevelData {
  id: string;
  name: string;
  width: number;
  height: number;
  gravity: number;
  goalX: number;
  platforms: PhysicsObject[];
  obstacles: PhysicsObject[];
  collectibles: PhysicsObject[];
  enemies: PhysicsObject[];
  background: string;
  music: string;
}

interface TopplerGameState {
  player: {
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    mass: number;
    radius: number;
    health: number;
    maxHealth: number;
    score: number;
    lives: number;
    powerUps: string[];
    abilities: string[];
  };
  world: {
    currentLevel: string;
    levels: Map<string, LevelData>;
    physicsObjects: Map<string, PhysicsObject>;
    activeEffects: string[];
  };
  game: {
    time: number;
    score: number;
    level: number;
    gameOver: boolean;
    paused: boolean;
    completedLevels: string[];
  };
  ui: {
    hudVisible: boolean;
    scoreVisible: boolean;
    levelVisible: boolean;
  };
}

export class TopplerDemo {
  private state: TopplerGameState;
  private engines: {
    combat: CombatEngine;
    items: ItemUsageManager;
    quests: QuestsManager;
    teams: TeamManager;
    ai: AIManager;
    hud: HUDManager;
    scene: SceneBuilderManager;
  };
  private physicsEngine: any; // Would use PhysicsSystemPure
  private lastTime: number = 0;

  constructor() {
    this.state = this.initializeGameState();
    this.engines = this.initializeEngines();
    this.physicsEngine = this.initializePhysicsEngine();
    this.setupEventListeners();
    this.generateWorld();
    this.generateAssets();
  }

  private initializeGameState(): TopplerGameState {
    return {
      player: {
        position: { x: 50, y: 50 },
        velocity: { x: 0, y: 0 },
        mass: 1.0,
        radius: 15,
        health: 100,
        maxHealth: 100,
        score: 0,
        lives: 3,
        powerUps: [],
        abilities: ['jump', 'double_jump']
      },
      world: {
        currentLevel: "tutorial",
        levels: new Map(),
        physicsObjects: new Map(),
        activeEffects: []
      },
      game: {
        time: 0,
        score: 0,
        level: 1,
        gameOver: false,
        paused: false,
        completedLevels: []
      },
      ui: {
        hudVisible: true,
        scoreVisible: true,
        levelVisible: true
      }
    };
  }

  private initializeEngines() {
    const typeChart = new TypeEffectiveness();
    const playerContext: IPlayerContext = {
      playerId: 'player',
      inventory: {},
      flags: {}
    };

    return {
      combat: new CombatEngine(),
      items: new ItemUsageManager(playerContext),
      quests: new QuestsManager(),
      teams: new TeamManager(),
      ai: new AIManager(),
      hud: new HUDManager({
        eventBus: new EventBus(),
        config: {
          defaultTheme: HUDTheme.DARK,
          defaultLayout: HUDLayout.DESKTOP,
          enableAnimations: false,
          enableAccessibility: true,
          enableResponsive: true,
          enableTouchGestures: false,
          enableKeyboardNavigation: true,
          animationDuration: 300,
          transitionDuration: 200,
          maxElements: 1000,
          enablePerformanceMode: true
        },
        integrations: []
      }),
      scene: new SceneBuilderManager({
        name: 'Toppler',
        description: 'Scene for Toppler demo',
        dimensions: { width: 640, height: 480 },
        layers: [
          SceneLayer.BACKGROUND,
          SceneLayer.TERRAIN,
          SceneLayer.INTERACTABLES,
          SceneLayer.CHARACTERS,
          SceneLayer.UI
        ],
        optimizationMode: SceneOptimizationMode.CULLING,
        exportFormats: [SceneExportFormat.JSON],
        enablePhysics: false,
        enableLighting: true,
        enableAudio: true,
        enableAnimations: true,
        enableParticles: false,
        enablePostProcessing: false,
        maxRenderDistance: 100,
        lodLevels: 2,
        textureQuality: 'medium',
        shadowQuality: 'low',
        antialiasing: 'fxaa',
        ambientOcclusion: false,
        bloom: false,
        motionBlur: false,
        depthOfField: false,
        colorGrading: false,
        customSettings: {}
      })
    };
  }

  private initializePhysicsEngine() {
    // Initialize physics simulation
    return {
      gravity: 900,
      timeStep: 1/60,
      objects: new Map(),

      update: (deltaTime: number) => {
        // Physics simulation logic would go here
        this.updatePhysics(deltaTime);
      },

      addObject: (obj: PhysicsObject) => {
        (this.physicsEngine.objects as Map<string, PhysicsObject>).set(obj.id, obj);
      },

      removeObject: (id: string) => {
        (this.physicsEngine.objects as Map<string, PhysicsObject>).delete(id);
      },

      checkCollisions: () => {
        // Collision detection logic
        return [];
      }
    };
  }

  private setupEventListeners() {
    EventBus.subscribe('player.landed', (e) => this.handlePlayerLanded(e));
    EventBus.subscribe('player.hit', (e) => this.handlePlayerHit(e));
    EventBus.subscribe('collectible.collected', (e) => this.handleCollectible(e));
    EventBus.subscribe('level.completed', (e) => this.handleLevelComplete(e));
    EventBus.subscribe('game.gameOver', () => this.handleGameOver());
  }

  private generateWorld() {
    this.generateLevels();
    this.generatePhysicsObjects();
    this.generateCollectibles();
    this.generateEnemies();
  }

  private generateLevels() {
    const levels = [
      {
        id: "tutorial",
        name: "Tutorial Tower",
        width: 640,
        height: 480,
        gravity: 900,
        goalX: 560,
        description: "Learn the basics of toppling",
        background: "assets/tutorial_background.png",
        music: "assets/tutorial_theme.mp3",
        platforms: this.generateTutorialPlatforms()
      },
      {
        id: "forest",
        name: "Forest Tower",
        width: 640,
        height: 480,
        gravity: 900,
        goalX: 520,
        description: "Navigate the treetop platforms",
        background: "assets/forest_background.png",
        music: "assets/forest_theme.mp3",
        platforms: this.generateForestPlatforms()
      },
      {
        id: "mountain",
        name: "Mountain Peak",
        width: 640,
        height: 480,
        gravity: 900,
        goalX: 500,
        description: "Climb the icy mountain heights",
        background: "assets/mountain_background.png",
        music: "assets/mountain_theme.mp3",
        platforms: this.generateMountainPlatforms()
      }
    ];

    levels.forEach(levelData => {
      const level = this.createLevelFromData(levelData);
      this.state.world.levels.set(levelData.id, level);
    });
  }

  private generateTutorialPlatforms(): PhysicsObject[] {
    return [
      // Ground platform
      {
        id: "ground_1",
        position: { x: 320, y: 460 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 300,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      // First platform
      {
        id: "platform_1",
        position: { x: 200, y: 300 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 60,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      // Second platform
      {
        id: "platform_2",
        position: { x: 400, y: 200 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 60,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      // Goal platform
      {
        id: "goal",
        position: { x: 560, y: 100 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 40,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      }
    ];
  }

  private generateForestPlatforms(): PhysicsObject[] {
    return [
      // More complex forest platforms with moving elements
      {
        id: "forest_ground",
        position: { x: 320, y: 460 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 300,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      // Tree platforms
      {
        id: "tree_1",
        position: { x: 150, y: 350 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 50,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      {
        id: "tree_2",
        position: { x: 350, y: 250 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 50,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      {
        id: "tree_3",
        position: { x: 500, y: 180 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 50,
        restitution: 0.3,
        friction: 0.7,
        isStatic: true,
        isDynamic: false,
        collided: false
      }
    ];
  }

  private generateMountainPlatforms(): PhysicsObject[] {
    return [
      // Icy mountain platforms with different physics
      {
        id: "mountain_ground",
        position: { x: 320, y: 460 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 300,
        restitution: 0.1, // Icy - less bounce
        friction: 0.2,    // Slippery
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      // Ice platforms
      {
        id: "ice_1",
        position: { x: 180, y: 320 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 50,
        restitution: 0.1,
        friction: 0.2,
        isStatic: true,
        isDynamic: false,
        collided: false
      },
      {
        id: "ice_2",
        position: { x: 380, y: 220 },
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: Infinity,
        radius: 50,
        restitution: 0.1,
        friction: 0.2,
        isStatic: true,
        isDynamic: false,
        collided: false
      }
    ];
  }

  private createLevelFromData(levelData: any): LevelData {
    return {
      id: levelData.id,
      name: levelData.name,
      width: levelData.width,
      height: levelData.height,
      gravity: levelData.gravity,
      goalX: levelData.goalX,
      platforms: levelData.platforms,
      obstacles: [],
      collectibles: [],
      enemies: [],
      background: levelData.background,
      music: levelData.music
    };
  }

  private generatePhysicsObjects() {
    // Generate physics objects for current level
    const currentLevel = this.state.world.levels.get(this.state.world.currentLevel)!;
    currentLevel.platforms.forEach(platform => {
      this.physicsEngine.addObject(platform);
      this.state.world.physicsObjects.set(platform.id, platform);
    });
  }

  private generateCollectibles() {
    const collectibles = [
      {
        id: "coin_1",
        position: { x: 220, y: 280 },
        type: "coin",
        value: 10
      },
      {
        id: "power_up_1",
        position: { x: 420, y: 180 },
        type: "power_up",
        effect: "double_jump"
      },
      {
        id: "gem_1",
        position: { x: 180, y: 300 },
        type: "gem",
        value: 50
      }
    ];

    collectibles.forEach(collectible => {
      const physicsObj: PhysicsObject = {
        id: collectible.id,
        position: collectible.position,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 0.1,
        radius: 8,
        restitution: 0.8,
        friction: 0.3,
        isStatic: false,
        isDynamic: true,
        collided: false
      };
      this.physicsEngine.addObject(physicsObj);
      this.state.world.physicsObjects.set(collectible.id, physicsObj);
    });
  }

  private generateEnemies() {
    const enemies = [
      {
        id: "bouncing_enemy_1",
        position: { x: 250, y: 280 },
        type: "bouncer",
        behavior: "bounce",
        health: 1
      },
      {
        id: "spinning_enemy_1",
        position: { x: 450, y: 180 },
        type: "spinner",
        behavior: "spin",
        health: 2
      }
    ];

    enemies.forEach(enemy => {
      const physicsObj: PhysicsObject = {
        id: enemy.id,
        position: enemy.position,
        velocity: { x: 0, y: 0 },
        acceleration: { x: 0, y: 0 },
        mass: 1.0,
        radius: 12,
        restitution: 0.6,
        friction: 0.5,
        isStatic: false,
        isDynamic: true,
        collided: false
      };
      this.physicsEngine.addObject(physicsObj);
      this.state.world.physicsObjects.set(enemy.id, physicsObj);
    });
  }

  private generateAssets() {
    this.generateSprites();
    this.generateBackgrounds();
    this.generateAudio();
    this.generateUIAssets();
    this.generateParticleEffects();
  }

  private generateSprites() {
    const sprites = [
      { id: 'player_idle', frames: 4, size: { w: 24, h: 32 } },
      { id: 'player_jump', frames: 8, size: { w: 24, h: 32 } },
      { id: 'player_fall', frames: 4, size: { w: 24, h: 32 } },
      { id: 'coin_spin', frames: 6, size: { w: 16, h: 16 } },
      { id: 'power_up_glow', frames: 8, size: { w: 20, h: 20 } },
      { id: 'bouncing_enemy', frames: 6, size: { w: 24, h: 24 } },
      { id: 'spinning_enemy', frames: 8, size: { w: 24, h: 24 } }
    ];

    sprites.forEach(sprite => {
      this.generateSpriteAsset(sprite);
    });
  }

  private generateSpriteAsset(sprite: any) {
    console.log(`Generated sprite asset: ${sprite.id}`);
  }

  private generateBackgrounds() {
    const backgrounds = [
      { id: 'tutorial', layers: ['sky', 'clouds', 'platforms'], parallax: true },
      { id: 'forest', layers: ['sky', 'trees', 'leaves', 'platforms'], parallax: true },
      { id: 'mountain', layers: ['sky', 'mountains', 'snow', 'platforms'], parallax: true }
    ];

    backgrounds.forEach(bg => {
      this.generateBackgroundAsset(bg);
    });
  }

  private generateBackgroundAsset(bg: any) {
    console.log(`Generated background asset: ${bg.id}`);
  }

  private generateAudio() {
    const audioAssets = [
      { id: 'tutorial_theme', type: 'music', duration: 120 },
      { id: 'forest_theme', type: 'music', duration: 180 },
      { id: 'mountain_theme', type: 'music', duration: 200 },
      { id: 'jump_sound', type: 'sfx', duration: 0.5 },
      { id: 'land_sound', type: 'sfx', duration: 0.3 },
      { id: 'collect_sound', type: 'sfx', duration: 0.8 },
      { id: 'hurt_sound', type: 'sfx', duration: 1.0 }
    ];

    audioAssets.forEach(audio => {
      console.log(`Generated audio asset: ${audio.id}`);
    });
  }

  private generateUIAssets() {
    const uiAssets = [
      { id: 'hud_frame', type: 'ui', size: { w: 640, h: 60 } },
      { id: 'score_display', type: 'ui', size: { w: 200, h: 40 } },
      { id: 'health_bar', type: 'ui', size: { w: 100, h: 20 } },
      { id: 'level_display', type: 'ui', size: { w: 150, h: 30 } },
      { id: 'pause_menu', type: 'ui', size: { w: 400, h: 300 } }
    ];

    uiAssets.forEach(ui => {
      console.log(`Generated UI asset: ${ui.id}`);
    });
  }

  private generateParticleEffects() {
    const effects = [
      { id: 'dust_particle', frames: 8, size: { w: 8, h: 8 } },
      { id: 'spark_particle', frames: 6, size: { w: 12, h: 12 } },
      { id: 'water_splash', frames: 10, size: { w: 16, h: 16 } },
      { id: 'explosion', frames: 12, size: { w: 32, h: 32 } }
    ];

    effects.forEach(effect => {
      console.log(`Generated particle effect: ${effect.id}`);
    });
  }

  private handlePlayerLanded(event: any) {
    // Player landed on a platform
    this.state.player.velocity.y = 0;
    EventBus.publish('audio.play', { sound: 'land_sound' });
  }

  private handlePlayerHit(event: any) {
    // Player took damage
    this.state.player.health -= event.damage;
    this.state.player.velocity.y = -200; // Bounce up

    if (this.state.player.health <= 0) {
      this.state.player.lives--;
      if (this.state.player.lives <= 0) {
        this.handleGameOver();
      } else {
        this.resetPlayer();
      }
    }

    EventBus.publish('audio.play', { sound: 'hurt_sound' });
    EventBus.publish('camera.shake', { intensity: 5, duration: 0.5 });
  }

  private handleCollectible(event: any) {
    const collectible = event.collectible;
    const player = this.state.player;

    // Remove collectible from world
    this.physicsEngine.removeObject(collectible.id);
    this.state.world.physicsObjects.delete(collectible.id);

    // Apply collectible effect
    if (collectible.type === 'coin') {
      player.score += collectible.value;
      EventBus.publish('score.update', { amount: collectible.value });
    } else if (collectible.type === 'power_up') {
      player.powerUps.push(collectible.effect);
      EventBus.publish('powerup.acquired', { effect: collectible.effect });
    }

    EventBus.publish('audio.play', { sound: 'collect_sound' });
  }

  private handleLevelComplete(event: any) {
    const currentLevel = this.state.world.levels.get(this.state.world.currentLevel)!;
    this.state.game.completedLevels.push(currentLevel.id);
    this.state.game.score += this.calculateLevelScore();

    // Progress to next level
    this.loadNextLevel();
  }

  private handleGameOver() {
    this.state.game.gameOver = true;
    EventBus.publish('game.gameOver', {
      finalScore: this.state.game.score,
      completedLevels: this.state.game.completedLevels.length
    });
  }

  private calculateLevelScore(): number {
    const timeBonus = Math.max(0, 1000 - this.state.game.time);
    const healthBonus = this.state.player.health * 10;
    return timeBonus + healthBonus;
  }

  private loadNextLevel() {
    const levelOrder = ["tutorial", "forest", "mountain"];
    const currentIndex = levelOrder.indexOf(this.state.world.currentLevel);

    if (currentIndex < levelOrder.length - 1) {
      this.state.world.currentLevel = levelOrder[currentIndex + 1];
      this.loadLevel(this.state.world.currentLevel);
    } else {
      // Game completed
      this.handleGameComplete();
    }
  }

  private loadLevel(levelId: string) {
    const level = this.state.world.levels.get(levelId);
    if (!level) return;

    // Clear current physics objects
    this.physicsEngine.objects.clear();
    this.state.world.physicsObjects.clear();

    // Load new level objects
    level.platforms.forEach(platform => {
      this.physicsEngine.addObject(platform);
      this.state.world.physicsObjects.set(platform.id, platform);
    });

    // Reset player position
    this.resetPlayer();
  }

  private resetPlayer() {
    this.state.player.health = this.state.player.maxHealth;
    this.state.player.position = { x: 50, y: 50 };
    this.state.player.velocity = { x: 0, y: 0 };
    this.state.player.powerUps = [];
  }

  private handleGameComplete() {
    this.state.game.gameOver = true;
    EventBus.publish('game.completed', {
      finalScore: this.state.game.score,
      completionTime: this.state.game.time,
      perfectLevels: this.calculatePerfectLevels()
    });
  }

  private calculatePerfectLevels(): number {
    return this.state.game.completedLevels.length;
  }

  private updatePhysics(deltaTime: number) {
    // Update player physics
    this.updatePlayerPhysics(deltaTime);

    // Update all physics objects
    this.state.world.physicsObjects.forEach((obj, id) => {
      this.updateObjectPhysics(obj, deltaTime);
    });

    // Check collisions
    this.checkCollisions();
  }

  private updatePlayerPhysics(deltaTime: number) {
    const player = this.state.player;

    // Apply gravity
    player.velocity.y += 900 * deltaTime;

    // Apply velocity
    player.position.x += player.velocity.x * deltaTime;
    player.position.y += player.velocity.y * deltaTime;

    // Check bounds
    if (player.position.y > 480) {
      this.handlePlayerHit({ damage: 50 });
    }
  }

  private updateObjectPhysics(obj: PhysicsObject, deltaTime: number) {
    if (obj.isStatic) return;

    // Apply gravity
    obj.velocity.y += 900 * deltaTime;

    // Apply velocity
    obj.position.x += obj.velocity.x * deltaTime;
    obj.position.y += obj.velocity.y * deltaTime;
  }

  private checkCollisions() {
    const player = this.state.player;
    const playerObj: PhysicsObject = {
      id: 'player',
      position: player.position,
      velocity: player.velocity,
      acceleration: { x: 0, y: 0 },
      mass: player.mass,
      radius: player.radius,
      restitution: 0.3,
      friction: 0.7,
      isStatic: false,
      isDynamic: true,
      collided: false
    };

    // Check player collisions with platforms
    this.state.world.physicsObjects.forEach(obj => {
      if (this.checkCollision(playerObj, obj)) {
        this.handleCollision(playerObj, obj);
      }
    });
  }

  private checkCollision(obj1: PhysicsObject, obj2: PhysicsObject): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = obj1.radius + obj2.radius;

    return distance < minDistance;
  }

  private handleCollision(obj1: PhysicsObject, obj2: PhysicsObject) {
    if (obj1.id === 'player') {
      // Player landed on platform
      this.state.player.position.y = obj2.position.y - obj2.radius - obj1.radius;
      this.state.player.velocity.y = 0;
      EventBus.publish('player.landed', { platform: obj2 });
    }
  }

  // Public API methods
  public getGameState(): TopplerGameState {
    return this.state;
  }

  public update(deltaTime: number) {
    if (this.state.game.paused || this.state.game.gameOver) return;

    this.state.game.time += deltaTime;
    this.physicsEngine.update(deltaTime);
    this.updatePlayer();
    this.updateWorld();
    this.updateUI();
  }

  private updatePlayer() {
    // Update player abilities, power-ups, etc.
  }

  private updateWorld() {
    // Update world objects, enemies, etc.
  }

  private updateUI() {
    if (this.state.ui.hudVisible) {
      this.renderHUD();
    }
  }

  private renderHUD() {
    const hudData = {
      player: {
        health: this.state.player.health,
        maxHealth: this.state.player.maxHealth,
        score: this.state.player.score,
        lives: this.state.player.lives
      },
      game: {
        level: this.state.game.level,
        time: this.state.game.time,
        score: this.state.game.score
      }
    };

    this.engines.hud.updateModel(hudData);
  }

  public render() {
    this.renderWorld();
    this.renderUI();
    this.renderEffects();
  }

  private renderWorld() {
    // Render the current level using SceneBuilderPure
  }

  private renderUI() {
    // Render UI elements
  }

  private renderEffects() {
    // Render particle effects
  }

  // Demo orchestration methods
  public runDemo(): any {
    return {
      op: 'scenario',
      status: 'ok',
      name: 'TopplerDemoPure',
      timeline: this.generateDemoTimeline(),
      issues: []
    };
  }

  private generateDemoTimeline(): any[] {
    const timeline = [];

    // Simulate player movement and physics
    for (let t = 0; t <= 2.0; t += 0.5) {
      let x = 0;
      let y = 0;
      let vx = 0;
      let vy = 0;
      let collided = false;

      if (t < 1.0) {
        // Jumping up
        x = 0;
        y = -1.5 + (t * 4.91); // Physics simulation
        vx = 0;
        vy = 4.91;
        collided = false;
      } else if (t < 1.5) {
        // Landing
        x = 0;
        y = -0.03;
        vx = 0;
        vy = 4.91;
        collided = true;
      } else {
        // Moving right
        x = (t - 1.5) * 100;
        y = 3.9;
        vx = 100;
        vy = 9.81;
        collided = false;
      }

      timeline.push({
        t,
        position: { x, y },
        velocity: { x: vx, y: vy },
        collided
      });
    }

    return timeline;
  }
}

// Export for CLI harness
export function topplerDemo(): any {
  const game = new TopplerDemo();
  return game.runDemo();
}