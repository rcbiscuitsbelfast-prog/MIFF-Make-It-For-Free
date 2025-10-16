/**
 * Phase 1: Rig Builder
 * 
 * Creates core body primitives (head, neck, torso) as draggable 3D shapes
 * with snap points for limbs and serializes to .rig.json
 */

import { RigConfig, RigNode, SnapPoint, Constraint, Vec3, Quaternion, Transform } from './types';

export class RigBuilder {
  private config: RigConfig;
  private nextId: number = 0;

  constructor(initialConfig?: Partial<RigConfig>) {
    this.config = {
      id: initialConfig?.id || this.generateId(),
      name: initialConfig?.name || 'New Rig',
      version: '1.0.0',
      nodes: {},
      rootNode: '',
      metadata: initialConfig?.metadata || {}
    };
  }

  /**
   * Create core body primitives
   */
  createCoreBody(): RigBuilder {
    // Create torso as root node
    const torso = this.createNode('torso', 'Torso', 'torso', {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 1, y: 1.5, z: 0.8 }
    });

    // Add snap points for limbs
    this.addSnapPoints(torso.id, [
      { position: { x: -0.6, y: 0.3, z: 0 }, normal: { x: -1, y: 0, z: 0 }, type: 'attachment', radius: 0.1, metadata: {} }, // Left shoulder
      { position: { x: 0.6, y: 0.3, z: 0 }, normal: { x: 1, y: 0, z: 0 }, type: 'attachment', radius: 0.1, metadata: {} },  // Right shoulder
      { position: { x: -0.3, y: -0.7, z: 0 }, normal: { x: 0, y: -1, z: 0 }, type: 'attachment', radius: 0.1, metadata: {} }, // Left hip
      { position: { x: 0.3, y: -0.7, z: 0 }, normal: { x: 0, y: -1, z: 0 }, type: 'attachment', radius: 0.1, metadata: {} },  // Right hip
      { position: { x: 0, y: 0.8, z: 0 }, normal: { x: 0, y: 1, z: 0 }, type: 'attachment', radius: 0.1, metadata: {} }       // Neck
    ]);

    // Create neck
    const neck = this.createNode('neck', 'Neck', 'neck', {
      position: { x: 0, y: 0.8, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 0.3, y: 0.4, z: 0.3 }
    }, torso.id);

    // Create head
    const head = this.createNode('head', 'Head', 'head', {
      position: { x: 0, y: 0.6, z: 0 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      scale: { x: 0.6, y: 0.6, z: 0.6 }
    }, neck.id);

    // Add snap points for facial features
    this.addSnapPoints(head.id, [
      { position: { x: 0, y: 0, z: 0.3 }, normal: { x: 0, y: 0, z: 1 }, type: 'attachment', radius: 0.05, metadata: {} }, // Face front
      { position: { x: -0.2, y: 0.1, z: 0.3 }, normal: { x: 0, y: 0, z: 1 }, type: 'attachment', radius: 0.05, metadata: {} }, // Left eye
      { position: { x: 0.2, y: 0.1, z: 0.3 }, normal: { x: 0, y: 0, z: 1 }, type: 'attachment', radius: 0.05, metadata: {} }, // Right eye
      { position: { x: 0, y: -0.1, z: 0.3 }, normal: { x: 0, y: 0, z: 1 }, type: 'attachment', radius: 0.05, metadata: {} }  // Mouth
    ]);

    this.config.rootNode = torso.id;
    return this;
  }

  /**
   * Create a new rig node
   */
  createNode(id: string, name: string, type: RigNode['type'], transform: Transform, parentId?: string): RigNode {
    const node: RigNode = {
      id,
      name,
      type,
      transform,
      parent: parentId,
      children: [],
      snapPoints: [],
      constraints: [],
      metadata: {}
    };

    this.config.nodes[id!] = node;

    // Update parent's children list
    if (parentId && this.config.nodes[parentId!]) {
      this.config.nodes[parentId!].children.push(id);
    }

    return node;
  }

  /**
   * Add snap points to a node
   */
  addSnapPoints(nodeId: string, snapPoints: Omit<SnapPoint, 'id'>[]): RigBuilder {
    const node = this.config.nodes[nodeId!];
    if (!node) throw new Error(`Node ${nodeId} not found`);

    snapPoints.forEach(snapPoint => {
      const newSnapPoint: SnapPoint = {
        ...snapPoint,
        id: this.generateId(),
        radius: snapPoint.radius || 0.1,
        metadata: snapPoint.metadata || {}
      };
      node.snapPoints.push(newSnapPoint);
    });

    return this;
  }

  /**
   * Add constraints to a node
   */
  addConstraints(nodeId: string, constraints: Omit<Constraint, 'id'>[]): RigBuilder {
    const node = this.config.nodes[nodeId!];
    if (!node) throw new Error(`Node ${nodeId} not found`);

    constraints.forEach((constraint: any) => {
      const newConstraint: Constraint = {
        ...constraint,
        id: this.generateId(),
        stiffness: constraint.stiffness || 1.0,
        damping: constraint.damping || 0.1
      };
      node.constraints.push(newConstraint);
    });

    return this;
  }

  /**
   * Update node transform
   */
  updateNodeTransform(nodeId: string, transform: Partial<Transform>): RigBuilder {
    const node = this.config.nodes[nodeId!];
    if (!node) throw new Error(`Node ${nodeId} not found`);

    if (transform.position) node.transform.position = { ...node.transform.position, ...transform.position };
    if (transform.rotation) node.transform.rotation = { ...node.transform.rotation, ...transform.rotation };
    if (transform.scale) node.transform.scale = { ...node.transform.scale, ...transform.scale };

    return this;
  }

  /**
   * Delete a node and all its children
   */
  deleteNode(nodeId: string): RigBuilder {
    const node = this.config.nodes[nodeId!];
    if (!node) throw new Error(`Node ${nodeId} not found`);

    // Delete all children first
    node.children.forEach(childId => this.deleteNode(childId));

    // Remove from parent's children list
    if (node.parent && this.config.nodes[node.parent]) {
      const parent = this.config.nodes[node.parent];
      parent.children = parent.children.filter((id: any) => id !== nodeId);
    }

    // Delete the node
    delete this.config.nodes[nodeId!];

    // Update root node if necessary
    if (this.config.rootNode === nodeId) {
      this.config.rootNode = Object.keys(this.config.nodes)[0] || '';
    }

    return this;
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): RigNode | undefined {
    return this.config.nodes[nodeId!];
  }

  /**
   * Get all nodes
   */
  getAllNodes(): RigNode[] {
    return Object.values(this.config.nodes);
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: RigNode['type']): RigNode[] {
    return Object.values(this.config.nodes).filter((node: any) => node.type === type);
  }

  /**
   * Serialize rig to JSON
   */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Load rig from JSON
   */
  static fromJSON(json: string): RigBuilder {
    const config = JSON.parse(json) as RigConfig;
    return new RigBuilder(config);
  }

  /**
   * Export as .rig.json format
   */
  exportRigJson(): string {
    const exportData = {
      ...this.config,
      exportFormat: 'miff-rig-v1',
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Get current configuration
   */
  getConfig(): RigConfig {
    return { ...this.config };
  }

  /**
   * Validate rig configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if root node exists
    if (!this.config.rootNode! || !this.config.nodes[this.config.rootNode]) {
      errors.push('Root node not found');
    }

    // Check for orphaned nodes
    const allNodeIds = new Set(Object.keys(this.config.nodes));
    const referencedNodeIds = new Set<string>();

    Object.values(this.config.nodes).forEach((node: any) => {
      if (node.parent) referencedNodeIds.add(node.parent);
      node.children.forEach(childId => referencedNodeIds.add(childId));
    });

    allNodeIds.forEach(nodeId => {
      if (nodeId !== this.config.rootNode && !referencedNodeIds.has(nodeId)) {
        errors.push(`Orphaned node: ${nodeId}`);
      }
    });

    // Check for circular references
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (visiting.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visiting.add(nodeId);
      const node = this.config.nodes[nodeId!];
      if (node) {
        for (const childId of node.children) {
          if (hasCycle(childId)) return true;
        }
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
      return false;
    };

    if (hasCycle(this.config.rootNode)) {
      errors.push('Circular reference detected in node hierarchy');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private generateId(): string {
    return `node_${this.nextId++}_${Date.now()}`;
  }

  private calculateChecksum(): string {
    // Simple checksum for validation
    const data = JSON.stringify(this.config);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}