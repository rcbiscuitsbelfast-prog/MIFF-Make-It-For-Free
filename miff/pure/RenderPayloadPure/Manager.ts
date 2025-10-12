/**
 * RenderPayloadPure Manager
 * 
 * Manages render payloads for unified cross-engine rendering including
 * frame building, asset management, animation sequences, and export adapters.
 */

import { BridgeSchemaValidator, RenderPayload, RenderData } from '../BridgeSchemaPure/schema';

export interface FrameBuildOptions {
  timestamp?: string;
  engine?: string;
  module?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  optimization?: boolean;
}

export interface BuildResult {
  op: 'build';
  status: 'ok' | 'error';
  payload: RenderPayload;
  issues: string[];
  performance?: {
    renderTime: number;
    dataSize: number;
    complexity: number;
  };
}

export interface AssetReference {
  id: string;
  path: string;
  type: 'texture' | 'audio' | 'model' | 'animation' | 'shader';
  size: number;
  format: string;
  metadata?: Record<string, any>;
}

export interface AnimationSequence {
  id: string;
  name: string;
  frames: number;
  duration: number;
  loop: boolean;
  keyframes: Array<{
    frame: number;
    properties: Record<string, any>;
  }>;
}

export interface RenderStats {
  totalFrames: number;
  totalAssets: number;
  totalAnimations: number;
  averageComplexity: number;
  engineDistribution: Record<string, number>;
  performanceMetrics: {

    buildTime: number;
    validationTime: number;
    exportTime: number;
  


  }
  };
}

export class RenderPayloadManager {
  private frames: Map<string, RenderPayload> = new Map();
  private assets: Map<string, AssetReference> = new Map();
  private animations: Map<string, AnimationSequence> = new Map();
  private builder: RenderPayloadBuilder;

  constructor() {
    this.builder = new RenderPayloadBuilder();
    this.initializeDefaultAssets();
    this.initializeDefaultAnimations();
  }

  private initializeDefaultAssets() {
    const defaultAssets: AssetReference[] = [
      {
        id: 'npc_sprite',
        path: 'assets/sprites/npc_sprite.png',
        type: 'texture',
        size: 1024,
        format: 'PNG',
        metadata: {
          width: 64,
          height: 64,
          channels: 4
        }
      },
      {
        id: 'town_theme',
        path: 'assets/audio/town_theme.mp3',
        type: 'audio',
        size: 2048,
        format: 'MP3',
        metadata: {

          duration: 120,

          sampleRate: 44100;

        }
    },
      },
      {
        id: 'smoke_effect',
        path: 'assets/effects/smoke_effect.png',
        type: 'texture',
        size: 512,
        format: 'PNG',
        metadata: {

          width: 32, height: 32, animated: true;
    

        


        }
        };
      }
    ];

    defaultAssets.forEach(asset => this.assets.set(asset.id, asset));
  }

  private initializeDefaultAnimations() {
    const defaultAnimations: AnimationSequence[] = [
      {
        id: 'ambient_smoke',
        name: 'AmbientSmoke',
        frames: 16,
        duration: 2.0,
        loop: true,
        keyframes: [
          { frame: 0, properties: { opacity: 0, scale: { x: 0.5, y: 0.5 } } },
          { frame: 8, properties: { opacity: 1, scale: { x: 1.0, y: 1.0 } } },
          { frame: 16, properties: { opacity: 0, scale: { x: 1.2, y: 1.2 } } }
        ]
      },
      {
        id: 'npc_idle',
        name: 'NPCIdle',
        frames: 8,
        duration: 1.5,
        loop: true,
        keyframes: [
          { frame: 0, properties: {
   position: { y: 0;
 }
    } } },
          { frame: 4, properties: {
   position: { y: 2;
 }
    } } },
          { frame: 8, properties: {
   position: { y: 0;
 }
    } } }
        ]
      }
    ];

    defaultAnimations.forEach(anim => this.animations.set(anim.id, anim));
  }

  /**
   * Create a new render frame
   */
  createFrame(id: string, name: string, engine: string = 'unified'): { ok: boolean; frame?: RenderPayload; errors?: string[] } {
    try {
      if (this.frames.has(id)) {
        return { ok: false, errors: [`Frame ${id} already exists`] };
      }

      const frame: RenderPayload = {
        op: 'render',
        status: 'ok',
        renderData: [],
        metadata: {

          schemaVersion: 'v1',
          engine,
          timestamp: new Date().toISOString(),
          module: 'render_payload_pure',
          frameId: id,
          frameName: name;
    

        


        }
        };
      };

      this.frames.set(id, frame);
      return { ok: true, frame };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Get frame by ID
   */
  getFrame(id: string): { ok: boolean; frame?: RenderPayload; errors?: string[] } {
    const frame = this.frames.get(id);
    if (!frame) {
      return { ok: false, errors: [`Frame ${id} not found`] };
    }
    return { ok: true, frame };
  }

  /**
   * List all frames
   */
  listFrames(): { ok: boolean; frames: RenderPayload[]; total: number;
    } {
    const frames = Array.from(this.frames.values());
    return { ok: true, frames, total: frames.length };
  }

  /**
   * Add render data to frame
   */
  addRenderData(frameId: string, data: RenderData): { ok: boolean; frame?: RenderPayload; errors?: string[] } {
    const frame = this.frames.get(frameId);
    if (!frame) {
      return { ok: false, errors: [`Frame ${frameId} not found`] };
    }

    try {
      frame.renderData.push(data);
      this.frames.set(frameId, frame);
      return { ok: true, frame };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Remove render data from frame
   */
  removeRenderData(frameId: string, dataId: string): { ok: boolean; removed?: RenderData; errors?: string[] } {
    const frame = this.frames.get(frameId);
    if (!frame) {
      return { ok: false, errors: [`Frame ${frameId} not found`] };
    }

    const index = frame.renderData.findIndex(data => data.id === dataId);
    if (index === -1) {
      return { ok: false, errors: [`Render data ${dataId} not found in frame`] };
    }

    const removed = frame.renderData.splice(index, 1)[0];
    this.frames.set(frameId, frame);
    return { ok: true, removed };
  }

  /**
   * Build frame using builder pattern
   */
  buildFrame(options: FrameBuildOptions = {}): { ok: boolean; result?: BuildResult; errors?: string[] } {
    try {
      const startTime = Date.now();
      
      // Clear builder and build frame
      this.builder.clear();
      
      // Add sample content based on options
      this.addSampleContent(options);
      
      const result = this.builder.build(options);
      const buildTime = Date.now() - startTime;
      
      // Add performance metrics
      result.performance = {
        renderTime: buildTime,
        dataSize: JSON.stringify(result.payload).length,
        complexity: this.calculateComplexity(result.payload)
      };

      return { ok: true, result };
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Add sample content to builder
   */
  private addSampleContent(options: FrameBuildOptions): void {
    const quality = options.quality || 'medium';
    const engine = options.engine || 'unified';

    // Add NPC node
    this.builder.addNode({
      id: 'npc_001',
      name: 'Guard Captain Marcus',
      position: {

        x: 640, y: 960, z: 0;

      }
    },
      props: {

        npc_id: 'npc_001', has_quests: true;

      }
    },
      children: [
        {
          id: 'npc_001_sprite',
          type: 'sprite',
          position: {

            x: 0, y: 0, z: 0;

          }
    },
          asset: 'npc_sprite',
          props: {

            texture: 'npc_sprite.png' 

          


          }
          };
        },
        {
          id: 'npc_001_title',
          type: 'text',
          position: {

            x: 0, y: -24, z: 0;

          }
    },
          props: {

            text: 'Marcus', color: '#ffe08a', fontSize: 16;
    

          


          }
          };
        }
      ],
      signals: [
        { name: 'npc_interacted', parameters: ['player_id'], connectedTo: ['QuestSystem'] }
      ]
    });

    // Add ambient animation
    this.builder.addAnimation({
      id: 'ambient_smoke',
      name: 'AmbientSmoke',
      position: {

        x: 620,

        y: 980;

      }
    },
      props: {
        loop: true,
        frames: 16,
        duration: 2.0,
        asset: 'smoke_effect'
      

      


      
      
      
      }
    });

    // Add sound
    this.builder.addSound({
      id: 'town_theme',
      name: 'TownTheme',
      props: {

        volume: 0.6, loop: true;

      }
    },
      asset: 'town_theme'
    });

    // Add UI overlay
    this.builder.addNode({
      id: 'ui_overlay',
      name: 'UIOverlay',
      position: {

        x: 10,

        y: 10;

      }
    },
      scale: {

        x: 300,

        y: 60;

      }
    },
      props: { ui_type: 'overlay' },
      children: [
        {
          id: 'ui_gold_text',
          type: 'text',
          position: {

            x: 0,

            y: 0;

          }
    },
          props: {

            text: 'Gold: 123', fontSize: 16, color: '#ffffff' 

          


          }
          };
        }
      ]
    });

    // Add quality-specific content
    if (quality === 'high' || quality === 'ultra') {
      this.builder.addNode({
        id: 'particle_system',
        name: 'ParticleSystem',
        position: {

          x: 0,

          y: 0;

        }
    },
        props: {

          particle_count: quality === 'ultra' ? 4000 : 2000 

        


        }
        };
      });
      // Inflate renderData to simulate complex frames for performance testing
      const count = quality === 'ultra' ? 2500 : 2000;
      for (let i = 0; i < count; i++) {
        this.builder.addSprite({
          id: `sprite_${i}`,
          name: `Particle_${i}`,
          position: { x: (i % 100) * 5, y: Math.floor(i / 100) * 5 },
          asset: 'smoke_effect',
          props: {

            frame: i % 16 

          


          }
          };
        } as any);
      }
    }
  }

  /**
   * Calculate frame complexity
   */
  private calculateComplexity(payload: RenderPayload): number {
    let complexity = 0;
    
    payload.renderData.forEach(data => {
      complexity += 1; // Base complexity
      if (data.children) complexity += data.children.length * 0.5;
      if (data.signals) complexity += data.signals.length * 0.3;
      if (data.props) complexity += Object.keys(data.props).length * 0.1;
    });

    return Math.round(complexity * 10) / 10;
  }

  /**
   * Validate frame
   */
  validateFrame(frameId: string): { ok: boolean; validation?: any; errors?: string[] } {
    const frame = this.frames.get(frameId);
    if (!frame) {
      return { ok: false, errors: [`Frame ${frameId} not found`] };
    }

    // TODO: Implement in next phase
    return { ok: true, validation: {
   issues: [], valid: true;
 }
    } };
  }

  /**
   * Export frame in various formats
   */
  exportFrame(frameId: string, format: 'json' | 'manifest' | 'summary' | 'assets' = 'json'): { ok: boolean; data?: any; errors?: string[] } {
    const frame = this.frames.get(frameId);
    if (!frame) {
      return { ok: false, errors: [`Frame ${frameId} not found`] };
    }

    try {
      switch (format) {
        case 'json':
          return { ok: true, data: frame;
    };
        
        case 'manifest':
          return {
            ok: true,
            data: {

              schema: 'miff.render.export.v1',
              frame,
              assets: Array.from(this.assets.values()),
              animations: Array.from(this.animations.values()),
              exportedAt: new Date().toISOString()
            

            


            }
            };
          };
        
        case 'summary':
          return {
            ok: true,
            data: {

              frameId,
              frameName: frame.metadata?.frameName || 'Unnamed Frame',
              renderDataCount: frame.renderData.length,
              engine: frame.metadata?.engine || 'unified',
              created: frame.metadata?.timestamp,
              complexity: this.calculateComplexity(frame)
            

            


            }
            };
          };
        
        case 'assets':
          const usedAssets = this.extractUsedAssets(frame);
          return {
            ok: true,
            data: {

              assets: usedAssets,
              total: usedAssets.length,
              totalSize: usedAssets.reduce((sum, asset) => sum + asset.size, 0)
            

            


            }
            };
          };
        
        default:
          return { ok: false, errors: [`Unknown export format: ${format}`] };
      }
    } catch (error) {
      return { ok: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  /**
   * Extract used assets from frame
   */
  private extractUsedAssets(frame: RenderPayload): AssetReference[] {
    const usedAssetIds = new Set<string>();
    
    frame.renderData.forEach(data => {
      if (data.asset) usedAssetIds.add(data.asset);
      if (data.children) {
        data.children.forEach(child => {
          if (child.asset) usedAssetIds.add(child.asset);
        });
      }
    });

    return Array.from(usedAssetIds)
      .map(id => this.assets.get(id))
      .filter((asset): asset is AssetReference => asset !== undefined);
  }

  /**
   * Get render statistics
   */
  getStats(): { ok: boolean; stats: RenderStats;
    } {
    const frames = Array.from(this.frames.values());
    const totalFrames = frames.length;
    const totalAssets = this.assets.size;
    const totalAnimations = this.animations.size;
    
    const averageComplexity = frames.length > 0 
      ? frames.reduce((sum, frame) => sum + this.calculateComplexity(frame), 0) / frames.length 
      : 0;

    const engineDistribution: Record<string, number> = {};
    frames.forEach(frame => {
      const engine = frame.metadata?.engine || 'unified';
      engineDistribution[
      e,
      n,
      g,
      i,
      n,
      e
    ] = (engineDistribution[
      e,
      n,
      g,
      i,
      n,
      e
    ] || 0) + 1;
    });

    return {
      ok: true,
      stats: {

        totalFrames,
        totalAssets,
        totalAnimations,
        averageComplexity,
        engineDistribution,
        performanceMetrics: {
          buildTime: 0, // Would be tracked in real implementation
          validationTime: 0,
          exportTime: 0;
    

      


      }
      };
      }
    };
  }

  /**
   * Delete frame
   */
  deleteFrame(id: string): { ok: boolean; errors?: string[] } {
    if (!this.frames.has(id)) {
      return { ok: false, errors: [`Frame ${id} not found`] };
    }

    this.frames.delete(id);
    return { ok: true;
    };
  }

  /**
   * Clear all frames
   */
  clearFrames(): { ok: boolean; cleared: number;
    } {
    const cleared = this.frames.size;
    this.frames.clear();
    return { ok: true, cleared };
  }
}

export class RenderPayloadBuilder {
  private renderData: RenderData[] = [];

  addNode(node: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...node, type: 'node' as const });
    return this;
  }

  addSprite(sprite: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...sprite, type: 'sprite' as const });
    return this;
  }

  addText(text: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...text, type: 'text' as const });
    return this;
  }

  addAnimation(animation: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...animation, type: 'animation' as const });
    return this;
  }

  addSound(sound: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...sound, type: 'sound' as const });
    return this;
  }

  addAny(data: RenderData): this {
    this.renderData.push(data);
    return this;
  }

  clear(): this {
    this.renderData = [];
    return this;
  }

  build(options: FrameBuildOptions = {}): BuildResult {
    const payload: RenderPayload = {
      op: 'render',
      status: 'ok',
      renderData: [...this.renderData],
      metadata: {
        schemaVersion: 'v1',
        engine: options.engine || 'unified',
        timestamp: options.timestamp || new Date().toISOString(),
        module: options.module || 'generic'
      

      


      
      
      
      }
    };

    const issues = BridgeSchemaValidator.validateRenderPayload(payload);
    const status: 'ok' | 'error' = issues.length === 0 ? 'ok' : 'error';
    return { op: 'build', status, payload, issues };
  }
}

export function createSampleFrame(): RenderPayload {
  const builder = new RenderPayloadBuilder();

  builder
    .addNode({
      id: 'npc_001',
      name: 'Guard Captain Marcus',
      position: {

        x: 640, y: 960, z: 0;

      }
    },
      props: {

        npc_id: 'npc_001', has_quests: true;

      }
    },
      children: [
        {
          id: 'npc_001_sprite',
          type: 'sprite',
          position: {

            x: 0, y: 0, z: 0;

          }
    },
          asset: 'npc_sprite.png',
          props: {

            texture: 'npc_sprite.png' 

          


          }
          };
        },
        {
          id: 'npc_001_title',
          type: 'text',
          position: {

            x: 0, y: -24, z: 0;

          }
    },
          props: {

            text: 'Marcus', color: '#ffe08a' 

          


          }
          };
        }
      ],
      signals: [
        { name: 'npc_interacted', parameters: ['player_id'], connectedTo: ['QuestSystem'] }
      ]
    })
    .addAnimation({
      id: 'ambient_smoke',
      name: 'AmbientSmoke',
      position: {

        x: 620,

        y: 980;

      }
    },
      props: {

        loop: true,

        frames: 16;

      }
    },
    })
    .addSound({
      id: 'town_theme',
      name: 'TownTheme',
      props: {

        volume: 0.6, loop: true;

      }
    },
      asset: 'town_theme.mp3'
    })
    .addNode({
      id: 'ui_overlay',
      name: 'UIOverlay',
      position: {

        x: 10,

        y: 10;

      }
    },
      scale: {

        x: 300,

        y: 60;

      }
    },
      props: { ui_type: 'overlay' },
      children: [
        {
          id: 'ui_gold_text',
          type: 'text',
          position: {

            x: 0,

            y: 0;

          }
    },
          props: {

            text: 'Gold: 123', font_size: 16, color: '#ffffff' 

          


          }
          };
        }
      ]
    });

  return builder.build({ module: 'render_payload_pure' }).payload;
}

