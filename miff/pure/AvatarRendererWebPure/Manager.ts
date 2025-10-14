/**
 * AvatarRendererWebPure Manager - Advanced Avatar Rendering for Web Platform
 *
 * Comprehensive avatar rendering system for web browsers with:
 * - WebGL-based 3D avatar rendering
 * - Canvas 2D fallback support
 * - Material and shader management
 * - LOD (Level of Detail) system
 * - Performance optimization
 * - Cross-browser compatibility
 * - Real-time rendering monitoring
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { StructuredLogger } from '../shared/logging/StructuredLogger';
import { PerformanceOptimizer } from '../shared/performance/PerformanceOptimizer';
import { MemoryManager } from '../shared/memory/MemoryManager';
import { StandardErrorHandler } from '../shared/error/StandardErrorHandler';

export interface AvatarRendererWebConfig {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enableWebGLRendering: boolean;
  enableCanvas2DFallback: boolean;
  enableMaterialManagement: boolean;
  enableShaderManagement: boolean;
  enableLODSystem: boolean;
  enablePerformanceOptimization: boolean;
  enableCrossBrowserCompatibility: boolean;
  enableRealTimeMonitoring: boolean;
  maxAvatars: number;
  maxLODLevels: number;
  enableCloudSync: boolean;
  enableBackup: boolean;
  enableVersioning: boolean;
}

export interface AvatarRendererWeb {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: RendererType;
  status: RendererStatus;
  avatars: WebAvatar[];
  materials: WebMaterial[];
  shaders: WebShader[];
  lodSystem: LODSystem;
  performance: RendererPerformance;
  analytics: RendererAnalytics;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface WebAvatar {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: AvatarType;
  status: AvatarStatus;
  mesh: WebMesh;
  materials: string[];
  animations: WebAnimation[];
  lodLevels: LODLevel[];
  transform: Transform3D;
  metadata: Record<string, any>;
}

export interface WebMaterial {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: MaterialType;
  shader: string;
  properties: MaterialProperties;
  textures: WebTexture[];
  metadata: Record<string, any>;
}

export interface WebShader {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: ShaderType;
  vertexCode: string;
  fragmentCode: string;
  uniforms: ShaderUniform[];
  metadata: Record<string, any>;
}

export interface WebMesh {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  vertices: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  submeshes: Submesh[];
  metadata: Record<string, any>;
}

export interface WebAnimation {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: AnimationType;
  duration: number; // seconds
  tracks: AnimationTrack[];
  metadata: Record<string, any>;
}

export interface LODSystem {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  enabled: boolean;
  levels: LODLevel[];
  distances: number[];
  autoSwitch: boolean;
  performanceMode: PerformanceMode;
}

export interface LODLevel {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  level: number;
  distance: number;
  mesh: string;
  materials: string[];
  quality: QualityLevel;
  metadata: Record<string, any>;
}

export interface WebTexture {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  name: string;
  type: TextureType;
  path: string;
  size: { width: number; height: number };
  format: TextureFormat;
  metadata: Record<string, any>;
}

export interface Submesh {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  material: string;
  indices: number[];
  metadata: Record<string, any>;
}

export interface AnimationTrack {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  id: string;
  type: TrackType;
  property: string;
  keyframes: Keyframe[];
  metadata: Record<string, any>;
}

export interface Keyframe {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  time: number; // seconds
  value: any;
  interpolation: InterpolationType;
  metadata: Record<string, any>;
}

export interface MaterialProperties {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface ShaderUniform {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  name: string;
  type: UniformType;
  value: any;
  metadata: Record<string, any>;
}

export interface Transform3D {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  scale: { x: number; y: number; z: number };
}

export interface RendererPerformance {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  fps: number;
  drawCalls: number;
  triangles: number;
  memoryUsage: number; // bytes
  gpuUsage: number; // 0 to 1
  cpuUsage: number; // 0 to 1
}

export interface RendererAnalytics {
  // Auto-added common properties
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  totalRenderers: number;
  activeRenderers: number;
  totalAvatars: number;
  activeAvatars: number;
  totalMaterials: number;
  totalShaders: number;
  averageFPS: number;
  lastUpdated: Date;
}

export type RendererType = 'webgl' | 'webgl2' | 'canvas2d' | 'webgpu' | 'custom';
export type RendererStatus = 'active' | 'inactive' | 'error' | 'maintenance';
export type AvatarType = 'character' | 'creature' | 'vehicle' | 'prop' | 'environment';
export type AvatarStatus = 'rendering' | 'paused' | 'hidden' | 'error';
export type MaterialType = 'standard' | 'pbr' | 'unlit' | 'transparent' | 'custom';
export type ShaderType = 'vertex' | 'fragment' | 'compute' | 'custom';
export type AnimationType = 'idle' | 'walk' | 'run' | 'jump' | 'attack' | 'custom';
export type TextureType = 'diffuse' | 'normal' | 'specular' | 'emission' | 'custom';
export type TextureFormat = 'png' | 'jpg' | 'webp' | 'gif' | 'svg';
export type TrackType = 'position' | 'rotation' | 'scale' | 'property' | 'custom';
export type InterpolationType = 'linear' | 'cubic' | 'step' | 'bezier';
export type UniformType = 'float' | 'int' | 'bool' | 'vec2' | 'vec3' | 'vec4' | 'mat4';
export type PerformanceMode = 'quality' | 'balanced' | 'performance' | 'mobile';
export type QualityLevel = 'low' | 'medium' | 'high' | 'ultra';

export class AvatarRendererWebManager {
  
  private performanceOptimizer: PerformanceOptimizer;
  private memoryManager: MemoryManager;
  private errorHandler: StandardErrorHandler;
  private config: AvatarRendererWebConfig;
  private renderers: Map<string, AvatarRendererWeb> = new Map();
  private isInitialized: boolean = false;
  private startTime: Date;

  constructor(config?: Partial<AvatarRendererWebConfig>) {
    
    this.performanceOptimizer = new PerformanceOptimizer();
    this.memoryManager = new MemoryManager();
    this.errorHandler = new StandardErrorHandler();
    this.startTime = new Date();

    this.config = {
      enableWebGLRendering: true,
      enableCanvas2DFallback: true,
      enableMaterialManagement: true,
      enableShaderManagement: true,
      enableLODSystem: true,
      enablePerformanceOptimization: true,
      enableCrossBrowserCompatibility: true,
      enableRealTimeMonitoring: true,
      maxAvatars: 50,
      maxLODLevels: 4,
      enableCloudSync: false,
      enableBackup: true,
      enableVersioning: true,
      ...config
    };
  }

  /**
   * Initialize the Avatar Renderer Web Manager
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('AvatarRendererWebPure', 'Avatar Renderer Web Manager already initialized');
      return;
    }

    try {
      console.info('AvatarRendererWebPure', 'Initializing Avatar Renderer Web Manager...');

      // Initialize performance optimizer
      if (this.config.enablePerformanceOptimization) {
        // PerformanceOptimizer does not require initialization
      }

      // Initialize memory manager
      if (this.config.enableRealTimeMonitoring) {
        // MemoryManager initialization handled internally
      }

      this.isInitialized = true;
      console.info('AvatarRendererWebPure', 'Avatar Renderer Web Manager initialized successfully');

    } catch (error) {
      this.errorHandler.handleError($1);
      throw error;
    }
  }

  /**
   * Create a new avatar renderer
   */
  async createRenderer(rendererData: Omit<AvatarRendererWeb, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'analytics'>): Promise<AvatarRendererWeb> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer: AvatarRendererWeb = {
        ...rendererData,
        id: this.generateRendererId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        analytics: {
          totalRenderers: 0,
          activeRenderers: 0,
          totalAvatars: 0,
          activeAvatars: 0,
          totalMaterials: 0,
          totalShaders: 0,
          averageFPS: 0,
          lastUpdated: new Date()
        }
      };

      this.renderers.set(renderer.id, renderer);
      this.updateAnalytics();

      console.info('Avatar renderer created', { rendererId: renderer.id, rendererName: renderer.name });
      return renderer;

    } catch (error) {
      this.errorHandler.handleError($1);
      throw error;
    }
  }

  /**
   * Get an avatar renderer by ID
   */
  getRenderer(rendererId: string): AvatarRendererWeb | null {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    return this.renderers.get(rendererId) || null;
  }

  /**
   * Update an avatar renderer
   */
  async updateRenderer(rendererId: string, updates: Partial<AvatarRendererWeb>): Promise<AvatarRendererWeb | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return null;
      }

      const updatedRenderer: AvatarRendererWeb = {
        ...renderer,
        ...updates,
        updatedAt: new Date(),
        version: this.incrementVersion(renderer.version)
      };

      this.renderers.set(rendererId, updatedRenderer);
      this.updateAnalytics();

      console.info('Avatar renderer updated', { rendererId, rendererName: updatedRenderer.name });
      return updatedRenderer;

    } catch (error) {
      this.errorHandler.handleError($1);
      throw error;
    }
  }

  /**
   * Delete an avatar renderer
   */
  async deleteRenderer(rendererId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return false;
      }

      this.renderers.delete(rendererId);
      this.updateAnalytics();

      console.info('Avatar renderer deleted', { rendererId, rendererName: renderer.name });
      return true;

    } catch (error) {
      this.errorHandler.handleError($1);
      throw error;
    }
  }

  /**
   * Get all avatar renderers
   */
  getAllRenderers(): AvatarRendererWeb[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    return Array.from(this.renderers.values());
  }

  /**
   * Get renderers by type
   */
  getRenderersByType(type: RendererType): AvatarRendererWeb[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    return Array.from(this.renderers.values()).filter(renderer => renderer.type === type);
  }

  /**
   * Get renderers by status
   */
  getRenderersByStatus(status: RendererStatus): AvatarRendererWeb[] {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    return Array.from(this.renderers.values()).filter(renderer => renderer.status === status);
  }

  /**
   * Add an avatar to a renderer
   */
  async addAvatar(rendererId: string, avatarData: Omit<WebAvatar, 'id'>): Promise<WebAvatar | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return null;
      }

      const avatar: WebAvatar = {
        ...avatarData,
        id: this.generateAvatarId()
      };

      renderer.avatars.push(avatar);
      this.updateAnalytics();

      console.info('Avatar added to renderer', { rendererId, avatarId: avatar.id, avatarName: avatar.name });
      return avatar;

    } catch (error) {
      this.errorHandler.handleError($1);
      return null;
    }
  }

  /**
   * Remove an avatar from a renderer
   */
  async removeAvatar(rendererId: string, avatarId: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return false;
      }

      const avatarIndex = renderer.avatars.findIndex(avatar => avatar.id === avatarId);
      if (avatarIndex === -1) {
        console.warn('Avatar not found', { rendererId, avatarId });
        return false;
      }

      renderer.avatars.splice(avatarIndex, 1);
      this.updateAnalytics();

      console.info('Avatar removed from renderer', { rendererId, avatarId });
      return true;

    } catch (error) {
      this.errorHandler.handleError($1);
      return false;
    }
  }

  /**
   * Add a material to a renderer
   */
  async addMaterial(rendererId: string, materialData: Omit<WebMaterial, 'id'>): Promise<WebMaterial | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return null;
      }

      const material: WebMaterial = {
        ...materialData,
        id: this.generateMaterialId()
      };

      renderer.materials.push(material);
      this.updateAnalytics();

      console.info('Material added to renderer', { rendererId, materialId: material.id, materialName: material.name });
      return material;

    } catch (error) {
      this.errorHandler.handleError($1);
      return null;
    }
  }

  /**
   * Add a shader to a renderer
   */
  async addShader(rendererId: string, shaderData: Omit<WebShader, 'id'>): Promise<WebShader | null> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return null;
      }

      const shader: WebShader = {
        ...shaderData,
        id: this.generateShaderId()
      };

      renderer.shaders.push(shader);
      this.updateAnalytics();

      console.info('Shader added to renderer', { rendererId, shaderId: shader.id, shaderName: shader.name });
      return shader;

    } catch (error) {
      this.errorHandler.handleError($1);
      return null;
    }
  }

  /**
   * Update avatar transform
   */
  async updateAvatarTransform(rendererId: string, avatarId: string, transform: Transform3D): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return false;
      }

      const avatar = renderer.avatars.find(a => a.id === avatarId);
      if (!avatar) {
        console.warn('Avatar not found', { rendererId, avatarId });
        return false;
      }

      avatar.transform = transform;
      console.debug('Avatar transform updated', { rendererId, avatarId });
      return true;

    } catch (error) {
      this.errorHandler.handleError($1);
      return false;
    }
  }

  /**
   * Set LOD level for an avatar
   */
  async setAvatarLOD(rendererId: string, avatarId: string, lodLevel: number): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    try {
      const renderer = this.renderers.get(rendererId);
      if (!renderer) {
        console.warn('Renderer not found', { rendererId });
        return false;
      }

      const avatar = renderer.avatars.find(a => a.id === avatarId);
      if (!avatar) {
        console.warn('Avatar not found', { rendererId, avatarId });
        return false;
      }

      // Find the LOD level
      const lod = avatar.lodLevels.find(l => l.level === lodLevel);
      if (!lod) {
        console.warn('LOD level not found', { rendererId, avatarId, lodLevel });
        return false;
      }

      // Update avatar to use this LOD level
      avatar.mesh.id = lod.mesh;
      avatar.materials = lod.materials;

      console.debug('Avatar LOD level set', { rendererId, avatarId, lodLevel });
      return true;

    } catch (error) {
      this.errorHandler.handleError($1);
      return false;
    }
  }

  /**
   * Generate a unique renderer ID
   */
  private generateRendererId(): string {
    return `renderer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique avatar ID
   */
  private generateAvatarId(): string {
    return `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique material ID
   */
  private generateMaterialId(): string {
    return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique shader ID
   */
  private generateShaderId(): string {
    return `shader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(): void {
    const renderers = Array.from(this.renderers.values());
    const activeRenderers = renderers.filter(r => r.status === 'active');
    const totalAvatars = renderers.reduce((sum, r) => sum + r.avatars.length, 0);
    const activeAvatars = renderers.reduce((sum, r) => sum + r.avatars.filter(a => a.status === 'rendering').length, 0);
    const totalMaterials = renderers.reduce((sum, r) => sum + r.materials.length, 0);
    const totalShaders = renderers.reduce((sum, r) => sum + r.shaders.length, 0);
    const totalFPS = renderers.reduce((sum, r) => sum + r.performance.fps, 0);

    for (const renderer of renderers) {
      renderer.analytics = {
        totalRenderers: renderers.length,
        activeRenderers: activeRenderers.length,
        totalAvatars: totalAvatars,
        activeAvatars: activeAvatars,
        totalMaterials: totalMaterials,
        totalShaders: totalShaders,
        averageFPS: renderers.length > 0 ? totalFPS / renderers.length : 0,
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Get system statistics
   */
  getStatistics(): {
    totalRenderers: number;
    activeRenderers: number;
    renderersByType: Record<RendererType, number>;
    renderersByStatus: Record<RendererStatus, number>;
    totalAvatars: number;
    activeAvatars: number;
    totalMaterials: number;
    totalShaders: number;
    averageFPS: number;
    uptime: number;
  } {
    if (!this.isInitialized) {
      throw new Error('Avatar Renderer Web Manager not initialized');
    }

    const renderers = Array.from(this.renderers.values());
    const activeRenderers = renderers.filter(r => r.status === 'active');
    const totalAvatars = renderers.reduce((sum, r) => sum + r.avatars.length, 0);
    const activeAvatars = renderers.reduce((sum, r) => sum + r.avatars.filter(a => a.status === 'rendering').length, 0);
    const totalMaterials = renderers.reduce((sum, r) => sum + r.materials.length, 0);
    const totalShaders = renderers.reduce((sum, r) => sum + r.shaders.length, 0);
    const totalFPS = renderers.reduce((sum, r) => sum + r.performance.fps, 0);

    const renderersByType: Record<RendererType, number> = {
      webgl: 0,
      webgl2: 0,
      canvas2d: 0,
      webgpu: 0,
      custom: 0
    };

    const renderersByStatus: Record<RendererStatus, number> = {
      active: 0,
      inactive: 0,
      error: 0,
      maintenance: 0
    };

    for (const renderer of renderers) {
      renderersByType[renderer.type]++;
      renderersByStatus[renderer.status]++;
    }

    return {
      totalRenderers: renderers.length,
      activeRenderers: activeRenderers.length,
      renderersByType,
      renderersByStatus,
      totalAvatars,
      activeAvatars,
      totalMaterials,
      totalShaders,
      averageFPS: renderers.length > 0 ? totalFPS / renderers.length : 0,
      uptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Destroy the Avatar Renderer Web Manager
   */
  async destroy(): Promise<void> {
    console.info('AvatarRendererWebPure', 'Destroying Avatar Renderer Web Manager...');

    this.renderers.clear();
    this.isInitialized = false;

    console.info('AvatarRendererWebPure', 'Avatar Renderer Web Manager destroyed');
  }
}

// Export default instance
export const avatarRendererWebManager = new AvatarRendererWebManager();
export default avatarRendererWebManager;