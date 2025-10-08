/**
 * WebBridge for RenderWorldPure - Real-Time AI-Native Game Preview Engine
 *
 * Provides web-based rendering capabilities for the RenderWorld hub scene,
 * enabling GitHub Pages deployment and browser-based preview functionality.
 *
 * @module RenderWorldPure/webBridge
 * @version 1.0.0
 * @license MIT
 */

import { RenderWorldPure } from './index';
import { EventBus } from '../EventBusPure/EventBusPure.js';

interface WebRendererConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  pixelRatio: number;
  enableDebug: boolean;
  quality: 'low' | 'medium' | 'high';
}

interface RenderWorldWebState {
  renderer: RenderWorldPure | null;
  animationId: number | null;
  isRunning: boolean;
  lastTime: number;
  frameCount: number;
  fps: number;
  performanceMetrics: {
    renderTime: number;
    updateTime: number;
    memoryUsage: number;
  };
}

export class RenderWorldWebBridge {
  private config: WebRendererConfig;
  private state: RenderWorldWebState;
  private gl: WebGLRenderingContext | null = null;
  private shaderProgram: WebGLProgram | null = null;
  private buffers: Map<string, WebGLBuffer> = new Map();
  private textures: Map<string, WebGLTexture> = new Map();
  private camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov: number;
    near: number;
    far: number;
  };

  constructor(canvas: HTMLCanvasElement, config: Partial<WebRendererConfig> = {}) {
    this.config = {
      canvas,
      width: canvas.width,
      height: canvas.height,
      pixelRatio: window.devicePixelRatio || 1,
      enableDebug: false,
      quality: 'medium',
      ...config
    };

    this.state = {
      renderer: null,
      animationId: null,
      isRunning: false,
      lastTime: 0,
      frameCount: 0,
      fps: 60,
      performanceMetrics: {
        renderTime: 0,
        updateTime: 0,
        memoryUsage: 0
      }
    };

    this.camera = {
      position: { x: 0, y: 1.7, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      fov: Math.PI / 3,
      near: 0.1,
      far: 1000
    };

    this.initializeWebGL();
    this.setupEventListeners();
    this.initializeRenderer();
  }

  private initializeWebGL(): void {
    const canvas = this.config.canvas;
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!context) {
      throw new Error('WebGL not supported');
    }

    this.gl = context as WebGLRenderingContext;

    // Set canvas size accounting for pixel ratio
    const width = this.config.width * this.config.pixelRatio;
    const height = this.config.height * this.config.pixelRatio;

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${this.config.width}px`;
    canvas.style.height = `${this.config.height}px`;

    this.gl.viewport(0, 0, width, height);

    // Set clear color to match warehouse ambient lighting
    this.gl.clearColor(0.2, 0.2, 0.3, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);

    // Initialize shaders
    this.initializeShaders();
  }

  private initializeShaders(): void {
    if (!this.gl) return;

    const vertexShaderSource = `
      attribute vec3 aVertexPosition;
      attribute vec3 aVertexNormal;
      attribute vec2 aTextureCoord;

      uniform mat4 uModelViewMatrix;
      uniform mat4 uProjectionMatrix;
      uniform mat3 uNormalMatrix;

      varying vec3 vNormal;
      varying vec2 vTextureCoord;
      varying vec3 vPosition;

      void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
        vNormal = uNormalMatrix * aVertexNormal;
        vTextureCoord = aTextureCoord;
        vPosition = aVertexPosition;
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;

      varying vec3 vNormal;
      varying vec2 vTextureCoord;
      varying vec3 vPosition;

      uniform sampler2D uSampler;
      uniform vec3 uAmbientColor;
      uniform vec3 uDirectionalColor;
      uniform vec3 uDirectionalDirection;
      uniform vec3 uEmissiveColor;
      uniform float uEmissiveIntensity;

      void main(void) {
        vec3 normal = normalize(vNormal);
        vec3 lightDirection = normalize(uDirectionalDirection);
        float diffuse = max(dot(normal, lightDirection), 0.0);

        vec3 ambient = uAmbientColor;
        vec3 diffuseColor = uDirectionalColor * diffuse;
        vec3 emissive = uEmissiveColor * uEmissiveIntensity;

        vec4 textureColor = texture2D(uSampler, vTextureCoord);

        gl_FragColor = vec4(ambient + diffuseColor + emissive, 1.0) * textureColor;
      }
    `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
      throw new Error('Failed to create shaders');
    }

    const shaderProgram = this.gl.createProgram();
    if (!shaderProgram) {
      throw new Error('Failed to create shader program');
    }

    this.gl.attachShader(shaderProgram, vertexShader);
    this.gl.attachShader(shaderProgram, fragmentShader);
    this.gl.linkProgram(shaderProgram);

    if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
      throw new Error('Failed to link shader program: ' + this.gl.getProgramInfoLog(shaderProgram));
    }

    this.shaderProgram = shaderProgram;

    // Get attribute and uniform locations
    this.gl.useProgram(shaderProgram);
    (shaderProgram as any).aVertexPosition = this.gl.getAttribLocation(shaderProgram as any, 'aVertexPosition');
    (shaderProgram as any).aVertexNormal = this.gl.getAttribLocation(shaderProgram as any, 'aVertexNormal');
    (shaderProgram as any).aTextureCoord = this.gl.getAttribLocation(shaderProgram as any, 'aTextureCoord');

    (shaderProgram as any).uModelViewMatrix = this.gl.getUniformLocation(shaderProgram as any, 'uModelViewMatrix');
    (shaderProgram as any).uProjectionMatrix = this.gl.getUniformLocation(shaderProgram as any, 'uProjectionMatrix');
    (shaderProgram as any).uNormalMatrix = this.gl.getUniformLocation(shaderProgram as any, 'uNormalMatrix');
    (shaderProgram as any).uSampler = this.gl.getUniformLocation(shaderProgram as any, 'uSampler');
    (shaderProgram as any).uAmbientColor = this.gl.getUniformLocation(shaderProgram as any, 'uAmbientColor');
    (shaderProgram as any).uDirectionalColor = this.gl.getUniformLocation(shaderProgram as any, 'uDirectionalColor');
    (shaderProgram as any).uDirectionalDirection = this.gl.getUniformLocation(shaderProgram as any, 'uDirectionalDirection');
    (shaderProgram as any).uEmissiveColor = this.gl.getUniformLocation(shaderProgram as any, 'uEmissiveColor');
    (shaderProgram as any).uEmissiveIntensity = this.gl.getUniformLocation(shaderProgram as any, 'uEmissiveIntensity');
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  private setupEventListeners(): void {
    // Keyboard controls
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    // Mouse controls
    this.config.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.config.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.config.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // Touch controls for mobile
    this.config.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.config.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.config.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Window events
    window.addEventListener('resize', this.handleResize.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
  }

  private initializeRenderer(): void {
    this.state.renderer = new RenderWorldPure();

    // Setup input system integration
    this.setupInputIntegration();

    // Setup debug overlay if enabled
    if (this.config.enableDebug) {
      this.setupDebugOverlay();
    }

    // Setup performance monitoring
    this.setupPerformanceMonitoring();
  }

  private setupInputIntegration(): void {
    // Integrate with InputSystemPure for unified input handling
    EventBus.subscribe('input.keyboard', (e) => this.handleInputEvent(e));
    EventBus.subscribe('input.mouse', (e) => this.handleInputEvent(e));
    EventBus.subscribe('input.touch', (e) => this.handleInputEvent(e));
  }

  private setupDebugOverlay(): void {
    const debugContainer = document.createElement('div');
    debugContainer.id = 'renderworld-debug';
    debugContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      border-radius: 5px;
    `;
    document.body.appendChild(debugContainer);
  }

  private setupPerformanceMonitoring(): void {
    // Monitor performance metrics
    if ('performance' in window && 'memory' in (performance as any)) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.state.performanceMetrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      }, 1000);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    EventBus.publish('input.keyboard', {
      type: 'keydown',
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    });
  }

  private handleKeyUp(event: KeyboardEvent): void {
    EventBus.publish('input.keyboard', {
      type: 'keyup',
      key: event.key,
      code: event.code,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    });
  }

  private handleMouseDown(event: MouseEvent): void {
    EventBus.publish('input.mouse', {
      type: 'mousedown',
      button: event.button,
      x: event.clientX,
      y: event.clientY,
      canvasX: event.clientX / this.config.width * this.config.canvas.width,
      canvasY: event.clientY / this.config.height * this.config.canvas.height
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    EventBus.publish('input.mouse', {
      type: 'mousemove',
      button: event.buttons,
      x: event.clientX,
      y: event.clientY,
      canvasX: event.clientX / this.config.width * this.config.canvas.width,
      canvasY: event.clientY / this.config.height * this.config.canvas.height
    });
  }

  private handleMouseUp(event: MouseEvent): void {
    EventBus.publish('input.mouse', {
      type: 'mouseup',
      button: event.button,
      x: event.clientX,
      y: event.clientY,
      canvasX: event.clientX / this.config.width * this.config.canvas.width,
      canvasY: event.clientY / this.config.height * this.config.canvas.height
    });
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    EventBus.publish('input.touch', {
      type: 'touchstart',
      x: touch.clientX,
      y: touch.clientY,
      canvasX: touch.clientX / this.config.width * this.config.canvas.width,
      canvasY: touch.clientY / this.config.height * this.config.canvas.height
    });
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    EventBus.publish('input.touch', {
      type: 'touchmove',
      x: touch.clientX,
      y: touch.clientY,
      canvasX: touch.clientX / this.config.width * this.config.canvas.width,
      canvasY: touch.clientY / this.config.height * this.config.canvas.height
    });
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    EventBus.publish('input.touch', {
      type: 'touchend',
      x: 0,
      y: 0,
      canvasX: 0,
      canvasY: 0
    });
  }

  private handleResize(): void {
    // Handle window resize
    this.config.width = this.config.canvas.clientWidth;
    this.config.height = this.config.canvas.clientHeight;
    this.config.canvas.width = this.config.width * this.config.pixelRatio;
    this.config.canvas.height = this.config.height * this.config.pixelRatio;
    this.gl?.viewport(0, 0, this.config.canvas.width, this.config.canvas.height);
  }

  private handleBlur(): void {
    // Pause when window loses focus
    if (this.state.isRunning) {
      this.pause();
    }
  }

  private handleFocus(): void {
    // Resume when window gains focus
    if (!this.state.isRunning && this.state.animationId) {
      this.resume();
    }
  }

  private handleInputEvent(event: any): void {
    // Convert web input events to RenderWorld input
    switch (event.type) {
      case 'keydown':
        this.handleKeyboardInput(event);
        break;
      case 'mousemove':
        this.handleMouseInput(event);
        break;
      case 'mousedown':
        this.handleMouseClick(event);
        break;
    }
  }

  private handleKeyboardInput(event: any): void {
    const playerVelocity = { x: 0, y: 0, z: 0 };

    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        playerVelocity.z = -5;
        break;
      case 's':
      case 'arrowdown':
        playerVelocity.z = 5;
        break;
      case 'a':
      case 'arrowleft':
        playerVelocity.x = -5;
        break;
      case 'd':
      case 'arrowright':
        playerVelocity.x = 5;
        break;
      case ' ':
        if (event.type === 'keydown') {
          playerVelocity.y = 5; // Jump
        }
        break;
      case 'e':
        if (event.type === 'keydown') {
          EventBus.publish('spiritLens.use', {});
        }
        break;
      case 'escape':
        if (event.type === 'keydown') {
          this.togglePause();
        }
        break;
    }

    if (playerVelocity.x !== 0 || playerVelocity.y !== 0 || playerVelocity.z !== 0) {
      EventBus.publish('player.move', { velocity: playerVelocity });
    }
  }

  private handleMouseInput(event: any): void {
    // Handle mouse look
    const sensitivity = 0.002;
    const deltaX = event.canvasX - this.config.width / 2;
    const deltaY = event.canvasY - this.config.height / 2;

    this.camera.rotation.y -= deltaX * sensitivity;
    this.camera.rotation.x -= deltaY * sensitivity;
    this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

    // Reset mouse position to center
    this.config.canvas.style.cursor = 'none';
  }

  private handleMouseClick(event: any): void {
    // Handle mouse interactions
    if (event.button === 0) { // Left click
      EventBus.publish('player.interact', { position: event });
    }
  }

  public start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!this.state.isRunning) return;

      const deltaTime = (currentTime - this.state.lastTime) / 1000;
      this.state.lastTime = currentTime;

      this.update(deltaTime);
      this.render();

      this.state.animationId = requestAnimationFrame(animate);
    };

    this.state.animationId = requestAnimationFrame(animate);
  }

  public pause(): void {
    this.state.isRunning = false;
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
      this.state.animationId = null;
    }
  }

  public resume(): void {
    if (!this.state.isRunning) {
      this.start();
    }
  }

  public stop(): void {
    this.pause();
    this.cleanup();
  }

  private togglePause(): void {
    if (this.state.isRunning) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private update(deltaTime: number): void {
    if (!this.state.renderer) return;

    // Update renderer
    this.state.renderer.update(deltaTime);

    // Update camera to follow player
    this.updateCamera();

    // Update performance metrics
    this.updatePerformanceMetrics(deltaTime);

    // Update debug info
    if (this.config.enableDebug) {
      this.updateDebugDisplay();
    }
  }

  private updateCamera(): void {
    if (!this.state.renderer) return;

    const gameState = this.state.renderer.getGameState();
    const player = gameState.player;

    // Smooth camera following
    const followSpeed = 5;
    const targetX = player.position.x;
    const targetY = player.position.y + 1;
    const targetZ = player.position.z + 8;

    this.camera.position.x += (targetX - this.camera.position.x) * followSpeed * 0.016;
    this.camera.position.y += (targetY - this.camera.position.y) * followSpeed * 0.016;
    this.camera.position.z += (targetZ - this.camera.position.z) * followSpeed * 0.016;
  }

  private updatePerformanceMetrics(deltaTime: number): void {
    this.state.frameCount++;

    if (this.state.frameCount % 60 === 0) {
      this.state.fps = Math.round(1 / deltaTime);
      this.state.performanceMetrics.updateTime = deltaTime;
    }
  }

  private updateDebugDisplay(): void {
    const debugContainer = document.getElementById('renderworld-debug');
    if (!debugContainer) return;

    const gameState = this.state.renderer?.getGameState();
    const debugInfo = `
FPS: ${this.state.fps}
Render Time: ${this.state.performanceMetrics.renderTime.toFixed(2)}ms
Update Time: ${this.state.performanceMetrics.updateTime.toFixed(2)}ms
Memory Usage: ${(this.state.performanceMetrics.memoryUsage * 100).toFixed(1)}%
Player: (${gameState?.player.position.x.toFixed(1)}, ${gameState?.player.position.y.toFixed(1)}, ${gameState?.player.position.z.toFixed(1)})
Portals Active: ${Object.values(gameState?.world.portals || {}).filter(p => p.active).length}
NPCs: ${Object.keys(gameState?.world.npcs || {}).length}
    `.trim();

    debugContainer.textContent = debugInfo;
  }

  private render(): void {
    if (!this.gl || !this.shaderProgram || !this.state.renderer) return;

    // Clear buffers
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Setup camera matrices
    this.setupCameraMatrices();

    // Render the scene
    this.renderScene();
  }

  private setupCameraMatrices(): void {
    if (!this.gl || !this.shaderProgram) return;

    const projectionMatrix = this.createProjectionMatrix();
    const modelViewMatrix = this.createModelViewMatrix();

    this.gl.uniformMatrix4fv((this.shaderProgram as any).uProjectionMatrix, false, projectionMatrix);
    this.gl.uniformMatrix4fv((this.shaderProgram as any).uModelViewMatrix, false, modelViewMatrix);
  }

  private createProjectionMatrix(): Float32Array {
    const aspect = this.config.width / this.config.height;
    const fov = this.camera.fov;
    const near = this.camera.near;
    const far = this.camera.far;

    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }

  private createModelViewMatrix(): Float32Array {
    const cX = Math.cos(this.camera.rotation.x);
    const sX = Math.sin(this.camera.rotation.x);
    const cY = Math.cos(this.camera.rotation.y);
    const sY = Math.sin(this.camera.rotation.y);
    const cZ = Math.cos(this.camera.rotation.z);
    const sZ = Math.sin(this.camera.rotation.z);

    const matrix = new Float32Array(16);

    // Translation
    matrix[12] = -this.camera.position.x;
    matrix[13] = -this.camera.position.y;
    matrix[14] = -this.camera.position.z;

    // Rotation (simplified - would need full matrix multiplication for complete implementation)
    return matrix;
  }

  private renderScene(): void {
    if (!this.gl || !this.state.renderer) return;

    // This would contain the full rendering implementation
    // For now, we'll emit events that the RenderWorld renderer can handle

    EventBus.publish('webgl.render', {
      gl: this.gl,
      shaderProgram: this.shaderProgram,
      camera: this.camera,
      gameState: this.state.renderer.getGameState()
    });
  }

  private cleanup(): void {
    if (this.state.animationId) {
      cancelAnimationFrame(this.state.animationId);
    }

    if (this.gl) {
      // Clean up WebGL resources
      this.buffers.forEach(buffer => this.gl.deleteBuffer(buffer));
      this.textures.forEach(texture => this.gl.deleteTexture(texture));
      this.buffers.clear();
      this.textures.clear();

      if (this.shaderProgram) {
        this.gl.deleteProgram(this.shaderProgram);
      }
    }

    // Remove debug overlay
    const debugContainer = document.getElementById('renderworld-debug');
    if (debugContainer) {
      document.body.removeChild(debugContainer);
    }
  }

  // Public API
  public getConfig(): WebRendererConfig {
    return this.config;
  }

  public getState(): RenderWorldWebState {
    return this.state;
  }

  public setQuality(quality: 'low' | 'medium' | 'high'): void {
    this.config.quality = quality;

    // Adjust rendering settings based on quality
    if (this.gl) {
      switch (quality) {
        case 'low':
          this.gl.disable(this.gl.DEPTH_TEST);
          break;
        case 'medium':
          this.gl.enable(this.gl.DEPTH_TEST);
          this.gl.disable(this.gl.CULL_FACE);
          break;
        case 'high':
          this.gl.enable(this.gl.DEPTH_TEST);
          this.gl.enable(this.gl.CULL_FACE);
          break;
      }
    }
  }

  public toggleDebug(): void {
    this.config.enableDebug = !this.config.enableDebug;

    if (this.config.enableDebug) {
      this.setupDebugOverlay();
    } else {
      const debugContainer = document.getElementById('renderworld-debug');
      if (debugContainer) {
        document.body.removeChild(debugContainer);
      }
    }
  }
}

// Export for web usage
if (typeof window !== 'undefined') {
  (window as any).RenderWorldWebBridge = RenderWorldWebBridge;
}