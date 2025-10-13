/**
 * Phase 5: Animation Sequencer
 * 
 * Generates movement sequences: walk, idle, jump, attack, emote
 * Drives animation from rig and limb config
 * Stores animation presets in .anim.json
 */

import { RigConfig, AnimationConfig, Keyframe } from './types';

export class AnimationSequencer {
  private rigConfig: RigConfig;
  private animations: Map<string, AnimationConfig> = new Map();
  private nextId: number = 0;

  constructor(rigConfig: RigConfig) {
    this.rigConfig = rigConfig;
  }

  /**
   * Create animation sequence
   */
  createAnimation(
    name: string,
    type: AnimationConfig['type'],
    duration: number,
    loop: boolean = true,
    keyframes: Omit<Keyframe, 'time'>[] = []
  ): AnimationSequencer {
    const animationId = this.generateId();
    const animation: AnimationConfig = {
      id: animationId,
      name,
      type,
      duration,
      loop,
      keyframes: keyframes.map((kf, index) => ({
        nodeId: kf.nodeId,
        transform: kf.transform,
        interpolation: kf.interpolation,
        handles: (kf as any).handles,
        time: (index / Math.max(1, keyframes.length - 1)) * duration
      } as Keyframe)),
      rigId: this.rigConfig.id,
      metadata: {}
    };

    this.animations.set(animationId, animation);
    return this;
  }

  /**
   * Generate walk animation
   */
  generateWalkAnimation(speed: number = 1.0): AnimationSequencer {
    const duration = 2000 / speed; // 2 seconds base duration
    const keyframes: Omit<Keyframe, 'time'>[] = [];

    // Get all limb nodes
    const limbNodes = Object.values(this.rigConfig.nodes).filter(node => 
      node.metadata?.limbType === 'arm' || node.metadata?.limbType === 'leg'
    );

    // Generate keyframes for walk cycle
    const walkCycle = this.generateWalkCycle(limbNodes);
    
    walkCycle.forEach((cycleKeyframes, cycleIndex) => {
      const time = (cycleIndex / (walkCycle.length - 1)) * duration;
      cycleKeyframes.forEach(keyframe => {
        const kf: Omit<Keyframe, 'time'> = {
          nodeId: keyframe.nodeId,
          transform: keyframe.transform,
          interpolation: keyframe.interpolation,
          handles: (keyframe as any).handles
        };
        // store without time; time computed in createAnimation
        keyframes.push(kf);
      });
    });

    this.createAnimation('Walk', 'walk', duration, true, keyframes);
    return this;
  }

  /**
   * Generate idle animation
   */
  generateIdleAnimation(): AnimationSequencer {
    const duration = 4000; // 4 seconds
    const keyframes: Omit<Keyframe, 'time'>[] = [];

    // Subtle breathing motion for torso
    const torsoNode = Object.values(this.rigConfig.nodes).find(node => node.type === 'torso');
    if (torsoNode) {
      keyframes.push(
        {
          nodeId: torsoNode.id,
          transform: {
            position: torsoNode.transform.position,
            rotation: torsoNode.transform.rotation,
            scale: { ...torsoNode.transform.scale, y: torsoNode.transform.scale.y * 1.02 }
          },
          interpolation: 'bezier'
        },
        {
          nodeId: torsoNode.id,
          transform: {
            position: torsoNode.transform.position,
            rotation: torsoNode.transform.rotation,
            scale: { ...torsoNode.transform.scale, y: torsoNode.transform.scale.y * 0.98 }
          },
          interpolation: 'bezier'
        }
      );
    }

    // Subtle head movement
    const headNode = Object.values(this.rigConfig.nodes).find(node => node.type === 'head');
    if (headNode) {
      keyframes.push(
        {
          nodeId: headNode.id,
          transform: {
            position: headNode.transform.position,
            rotation: { ...headNode.transform.rotation, y: headNode.transform.rotation.y + 0.1 },
            scale: headNode.transform.scale
          },
          interpolation: 'bezier'
        },
        {
          nodeId: headNode.id,
          transform: {
            position: headNode.transform.position,
            rotation: { ...headNode.transform.rotation, y: headNode.transform.rotation.y - 0.1 },
            scale: headNode.transform.scale
          },
          interpolation: 'bezier'
        }
      );
    }

    this.createAnimation('Idle', 'idle', duration, true, keyframes);
    return this;
  }

  /**
   * Generate jump animation
   */
  generateJumpAnimation(): AnimationSequencer {
    const duration = 1500; // 1.5 seconds
    const keyframes: Omit<Keyframe, 'time'>[] = [];

    // Get root node (torso)
    const rootNode = this.rigConfig.nodes[this.rigConfig.rootNode];
    if (rootNode) {
      // Jump up
      keyframes.push(
        {
          nodeId: rootNode.id,
          transform: {
            position: rootNode.transform.position,
            rotation: rootNode.transform.rotation,
            scale: rootNode.transform.scale
          },
          interpolation: 'bezier'
        },
        {
          nodeId: rootNode.id,
          transform: {
            position: { ...rootNode.transform.position, y: rootNode.transform.position.y + 1.5 },
            rotation: rootNode.transform.rotation,
            scale: rootNode.transform.scale
          },
          interpolation: 'bezier'
        },
        {
          nodeId: rootNode.id,
          transform: {
            position: rootNode.transform.position,
            rotation: rootNode.transform.rotation,
            scale: rootNode.transform.scale
          },
          interpolation: 'bezier'
        }
      );
    }

    // Leg movement for jump
    const legNodes = Object.values(this.rigConfig.nodes).filter(node => 
      node.metadata?.limbType === 'leg'
    );

    legNodes.forEach(legNode => {
      keyframes.push(
        {
          nodeId: legNode.id,
          transform: {
            position: legNode.transform.position,
            rotation: { ...legNode.transform.rotation, x: legNode.transform.rotation.x - 0.5 },
            scale: legNode.transform.scale
          },
          interpolation: 'bezier'
        },
        {
          nodeId: legNode.id,
          transform: {
            position: legNode.transform.position,
            rotation: { ...legNode.transform.rotation, x: legNode.transform.rotation.x + 0.3 },
            scale: legNode.transform.scale
          },
          interpolation: 'bezier'
        },
        {
          nodeId: legNode.id,
          transform: {
            position: legNode.transform.position,
            rotation: legNode.transform.rotation,
            scale: legNode.transform.scale
          },
          interpolation: 'bezier'
        }
      );
    });

    this.createAnimation('Jump', 'jump', duration, false, keyframes);
    return this;
  }

  /**
   * Generate attack animation
   */
  generateAttackAnimation(attackType: 'punch' | 'kick' | 'slash' = 'punch'): AnimationSequencer {
    const duration = 800; // 0.8 seconds
    const keyframes: Omit<Keyframe, 'time'>[] = [];

    if (attackType === 'punch') {
      // Get arm nodes
      const armNodes = Object.values(this.rigConfig.nodes).filter(node => 
        node.metadata?.limbType === 'arm'
      );

      armNodes.forEach((armNode, index) => {
        const isLeftArm = index % 2 === 0; // Assume alternating left/right
        const punchDirection = isLeftArm ? -1 : 1;

        keyframes.push(
          {
            nodeId: armNode.id,
            transform: {
              position: armNode.transform.position,
              rotation: armNode.transform.rotation,
              scale: armNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: armNode.id,
            transform: {
              position: { 
                ...armNode.transform.position, 
                x: armNode.transform.position.x + punchDirection * 0.5,
                z: armNode.transform.position.z + 0.3
              },
              rotation: { 
                ...armNode.transform.rotation, 
                x: armNode.transform.rotation.x - 0.3,
                y: armNode.transform.rotation.y + punchDirection * 0.2
              },
              scale: armNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: armNode.id,
            transform: {
              position: armNode.transform.position,
              rotation: armNode.transform.rotation,
              scale: armNode.transform.scale
            },
            interpolation: 'bezier'
          }
        );
      });
    } else if (attackType === 'kick') {
      // Get leg nodes
      const legNodes = Object.values(this.rigConfig.nodes).filter(node => 
        node.metadata?.limbType === 'leg'
      );

      legNodes.forEach((legNode, index) => {
        const isLeftLeg = index % 2 === 0;
        const kickDirection = isLeftLeg ? -1 : 1;

        keyframes.push(
          {
            nodeId: legNode.id,
            transform: {
              position: legNode.transform.position,
              rotation: legNode.transform.rotation,
              scale: legNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: legNode.id,
            transform: {
              position: { 
                ...legNode.transform.position, 
                x: legNode.transform.position.x + kickDirection * 0.4,
                z: legNode.transform.position.z + 0.6
              },
              rotation: { 
                ...legNode.transform.rotation, 
                x: legNode.transform.rotation.x - 0.8,
                y: legNode.transform.rotation.y + kickDirection * 0.1
              },
              scale: legNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: legNode.id,
            transform: {
              position: legNode.transform.position,
              rotation: legNode.transform.rotation,
              scale: legNode.transform.scale
            },
            interpolation: 'bezier'
          }
        );
      });
    }

    this.createAnimation(`Attack_${attackType}`, 'attack', duration, false, keyframes);
    return this;
  }

  /**
   * Generate emote animation
   */
  generateEmoteAnimation(emoteType: 'wave' | 'nod' | 'shake' | 'dance' = 'wave'): AnimationSequencer {
    const duration = 2000; // 2 seconds
    const keyframes: Omit<Keyframe, 'time'>[] = [];

    if (emoteType === 'wave') {
      // Get first arm node
      const armNodes = Object.values(this.rigConfig.nodes).filter(node => 
        node.metadata?.limbType === 'arm'
      );
      const wavingArm = armNodes[0];

      if (wavingArm) {
        keyframes.push(
          {
            nodeId: wavingArm.id,
            transform: {
              position: wavingArm.transform.position,
              rotation: wavingArm.transform.rotation,
              scale: wavingArm.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: wavingArm.id,
            transform: {
              position: { 
                ...wavingArm.transform.position, 
                x: wavingArm.transform.position.x + 0.3,
                z: wavingArm.transform.position.z + 0.2
              },
              rotation: { 
                ...wavingArm.transform.rotation, 
                x: wavingArm.transform.rotation.x - 0.5,
                y: wavingArm.transform.rotation.y + 0.3
              },
              scale: wavingArm.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: wavingArm.id,
            transform: {
              position: { 
                ...wavingArm.transform.position, 
                x: wavingArm.transform.position.x + 0.2,
                z: wavingArm.transform.position.z + 0.1
              },
              rotation: { 
                ...wavingArm.transform.rotation, 
                x: wavingArm.transform.rotation.x - 0.3,
                y: wavingArm.transform.rotation.y - 0.3
              },
              scale: wavingArm.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: wavingArm.id,
            transform: {
              position: wavingArm.transform.position,
              rotation: wavingArm.transform.rotation,
              scale: wavingArm.transform.scale
            },
            interpolation: 'bezier'
          }
        );
      }
    } else if (emoteType === 'nod') {
      // Head nodding
      const headNode = Object.values(this.rigConfig.nodes).find(node => node.type === 'head');
      if (headNode) {
        keyframes.push(
          {
            nodeId: headNode.id,
            transform: {
              position: headNode.transform.position,
              rotation: headNode.transform.rotation,
              scale: headNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: headNode.id,
            transform: {
              position: headNode.transform.position,
              rotation: { ...headNode.transform.rotation, x: headNode.transform.rotation.x + 0.3 },
              scale: headNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: headNode.id,
            transform: {
              position: headNode.transform.position,
              rotation: { ...headNode.transform.rotation, x: headNode.transform.rotation.x - 0.3 },
              scale: headNode.transform.scale
            },
            interpolation: 'bezier'
          },
          {
            nodeId: headNode.id,
            transform: {
              position: headNode.transform.position,
              rotation: headNode.transform.rotation,
              scale: headNode.transform.scale
            },
            interpolation: 'bezier'
          }
        );
      }
    }

    this.createAnimation(`Emote_${emoteType}`, 'emote', duration, false, keyframes);
    return this;
  }

  /**
   * Generate walk cycle for limbs
   */
  private generateWalkCycle(limbNodes: any[]): Omit<Keyframe, 'time'>[][] {
    const cycles: Omit<Keyframe, 'time'>[][] = [];
    const cycleSteps = 8; // 8 steps per cycle

    for (let step = 0; step < cycleSteps; step++) {
      const cycleKeyframes: Omit<Keyframe, 'time'>[] = [];
      const stepProgress = step / cycleSteps;

      limbNodes.forEach((limbNode, index) => {
        const isLeftLimb = index % 2 === 0;
        const isArm = limbNode.metadata?.limbType === 'arm';
        const phaseOffset = isLeftLimb ? 0 : 0.5; // Opposite phase for left/right
        const adjustedProgress = (stepProgress + phaseOffset) % 1;

        let rotationX = 0;
        let rotationZ = 0;

        if (isArm) {
          // Arm swing
          rotationX = Math.sin(adjustedProgress * Math.PI * 2) * 0.3;
          rotationZ = Math.sin(adjustedProgress * Math.PI * 2) * 0.1;
        } else {
          // Leg movement
          rotationX = Math.sin(adjustedProgress * Math.PI * 2) * 0.6;
          rotationZ = Math.sin(adjustedProgress * Math.PI * 2) * 0.2;
        }

        cycleKeyframes.push({
          nodeId: limbNode.id,
          transform: {
            position: limbNode.transform.position,
            rotation: {
              x: limbNode.transform.rotation.x + rotationX,
              y: limbNode.transform.rotation.y,
              z: limbNode.transform.rotation.z + rotationZ,
              w: limbNode.transform.rotation.w
            },
            scale: limbNode.transform.scale
          },
          interpolation: 'bezier'
        });
      });

      cycles.push(cycleKeyframes);
    }

    return cycles;
  }

  /**
   * Add keyframe to animation
   */
  addKeyframe(animationId: string, keyframe: Omit<Keyframe, 'time'>, time: number): AnimationSequencer {
    const animation = this.animations.get(animationId);
    if (!animation) throw new Error(`Animation ${animationId} not found`);

    const newKeyframe: Keyframe = {
      ...keyframe,
      time: Math.max(0, Math.min(time, animation.duration))
    };

    animation.keyframes.push(newKeyframe);
    animation.keyframes.sort((a, b) => a.time - b.time);

    return this;
  }

  /**
   * Remove keyframe from animation
   */
  removeKeyframe(animationId: string, keyframeIndex: number): AnimationSequencer {
    const animation = this.animations.get(animationId);
    if (!animation) throw new Error(`Animation ${animationId} not found`);

    if (keyframeIndex >= 0 && keyframeIndex < animation.keyframes.length) {
      animation.keyframes.splice(keyframeIndex, 1);
    }

    return this;
  }

  /**
   * Get animation by ID
   */
  getAnimation(animationId: string): AnimationConfig! {
    return this.animations.get(animationId);
  }

  /**
   * Get all animations
   */
  getAllAnimations(): AnimationConfig[] {
    return Array.from(this.animations.values());
  }

  /**
   * Get animations by type
   */
  getAnimationsByType(type: AnimationConfig['type']): AnimationConfig[] {
    return Array.from(this.animations.values()).filter(anim => anim.type === type);
  }

  /**
   * Delete animation
   */
  deleteAnimation(animationId: string): AnimationSequencer {
    this.animations.delete(animationId);
    return this;
  }

  /**
   * Export animations as JSON
   */
  exportAnimationsJson(): string {
    const exportData = {
      animations: Array.from(this.animations.values()),
      exportFormat: 'miff-anim-v1',
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Validate animation configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.animations.forEach(animation => {
      // Check keyframes are in chronological order
      for (let i = 1; i < animation.keyframes.length; i++) {
        if (animation.keyframes[i].time < animation.keyframes[i - 1].time) {
          errors.push(`Animation ${animation.name} has keyframes out of order`);
          break;
        }
      }

      // Check keyframes reference valid nodes
      animation.keyframes.forEach(keyframe => {
        if (!this.rigConfig.nodes[keyframe.nodeId]) {
          errors.push(`Animation ${animation.name} references non-existent node ${keyframe.nodeId}`);
        }
      });

      // Check duration is positive
      if (animation.duration <= 0) {
        errors.push(`Animation ${animation.name} has invalid duration`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private generateId(): string {
    return `anim_${this.nextId++}_${Date.now()}`;
  }

  private calculateChecksum(): string {
    const data = JSON.stringify(Array.from(this.animations.values()));
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}
