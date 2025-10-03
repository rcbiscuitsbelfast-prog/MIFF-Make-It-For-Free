/**
 * Phase 4: Facial Detail Builder
 * 
 * Adds sculptable features: nose, ears, eyes, mouth
 * Supports symmetry toggle and drag-based morphing
 * Serializes face config to .face.json
 */

import { RigConfig, FaceConfig, FaceFeature, MorphTarget, Vec3, Quaternion, Transform } from './types';

export class FacialDetailBuilder {
  private rigConfig: RigConfig;
  private faceConfig: FaceConfig;
  private nextId: number = 0;

  constructor(rigConfig: RigConfig, initialFaceConfig?: Partial<FaceConfig>) {
    this.rigConfig = rigConfig;
    this.faceConfig = {
      id: initialFaceConfig?.id || this.generateId(),
      name: initialFaceConfig?.name || 'Generated Face',
      rigId: rigConfig.id,
      features: initialFaceConfig?.features || [],
      symmetry: initialFaceConfig?.symmetry ?? true,
      metadata: initialFaceConfig?.metadata || {}
    };
  }

  /**
   * Add facial feature
   */
  addFeature(
    type: FaceFeature['type'],
    position: Vec3,
    scale: Vec3,
    rotation: Quaternion,
    options: {
      symmetry?: string;
      morphTargets?: Omit<MorphTarget, 'id'>[];
      metadata?: Record<string, any>;
    } = {}
  ): FacialDetailBuilder {
    const feature: FaceFeature = {
      id: this.generateId(),
      type,
      position: { ...position },
      scale: { ...scale },
      rotation: { ...rotation },
      morphTargets: options.morphTargets?.map(mt => ({ ...mt, id: this.generateId() })) || [],
      symmetry: options.symmetry,
      metadata: options.metadata || {}
    };

    this.faceConfig.features.push(feature);

    // If symmetry is enabled, create symmetric feature
    if (this.faceConfig.symmetry && !options.symmetry) {
      this.createSymmetricFeature(feature);
    }

    return this;
  }

  /**
   * Create symmetric feature
   */
  private createSymmetricFeature(originalFeature: FaceFeature): void {
    const symmetricFeature: FaceFeature = {
      ...originalFeature,
      id: this.generateId(),
      position: {
        x: -originalFeature.position.x,
        y: originalFeature.position.y,
        z: originalFeature.position.z
      },
      rotation: {
        x: originalFeature.rotation.x,
        y: -originalFeature.rotation.y,
        z: -originalFeature.rotation.z,
        w: originalFeature.rotation.w
      },
      symmetry: originalFeature.id,
      metadata: {
        ...originalFeature.metadata,
        symmetric: true
      }
    };

    this.faceConfig.features.push(symmetricFeature);
  }

  /**
   * Add eyes
   */
  addEyes(): FacialDetailBuilder {
    // Left eye
    this.addFeature('eye', { x: -0.15, y: 0.1, z: 0.25 }, { x: 0.08, y: 0.08, z: 0.08 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'blink',
          vertices: this.generateEyeBlinkMorph(),
          weight: 1.0,
          metadata: { type: 'blink' }
        },
        {
          name: 'squint',
          vertices: this.generateEyeSquintMorph(),
          weight: 1.0,
          metadata: { type: 'squint' }
        }
      ]
    });

    return this;
  }

  /**
   * Add nose
   */
  addNose(): FacialDetailBuilder {
    this.addFeature('nose', { x: 0, y: 0, z: 0.3 }, { x: 0.1, y: 0.15, z: 0.08 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'wide',
          vertices: this.generateNoseWideMorph(),
          weight: 1.0,
          metadata: { type: 'wide' }
        },
        {
          name: 'narrow',
          vertices: this.generateNoseNarrowMorph(),
          weight: 1.0,
          metadata: { type: 'narrow' }
        }
      ]
    });

    return this;
  }

  /**
   * Add mouth
   */
  addMouth(): FacialDetailBuilder {
    this.addFeature('mouth', { x: 0, y: -0.1, z: 0.25 }, { x: 0.12, y: 0.04, z: 0.04 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'smile',
          vertices: this.generateMouthSmileMorph(),
          weight: 1.0,
          metadata: { type: 'smile' }
        },
        {
          name: 'frown',
          vertices: this.generateMouthFrownMorph(),
          weight: 1.0,
          metadata: { type: 'frown' }
        },
        {
          name: 'open',
          vertices: this.generateMouthOpenMorph(),
          weight: 1.0,
          metadata: { type: 'open' }
        }
      ]
    });

    return this;
  }

  /**
   * Add ears
   */
  addEars(): FacialDetailBuilder {
    // Left ear
    this.addFeature('ear', { x: -0.2, y: 0, z: 0.1 }, { x: 0.08, y: 0.12, z: 0.04 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'pointed',
          vertices: this.generateEarPointedMorph(),
          weight: 1.0,
          metadata: { type: 'pointed' }
        },
        {
          name: 'rounded',
          vertices: this.generateEarRoundedMorph(),
          weight: 1.0,
          metadata: { type: 'rounded' }
        }
      ]
    });

    return this;
  }

  /**
   * Add eyebrows
   */
  addEyebrows(): FacialDetailBuilder {
    // Left eyebrow
    this.addFeature('brow', { x: -0.15, y: 0.2, z: 0.2 }, { x: 0.1, y: 0.02, z: 0.02 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'raised',
          vertices: this.generateBrowRaisedMorph(),
          weight: 1.0,
          metadata: { type: 'raised' }
        },
        {
          name: 'furrowed',
          vertices: this.generateBrowFurrowedMorph(),
          weight: 1.0,
          metadata: { type: 'furrowed' }
        }
      ]
    });

    return this;
  }

  /**
   * Add cheeks
   */
  addCheeks(): FacialDetailBuilder {
    // Left cheek
    this.addFeature('cheek', { x: -0.12, y: -0.05, z: 0.2 }, { x: 0.08, y: 0.08, z: 0.04 }, { x: 0, y: 0, z: 0, w: 1 }, {
      morphTargets: [
        {
          name: 'puffed',
          vertices: this.generateCheekPuffedMorph(),
          weight: 1.0,
          metadata: { type: 'puffed' }
        },
        {
          name: 'hollow',
          vertices: this.generateCheekHollowMorph(),
          weight: 1.0,
          metadata: { type: 'hollow' }
        }
      ]
    });

    return this;
  }

  /**
   * Update feature transform
   */
  updateFeatureTransform(featureId: string, transform: Partial<Transform>): FacialDetailBuilder {
    const feature = this.faceConfig.features.find(f => f.id === featureId);
    if (!feature) throw new Error(`Feature ${featureId} not found`);

    if (transform.position) feature.position = { ...feature.position, ...transform.position };
    if (transform.rotation) feature.rotation = { ...feature.rotation, ...transform.rotation };
    if (transform.scale) feature.scale = { ...feature.scale, ...transform.scale };

    // Update symmetric feature if it exists
    if (feature.symmetry) {
      const symmetricFeature = this.faceConfig.features.find(f => f.symmetry === featureId);
      if (symmetricFeature) {
        symmetricFeature.position = {
          x: -feature.position.x,
          y: feature.position.y,
          z: feature.position.z
        };
        symmetricFeature.rotation = {
          x: feature.rotation.x,
          y: -feature.rotation.y,
          z: -feature.rotation.z,
          w: feature.rotation.w
        };
        symmetricFeature.scale = { ...feature.scale };
      }
    }

    return this;
  }

  /**
   * Apply morph target to feature
   */
  applyFeatureMorph(featureId: string, morphTargetId: string, strength: number): FacialDetailBuilder {
    const feature = this.faceConfig.features.find(f => f.id === featureId);
    if (!feature) throw new Error(`Feature ${featureId} not found`);

    const morphTarget = feature.morphTargets.find(mt => mt.id === morphTargetId);
    if (!morphTarget) throw new Error(`Morph target ${morphTargetId} not found`);

    // Apply morph to feature vertices (simplified - in real implementation would affect actual mesh)
    // This is a placeholder for the actual morphing logic
    console.log(`Applying morph ${morphTarget.name} to feature ${feature.name} with strength ${strength}`);

    return this;
  }

  /**
   * Toggle symmetry
   */
  toggleSymmetry(enabled: boolean): FacialDetailBuilder {
    this.faceConfig.symmetry = enabled;

    if (enabled) {
      // Create symmetric features for existing asymmetric features
      const asymmetricFeatures = this.faceConfig.features.filter(f => !f.symmetry);
      asymmetricFeatures.forEach(feature => {
        if (!this.faceConfig.features.some(f => f.symmetry === feature.id)) {
          this.createSymmetricFeature(feature);
        }
      });
    } else {
      // Remove symmetric features
      this.faceConfig.features = this.faceConfig.features.filter(f => !f.symmetry);
    }

    return this;
  }

  /**
   * Get feature by ID
   */
  getFeature(featureId: string): FaceFeature | undefined {
    return this.faceConfig.features.find(f => f.id === featureId);
  }

  /**
   * Get features by type
   */
  getFeaturesByType(type: FaceFeature['type']): FaceFeature[] {
    return this.faceConfig.features.filter(f => f.type === type);
  }

  /**
   * Delete feature
   */
  deleteFeature(featureId: string): FacialDetailBuilder {
    const feature = this.faceConfig.features.find(f => f.id === featureId);
    if (!feature) throw new Error(`Feature ${featureId} not found`);

    // Remove the feature
    this.faceConfig.features = this.faceConfig.features.filter(f => f.id !== featureId);

    // Remove symmetric feature if it exists
    if (feature.symmetry) {
      this.faceConfig.features = this.faceConfig.features.filter(f => f.symmetry !== featureId);
    }

    return this;
  }

  /**
   * Get face configuration
   */
  getFaceConfig(): FaceConfig {
    return { ...this.faceConfig };
  }

  /**
   * Export face as JSON
   */
  exportFaceJson(): string {
    const exportData = {
      ...this.faceConfig,
      exportFormat: 'miff-face-v1',
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Validate face configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate features
    const featureIds = this.faceConfig.features.map(f => f.id);
    const uniqueIds = new Set(featureIds);
    if (featureIds.length !== uniqueIds.size) {
      errors.push('Duplicate feature IDs found');
    }

    // Check symmetry consistency
    if (this.faceConfig.symmetry) {
      const asymmetricFeatures = this.faceConfig.features.filter(f => !f.symmetry);
      const symmetricFeatures = this.faceConfig.features.filter(f => f.symmetry);
      
      // Each asymmetric feature should have a symmetric counterpart
      asymmetricFeatures.forEach(feature => {
        if (!symmetricFeatures.some(sf => sf.symmetry === feature.id)) {
          errors.push(`Feature ${feature.name} is missing its symmetric counterpart`);
        }
      });
    }

    // Check morph targets
    this.faceConfig.features.forEach(feature => {
      feature.morphTargets.forEach(morphTarget => {
        if (morphTarget.vertices.length === 0) {
          errors.push(`Morph target ${morphTarget.name} in feature ${feature.name} has no vertices`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Morph target generators (simplified placeholders)
  private generateEyeBlinkMorph(): number[] {
    return Array(24).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateEyeSquintMorph(): number[] {
    return Array(24).fill(0).map(() => Math.random() * 0.08 - 0.04);
  }

  private generateNoseWideMorph(): number[] {
    return Array(36).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateNoseNarrowMorph(): number[] {
    return Array(36).fill(0).map(() => Math.random() * 0.08 - 0.04);
  }

  private generateMouthSmileMorph(): number[] {
    return Array(48).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateMouthFrownMorph(): number[] {
    return Array(48).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateMouthOpenMorph(): number[] {
    return Array(48).fill(0).map(() => Math.random() * 0.15 - 0.075);
  }

  private generateEarPointedMorph(): number[] {
    return Array(60).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateEarRoundedMorph(): number[] {
    return Array(60).fill(0).map(() => Math.random() * 0.08 - 0.04);
  }

  private generateBrowRaisedMorph(): number[] {
    return Array(24).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateBrowFurrowedMorph(): number[] {
    return Array(24).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateCheekPuffedMorph(): number[] {
    return Array(36).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateCheekHollowMorph(): number[] {
    return Array(36).fill(0).map(() => Math.random() * 0.1 - 0.05);
  }

  private generateId(): string {
    return `face_${this.nextId++}_${Date.now()}`;
  }

  private calculateChecksum(): string {
    const data = JSON.stringify(this.faceConfig);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}