/**
 * Phase 2: Limb Attachment
 * 
 * Adds arms, legs, tails, wings with jointed or rigid connections
 * Supports multiple limbs per axis and non-humanoid forms
 */

import { RigConfig, RigNode, LimbConfig, LimbSegment, Constraint, Transform } from './types';

export class LimbAttachment {
  private rigConfig: RigConfig;
  private limbs: Map<string, LimbConfig> = new Map();
  private nextId: number = 0;

  constructor(rigConfig: RigConfig) {
    this.rigConfig = rigConfig;
  }

  /**
   * Add a limb to the rig
   */
  addLimb(
    name: string,
    type: LimbConfig['type'],
    attachmentPointId: string,
    segments: Omit<LimbSegment, 'id' | 'parent' | 'children'>[],
    options: {
      symmetry?: string;
      constraints?: Omit<Constraint, 'id'>[];
      metadata?: Record<string, any>;
    } = {}
  ): LimbAttachment {
    const limbId = this.generateId();
    const limbConfig: LimbConfig = {
      id: limbId,
      name,
      type,
      segments: [],
      attachmentPoint: attachmentPointId,
      constraints: (options.constraints || []).map(c => ({ ...c, id: this.generateId() })),
      symmetry: options.symmetry,
      metadata: options.metadata || {}
    };

    // Create limb segments
    let parentSegmentId: string;
    segments.forEach((segmentData, index) => {
      const segmentId = this.generateId();
      const segment: LimbSegment = {
        ...segmentData,
        id: segmentId,
        parent: parentSegmentId,
        children: []
      };

      // Update parent's children list
      if (parentSegmentId) {
        const parentSegment = limbConfig.segments.find(s => s.id === parentSegmentId);
        if (parentSegment) {
          parentSegment.children.push(segmentId);
        }
      }

      limbConfig.segments.push(segment);
      parentSegmentId = segmentId;
    });

    this.limbs.set(limbId, limbConfig);

    // Create rig nodes for each segment
    this.createLimbNodes(limbConfig);

    return this;
  }

  /**
   * Add humanoid arms
   */
  addHumanoidArms(): LimbAttachment {
    // Left arm
    this.addLimb('Left Arm', 'arm', 'torso_left_shoulder', [
      {
        name: 'Upper Arm',
        length: 0.8,
        thickness: 0.15,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Forearm',
        length: 0.6,
        thickness: 0.12,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.4, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Hand',
        length: 0.2,
        thickness: 0.1,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: -0.3, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      constraints: [
        {
          type: 'ball',
          axis: { x: 0, y: 1, z: 0 },
          limits: { min: -90, max: 90 },
          stiffness: 1.0,
          damping: 0.1
        }
      ]
    });

    // Right arm (symmetric)
    this.addLimb('Right Arm', 'arm', 'torso_right_shoulder', [
      {
        name: 'Upper Arm',
        length: 0.8,
        thickness: 0.15,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Forearm',
        length: 0.6,
        thickness: 0.12,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.4, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Hand',
        length: 0.2,
        thickness: 0.1,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: -0.3, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      symmetry: 'left_arm',
      constraints: [
        {
          type: 'ball',
          axis: { x: 0, y: 1, z: 0 },
          limits: { min: -90, max: 90 },
          stiffness: 1.0,
          damping: 0.1
        }
      ]
    });

    return this;
  }

  /**
   * Add humanoid legs
   */
  addHumanoidLegs(): LimbAttachment {
    // Left leg
    this.addLimb('Left Leg', 'leg', 'torso_left_hip', [
      {
        name: 'Thigh',
        length: 0.9,
        thickness: 0.18,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Shin',
        length: 0.8,
        thickness: 0.15,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.45, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Foot',
        length: 0.3,
        thickness: 0.12,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.4, z: 0.1 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      constraints: [
        {
          type: 'ball',
          axis: { x: 0, y: 1, z: 0 },
          limits: { min: -45, max: 45 },
          stiffness: 1.0,
          damping: 0.1
        }
      ]
    });

    // Right leg (symmetric)
    this.addLimb('Right Leg', 'leg', 'torso_right_hip', [
      {
        name: 'Thigh',
        length: 0.9,
        thickness: 0.18,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Shin',
        length: 0.8,
        thickness: 0.15,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.45, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Foot',
        length: 0.3,
        thickness: 0.12,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: -0.4, z: 0.1 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      symmetry: 'left_leg',
      constraints: [
        {
          type: 'ball',
          axis: { x: 0, y: 1, z: 0 },
          limits: { min: -45, max: 45 },
          stiffness: 1.0,
          damping: 0.1
        }
      ]
    });

    return this;
  }

  /**
   * Add wings
   */
  addWings(attachmentPointId: string): LimbAttachment {
    // Left wing
    this.addLimb('Left Wing', 'wing', attachmentPointId, [
      {
        name: 'Wing Base',
        length: 0.3,
        thickness: 0.1,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Wing Segment 1',
        length: 0.8,
        thickness: 0.08,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: 0, z: 0.4 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Wing Segment 2',
        length: 0.6,
        thickness: 0.06,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: 0, z: 0.4 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      constraints: [
        {
          type: 'ball',
          axis: { x: 1, y: 0, z: 0 },
          limits: { min: -30, max: 30 },
          stiffness: 0.8,
          damping: 0.1
        }
      ]
    });

    // Right wing (symmetric)
    this.addLimb('Right Wing', 'wing', attachmentPointId, [
      {
        name: 'Wing Base',
        length: 0.3,
        thickness: 0.1,
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Wing Segment 1',
        length: 0.8,
        thickness: 0.08,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: 0, z: 0.4 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      },
      {
        name: 'Wing Segment 2',
        length: 0.6,
        thickness: 0.06,
        jointType: 'hinge',
        transform: {
          position: { x: 0, y: 0, z: 0.4 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      }
    ], {
      symmetry: 'left_wing',
      constraints: [
        {
          type: 'ball',
          axis: { x: 1, y: 0, z: 0 },
          limits: { min: -30, max: 30 },
          stiffness: 0.8,
          damping: 0.1
        }
      ]
    });

    return this;
  }

  /**
   * Add tail
   */
  addTail(attachmentPointId: string, segments: number = 5): LimbAttachment {
    const tailSegments: Omit<LimbSegment, 'id' | 'parent' | 'children'>[] = [];
    
    for (let i = 0; i < segments; i++) {
      tailSegments.push({
        name: `Tail Segment ${i + 1}`,
        length: 0.3 - (i * 0.05), // Decreasing length
        thickness: 0.1 - (i * 0.015), // Decreasing thickness
        jointType: 'ball',
        transform: {
          position: { x: 0, y: 0, z: i === 0 ? 0 : 0.15 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        metadata: {}
      });
    }

    this.addLimb('Tail', 'tail', attachmentPointId, tailSegments, {
      constraints: [
        {
          type: 'ball',
          axis: { x: 0, y: 1, z: 0 },
          limits: { min: -60, max: 60 },
          stiffness: 0.5,
          damping: 0.2
        }
      ]
    });

    return this;
  }

  /**
   * Create rig nodes for limb segments
   */
  private createLimbNodes(limbConfig: LimbConfig): void {
    const attachmentNode = this.rigConfig.nodes[limbConfig.attachmentPoint];
    if (!attachmentNode) {
      throw new Error(`Attachment point ${limbConfig.attachmentPoint} not found`);
    }

    limbConfig.segments.forEach((segment, index) => {
      const nodeId = `${limbConfig.id}_${segment.id}`;
      const node: RigNode = {
        id: nodeId,
        name: segment.name,
        type: 'limb',
        transform: segment.transform,
        parent: index === 0 ? limbConfig.attachmentPoint : `${limbConfig.id}_${limbConfig.segments[index - 1].id}`,
        children: segment.children.map(childId => `${limbConfig.id}_${childId}`),
        snapPoints: [],
        constraints: limbConfig.constraints,
        metadata: {
          limbId: limbConfig.id,
          segmentId: segment.id,
          limbType: limbConfig.type,
          ...segment.metadata
        }
      };

      this.rigConfig.nodes[nodeId] = node;

      // Update parent's children list
      if (node.parent && this.rigConfig.nodes[node.parent]) {
        this.rigConfig.nodes[node.parent].children.push(nodeId);
      }
    });
  }

  /**
   * Get limb by ID
   */
  getLimb(limbId: string): LimbConfig! {
    return this.limbs.get(limbId);
  }

  /**
   * Get all limbs
   */
  getAllLimbs(): LimbConfig[] {
    return Array.from(this.limbs.values());
  }

  /**
   * Get limbs by type
   */
  getLimbsByType(type: LimbConfig['type']): LimbConfig[] {
    return Array.from(this.limbs.values()).filter(limb => limb.type === type);
  }

  /**
   * Update limb segment transform
   */
  updateLimbSegmentTransform(limbId: string, segmentId: string, transform: Partial<Transform>): LimbAttachment {
    const limb = this.limbs.get(limbId);
    if (!limb) throw new Error(`Limb ${limbId} not found`);

    const segment = limb.segments.find(s => s.id === segmentId);
    if (!segment) throw new Error(`Segment ${segmentId} not found in limb ${limbId}`);

    if (transform.position) segment.transform.position = { ...segment.transform.position, ...transform.position };
    if (transform.rotation) segment.transform.rotation = { ...segment.transform.rotation, ...transform.rotation };
    if (transform.scale) segment.transform.scale = { ...segment.transform.scale, ...transform.scale };

    // Update corresponding rig node
    const nodeId = `${limbId}_${segmentId}`;
    if (this.rigConfig.nodes[nodeId]) {
      this.rigConfig.nodes[nodeId].transform = segment.transform;
    }

    return this;
  }

  /**
   * Delete limb
   */
  deleteLimb(limbId: string): LimbAttachment {
    const limb = this.limbs.get(limbId);
    if (!limb) throw new Error(`Limb ${limbId} not found`);

    // Delete all segment nodes
    limb.segments.forEach(segment => {
      const nodeId = `${limbId}_${segment.id}`;
      delete this.rigConfig.nodes[nodeId];
    });

    // Remove from parent's children list
    const attachmentNode = this.rigConfig.nodes[limb.attachmentPoint];
    if (attachmentNode) {
      attachmentNode.children = attachmentNode.children.filter(
        childId => !childId.startsWith(`${limbId}_`)
      );
    }

    this.limbs.delete(limbId);
    return this;
  }

  /**
   * Get updated rig configuration
   */
  getRigConfig(): RigConfig {
    return { ...this.rigConfig };
  }

  /**
   * Export limb data as JSON
   */
  exportLimbsJson(): string {
    const exportData = {
      limbs: Array.from(this.limbs.values()),
      exportFormat: 'miff-limbs-v1',
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  private generateId(): string {
    return `limb_${this.nextId++}_${Date.now()}`;
  }
}
