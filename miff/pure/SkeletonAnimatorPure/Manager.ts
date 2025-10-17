/**
 * SkeletonAnimatorManager - Main coordinator for all phases
 * 
 * Manages the complete skeleton animation system workflow
 * from rig building to export and integration
 */

import { RigBuilder } from './RigBuilder';
import { LimbAttachment } from './LimbAttachment';
import { SkinMeshGenerator } from './SkinMeshGenerator';
import { FacialDetailBuilder } from './FacialDetailBuilder';
import { AnimationSequencer } from './AnimationSequencer';
import { ExportIntegration } from './ExportIntegration';
import { UIBuilder } from './UIBuilder';
import { SkeletonState, RigConfig, SkinConfig, FaceConfig, AnimationConfig } from './types';

export class SkeletonAnimatorManager {
  private rigBuilder: RigBuilder;
  private limbAttachment: LimbAttachment | null = null;
  private skinMeshGenerator: SkinMeshGenerator | null = null;
  private facialDetailBuilder: FacialDetailBuilder | null = null;
  private animationSequencer: AnimationSequencer | null = null;
  private exportIntegration: ExportIntegration | null = null;
  private uiBuilder: UIBuilder | null = null;
  private skeletonState: SkeletonState;

  constructor(initialRigConfig?: Partial<RigConfig>) {
    const managerId = this.id ?? `manager_${Date.now()}`;
    this.rigBuilder = new RigBuilder(initialRigConfig);
    this.skeletonState = {
      rig: this.rigBuilder.getConfig(),
      animations: {},
      uiState: {
        mode: 'rig',
        selectedTool: 'select',
        viewport: {
          camera: {
            position: { x: 0, y: 2, z: 5 },
            target: { x: 0, y: 0, z: 0 },
            fov: 60
          },
          grid: {
            visible: true,
            size: 1
          },
          gizmos: {
            visible: true,
            size: 1
          }
        },
        panels: []
      }
    };
  }

  /**
   * Phase 1: Initialize Rig Builder
   */
  initializeRigBuilder(): SkeletonAnimatorManager {
    this.rigBuilder = new RigBuilder();
    this.skeletonState.rig = this.rigBuilder.getConfig();
    return this;
  }

  /**
   * Phase 2: Initialize Limb Attachment
   */
  initializeLimbAttachment(): SkeletonAnimatorManager {
    this.limbAttachment = new LimbAttachment(this.skeletonState.rig);
    return this;
  }

  /**
   * Phase 3: Initialize Skin Mesh Generator
   */
  initializeSkinMeshGenerator(): SkeletonAnimatorManager {
    this.skinMeshGenerator = new SkinMeshGenerator(this.skeletonState.rig);
    this.skeletonState.skin = this.skinMeshGenerator.getSkinConfig();
    return this;
  }

  /**
   * Phase 4: Initialize Facial Detail Builder
   */
  initializeFacialDetailBuilder(): SkeletonAnimatorManager {
    this.facialDetailBuilder = new FacialDetailBuilder(this.skeletonState.rig);
    this.skeletonState.face = this.facialDetailBuilder.getFaceConfig();
    return this;
  }

  /**
   * Phase 5: Initialize Animation Sequencer
   */
  initializeAnimationSequencer(): SkeletonAnimatorManager {
    this.animationSequencer = new AnimationSequencer(this.skeletonState.rig);
    return this;
  }

  /**
   * Phase 6: Initialize Export Integration
   */
  initializeExportIntegration(): SkeletonAnimatorManager {
    this.exportIntegration = new ExportIntegration(this.skeletonState);
    return this;
  }

  /**
   * Initialize UI Builder
   */
  initializeUIBuilder(): SkeletonAnimatorManager {
    this.uiBuilder = new UIBuilder(this.skeletonState);
    return this;
  }

  /**
   * Complete workflow: Create a full character
   */
  createFullCharacter(name: string, options: {
    includeLimbs?: boolean;
    includeSkin?: boolean;
    includeFace?: boolean;
    includeAnimations?: boolean;
    characterType?: 'humanoid' | 'creature' | 'robot';
  } = {}): SkeletonAnimatorManager {
    const {
      includeLimbs = true,
      includeSkin = true,
      includeFace = true,
      includeAnimations = true,
      characterType = 'humanoid'
    } = options;

    // Phase 1: Create core body
    this.rigBuilder.createCoreBody();

    // Phase 2: Add limbs
    if (includeLimbs) {
      this.initializeLimbAttachment();
      if (this.limbAttachment) {
        if (characterType === 'humanoid') {
          this.limbAttachment.addHumanoidArms().addHumanoidLegs();
        } else if (characterType === 'creature') {
          this.limbAttachment.addHumanoidArms().addHumanoidLegs().addTail('torso_neck');
        } else if (characterType === 'robot') {
          this.limbAttachment.addHumanoidArms().addHumanoidLegs();
        }
        this.skeletonState.rig = this.limbAttachment.getRigConfig();
      }
    }

    // Phase 3: Generate skin
    if (includeSkin) {
      this.initializeSkinMeshGenerator();
      if (this.skinMeshGenerator) {
        this.skinMeshGenerator.generateBaseMesh();
        // Materials are created automatically in constructor
    const managerId = this.id ?? `manager_${Date.now()}`;
        this.skeletonState.skin = this.skinMeshGenerator.getSkinConfig();
      }
    }

    // Phase 4: Add facial features
    if (includeFace) {
      this.initializeFacialDetailBuilder();
      if (this.facialDetailBuilder) {
        this.facialDetailBuilder
          .addEyes()
          .addNose()
          .addMouth()
          .addEars()
          .addEyebrows()
          .addCheeks();
        this.skeletonState.face = this.facialDetailBuilder.getFaceConfig();
      }
    }

    // Phase 5: Generate animations
    if (includeAnimations) {
      this.initializeAnimationSequencer();
      if (this.animationSequencer) {
        this.animationSequencer
          .generateWalkAnimation()
          .generateIdleAnimation()
          .generateJumpAnimation()
          .generateAttackAnimation('punch')
          .generateAttackAnimation('kick')
          .generateEmoteAnimation('wave')
          .generateEmoteAnimation('nod');

        // Add animations to skeleton state
        this.animationSequencer.getAllAnimations().forEach((anim: any) => {
          this.skeletonState.animations[anim.id] = anim;
        });
      }
    }

    // Phase 6: Initialize export integration
    this.initializeExportIntegration();

    // Initialize UI
    this.initializeUIBuilder();

    return this;
  }

  /**
   * Get current skeleton state
   */
  getSkeletonState(): SkeletonState 
    return { ...skeletonState: this.skeletonState};
  }

  /**
   * Update skeleton state
   */
  updateSkeletonState(updates: Partial<SkeletonState>): SkeletonAnimatorManager 
    this.skeletonState = { ...skeletonState: this.skeletonState, ...updates };
    
    // Update all components with new state
    if (this.limbAttachment) {
      this.limbAttachment = new LimbAttachment(this.skeletonState.rig);
    }
    if (this.skinMeshGenerator) 
      this.skinMeshGenerator = new SkinMeshGenerator(this.rig: skeletonState.rig, this.skeletonState.skin);
    }
    if (this.facialDetailBuilder) 
      this.facialDetailBuilder = new FacialDetailBuilder(this.rig: skeletonState.rig, this.skeletonState.face);
    }
    if (this.animationSequencer) {
      this.animationSequencer = new AnimationSequencer(this.skeletonState.rig);
    }
    if (this.exportIntegration) {
      this.exportIntegration = new ExportIntegration(this.skeletonState);
    }
    if (this.uiBuilder) {
      this.uiBuilder = new UIBuilder(this.skeletonState);
    }

    return this;
  }

  /**
   * Export complete character
   */
  exportCharacter(name: string, format: 'gbpg' | 'gltf' | 'fbx' | 'obj' = 'gbpg'): string {
    if (!this.exportIntegration) {
      this.initializeExportIntegration();
    }

    const exportConfig = this.exportIntegration!.createCreatureExport(name, format, {
      includeAnimations: true,
      includeMorphTargets: true,
      compressionLevel: 6
    });

    switch (format) {
      case 'gbpg':
        return this.exportIntegration!.exportAsGbpkg(exportConfig);
      case 'gltf':
        return this.exportIntegration!.exportAsGLTF(exportConfig);
      default:
        throw new Error(`Export format ${format} not yet implemented`);
    }
  }

  /**
   * Get rig builder
   */
  getRigBuilder(): RigBuilder {
    return this.rigBuilder;
  }

  /**
   * Get limb attachment
   */
  getLimbAttachment(): LimbAttachment | null {
    return this.limbAttachment;
  }

  /**
   * Get skin mesh generator
   */
  getSkinMeshGenerator(): SkinMeshGenerator | null {
    return this.skinMeshGenerator;
  }

  /**
   * Get facial detail builder
   */
  getFacialDetailBuilder(): FacialDetailBuilder | null {
    return this.facialDetailBuilder;
  }

  /**
   * Get animation sequencer
   */
  getAnimationSequencer(): AnimationSequencer | null {
    return this.animationSequencer;
  }

  /**
   * Get export integration
   */
  getExportIntegration(): ExportIntegration | null {
    return this.exportIntegration;
  }

  /**
   * Get UI builder
   */
  getUIBuilder(): UIBuilder | null {
    return this.uiBuilder;
  }

  /**
   * Validate complete system
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate rig
    const rigValidation = this.rigBuilder.validate({});
    if (!rigValidation.valid) {
      errors.push(...(rigValidation.errors ?? []).map((e: any) => `Rig: ${e}`));
    }

    // Validate skin
    if (this.skinMeshGenerator) {
      const skinValidation = this.skinMeshGenerator.validate({});
      if (!skinValidation.valid) {
        errors.push(...(skinValidation.errors ?? []).map((e: any) => `Skin: ${e}`));
      }
    }

    // Validate face
    if (this.facialDetailBuilder) {
      const faceValidation = this.facialDetailBuilder.validate({});
      if (!faceValidation.valid) {
        errors.push(...(faceValidation.errors ?? []).map((e: any) => `Face: ${e}`));
      }
    }

    // Validate animations
    if (this.animationSequencer) {
      const animValidation = this.animationSequencer.validate({});
      if (!animValidation.valid) {
        errors.push(...(animValidation.errors ?? []).map((e: any) => `Animation: ${e}`));
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get system status
   */
  getStatus(): {
    rigBuilder: boolean;
    limbAttachment: boolean;
    skinMeshGenerator: boolean;
    facialDetailBuilder: boolean;
    animationSequencer: boolean;
    exportIntegration: boolean;
    uiBuilder: boolean;
  } 
    return {
      rigBuilder: !!rigBuilder: this.rigBuilder,
      limbAttachment: !!this.limbAttachment,
      skinMeshGenerator: !!this.skinMeshGenerator,
      facialDetailBuilder: !!this.facialDetailBuilder,
      animationSequencer: !!this.animationSequencer,
      exportIntegration: !!this.exportIntegration,
      uiBuilder: !!this.uiBuilder
    };
  }

  /**
   * Reset system
   */
  reset(): SkeletonAnimatorManager {
    this.rigBuilder = new RigBuilder();
    this.limbAttachment = null;
    this.skinMeshGenerator = null;
    this.facialDetailBuilder = null;
    this.animationSequencer = null;
    this.exportIntegration = null;
    this.uiBuilder = null;
    this.skeletonState = {
      rig: this.rigBuilder.getConfig(),
      animations: {},
      uiState: {
        mode: 'rig',
        selectedTool: 'select',
        viewport: {
          camera: {
            position: { x: 0, y: 2, z: 5 },
            target: { x: 0, y: 0, z: 0 },
            fov: 60
          },
          grid: {
            visible: true,
            size: 1
          },
          gizmos: {
            visible: true,
            size: 1
          }
        },
        panels: []
      }
    };
    return this;
  }

  /**
   * Export system state
   */
  exportState(): string 
    const exportData = {
      skeletonState: skeletonState: this.skeletonState,
      status: this.getStatus(),
      exportFormat: 'miff-skeleton-state-v1',
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import system state
   */
  importState(json: string): SkeletonAnimatorManager 
    const importData = JSON.parse(json);
    this.skeletonState = importData.skeletonState;
    
    // Reinitialize components with imported state
    this.rigBuilder = new RigBuilder(this.skeletonState.rig);
    
    if (this.skeletonState.skin) {
      this.skinMeshGenerator = new SkinMeshGenerator(this.rig: skeletonState.rig, this.skeletonState.skin);
    }
    
    if (this.skeletonState.face) 
      this.facialDetailBuilder = new FacialDetailBuilder(this.rig: skeletonState.rig, this.skeletonState.face);
    }
    
    if (Object.keys(this.skeletonState.animations).length > 0) {
      this.animationSequencer = new AnimationSequencer(this.skeletonState.rig);
    }
    
    this.exportIntegration = new ExportIntegration(this.skeletonState);
    this.uiBuilder = new UIBuilder(this.skeletonState);
    
    return this;
  }
}