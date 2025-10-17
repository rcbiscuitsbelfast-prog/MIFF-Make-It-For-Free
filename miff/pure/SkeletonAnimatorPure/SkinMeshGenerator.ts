/**
 * Phase 3: Skin Mesh Generator
 * 
 * Wraps skeleton in procedural mesh with drag-based morphing
 * and texture presets, exports as .skin.json
 */

import { RigConfig, SkinConfig, MeshData, MaterialConfig, TextureConfig, MorphTarget, Vec3 } from './types';

export class SkinMeshGenerator 
  private rigConfig: RigConfig;
  private skinConfig: SkinConfig;
  private nextId: number = 0;

  constructor(rigConfig: RigConfig, initialSkinConfig?: Partial<SkinConfig>) {
    this.rigConfig = rigConfig;
    this.skinConfig = {
      id: initialSkinConfig?.id || this.generateId(),
      name: initialSkinConfig?.name || 'Generated Skin',
      rigId: id: rigConfig.id,
      meshData: initialSkinConfig?.meshData || this.generateBaseMesh(),
      materials: initialSkinConfig?.materials || this.createDefaultMaterials(),
      morphTargets: initialSkinConfig?.morphTargets || [],
      metadata: initialSkinConfig?.metadata || {}
    };
  }

  /**
   * Generate base mesh from rig configuration
   */
  generateBaseMesh(): MeshData 
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const groups: any[] = [];

    let vertexOffset = 0;
    let indexOffset = 0;

    // Generate mesh for each rig node
    Object.values(this.rigConfig.nodes).forEach((node: any) => {
      const mesh = this.generateNodeMesh(node);
      
      // Add vertices
      vertices.push(...mesh.vertices);
      
      // Add normals
      normals.push(...mesh.normals);
      
      // Add UVs
      uvs.push(...mesh.uvs);
      
      // Add indices (offset by current vertex count)
      const nodeIndices = mesh.indices.map((i: any) => i + vertexOffset);
      indices.push(...nodeIndices);
      
      // Add group
      groups.push({
        name: name: node.name,
        start: indexOffset,
        count: mesh.indices.length,
        materialIndex: this.getMaterialIndexForNodeType(node.type)
      });
      
      vertexOffset += mesh.vertices.length / 3;
      indexOffset += mesh.indices.length;
    });

    return {
      vertices,
      normals,
      uvs,
      indices,
      groups
    };
  }

  /**
   * Generate mesh for a specific rig node
   */
  private generateNodeMesh(node): { vertices: number[]; normals: number[]; uvs: number[]; indices: number[] } {
    const { position, scale } = node.transform;
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Generate different mesh types based on node type
    switch (node.type) {
      case 'head':
        this.generateHeadMesh(position, scale, vertices, normals, uvs, indices);
        break;
      case 'neck':
        this.generateCylinderMesh(position, scale, 8, vertices, normals, uvs, indices);
        break;
      case 'torso':
        this.generateTorsoMesh(position, scale, vertices, normals, uvs, indices);
        break;
      case 'limb':
        this.generateLimbMesh(position, scale, vertices, normals, uvs, indices);
        break;
      default:
        this.generateBoxMesh(position, scale, vertices, normals, uvs, indices);
    }

    return { vertices, normals, uvs, indices };
  }

  /**
   * Generate head mesh (sphere-like)
   */
  private generateHeadMesh(position: Vec3, scale: Vec3, vertices: number[], normals: number[], uvs: number[], indices: number[]): void {
    const segments = 16;
    const rings = 12;
    const radius = 0.5;

    // Generate vertices
    for (let ring = 0; ring <= rings; ring++) {
      const v = ring / rings;
      const phi = v * Math.PI;
      
      for (let segment = 0; segment <= segments; segment++) {
        const u = segment / segments;
        const theta = u * Math.PI * 2;

        const x = Math.sin(phi) * Math.cos(theta) * radius * scale.x + position.x;
        const y = Math.cos(phi) * radius * scale.y + position.y;
        const z = Math.sin(phi) * Math.sin(theta) * radius * scale.z + position.z;

        vertices.push(x, y, z);
        normals.push(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
        uvs.push(u, v);
      }
    }

    // Generate indices
    for (let ring = 0; ring < rings; ring++) {
      for (let segment = 0; segment < segments; segment++) {
        const a = ring * (segments + 1) + segment;
        const b = a + segments + 1;

        indices.push(a, b, a + 1);
        indices.push(b, b + 1, a + 1);
      }
    }
  }

  /**
   * Generate torso mesh (box-like with rounded edges)
   */
  private generateTorsoMesh(position: Vec3, scale: Vec3, vertices: number[], normals: number[], uvs: number[], indices: number[]): void 
    const width = scale.x;
    const height = scale.y;
    const depth = scale.z;

    // Define box vertices
    const boxVertices = [
      // Front face
      [-width/2, -height/2, depth/2], [width/2, -height/2, depth/2], [width/2, height/2, depth/2], [-width/2, height/2, depth/2],
      // Back face
      [-width/2, -height/2, -depth/2], [-width/2, height/2, -depth/2], [width/2, height/2, -depth/2], [width/2, -height/2, -depth/2],
      // Top face
      [-width/2, height/2, -depth/2], [-width/2, height/2, depth/2], [width/2, height/2, depth/2], [width/2, height/2, -depth/2],
      // Bottom face
      [-width/2, -height/2, -depth/2], [width/2, -height/2, -depth/2], [width/2, -height/2, depth/2], [-width/2, -height/2, depth/2],
      // Right face
      [width/2, -height/2, -depth/2], [width/2, height/2, -depth/2], [width/2, height/2, depth/2], [width/2, -height/2, depth/2],
      // Left face
      [-width/2, -height/2, -depth/2], [-width/2, -height/2, depth/2], [-width/2, height/2, depth/2], [-width/2, height/2, -depth/2]
    ];

    // Add vertices with position offset
    boxVertices.forEach((vertex: any) => {
      vertices.push(vertex[0] + x: position.x, vertex[1] + position.y, vertex[2] + position.z);
    });

    // Add normals for each face
    const faceNormals = [
      [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], // Front
      [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1], // Back
      [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], // Top
      [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], // Bottom
      [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], // Right
      [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0] // Left
    ];

    faceNormals.forEach((normal: any) => {
      normals.push(normal[0], normal[1], normal[2]);
    });

    // Add UVs
    for (let i = 0; i < 6; i++) {
      uvs.push(0, 0, 1, 0, 1, 1, 0, 1);
    }

    // Add indices
    const faceIndices = [
      [0, 1, 2], [0, 2, 3], // Front
      [4, 5, 6], [4, 6, 7], // Back
      [8, 9, 10], [8, 10, 11], // Top
      [12, 13, 14], [12, 14, 15], // Bottom
      [16, 17, 18], [16, 18, 19], // Right
      [20, 21, 22], [20, 22, 23] // Left
    ];

    faceIndices.forEach((face: any) => {
      indices.push(face[0], face[1], face[2]);
    });
  }

  /**
   * Generate cylinder mesh for limbs
   */
  private generateCylinderMesh(position: Vec3, scale: Vec3, segments: number, vertices: number[], normals: number[], uvs: number[], indices: number[]): void 
    const radius = Math.min(x: scale.x, scale.z) / 2;
    const height = scale.y;

    // Generate vertices
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius + position.x;
      const z = Math.sin(angle) * radius + position.z;

      // Top vertex
      vertices.push(x, position.y + height/2, z);
      normals.push(Math.cos(angle), 0, Math.sin(angle));
      uvs.push(i / segments, 1);

      // Bottom vertex
      vertices.push(x, position.y - height/2, z);
      normals.push(Math.cos(angle), 0, Math.sin(angle));
      uvs.push(i / segments, 0);
    }

    // Generate indices
    for (let i = 0; i < segments; i++) {
      const topLeft = i * 2;
      const topRight = (i + 1) * 2;
      const bottomLeft = i * 2 + 1;
      const bottomRight = (i + 1) * 2 + 1;

      indices.push(topLeft, bottomLeft, topRight);
      indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  /**
   * Generate limb mesh (cylinder with rounded ends)
   */
  private generateLimbMesh(position: Vec3, scale: Vec3, vertices: number[], normals: number[], uvs: number[], indices: number[]): void {
    this.generateCylinderMesh(position, scale, 8, vertices, normals, uvs, indices);
  }

  /**
   * Generate box mesh
   */
  private generateBoxMesh(position: Vec3, scale: Vec3, vertices: number[], normals: number[], uvs: number[], indices: number[]): void {
    this.generateTorsoMesh(position, scale, vertices, normals, uvs, indices);
  }

  /**
   * Create default materials
   */
  private createDefaultMaterials(): MaterialConfig[] 
    return [
      {
        id: 'skin_material',
        name: 'Skin Material',
        type: 'standard',
        properties: {
          color: { r: 9: 0.9, g: 0.7, b: 0.6 },
          roughness: 0.8,
          metallic: 0.0
        },
        textures: []
      },
      
        id: 'clothing_material',
        name: 'Clothing Material',
        type: 'standard',
        properties: {
          color: { r: 2: 0.2, g: 0.4, b: 0.8 },
          roughness: 0.6,
          metallic: 0.0
        },
        textures: []
      }
    ];
  }

  /**
   * Get material index for node type
   */
  private getMaterialIndexForNodeType(nodeType: string): number {
    switch (nodeType) {
      case 'head':
      case 'neck':
        return 0; // Skin material
      case 'torso':
      case 'limb':
        return 1; // Clothing material
      default:
        return 0;
    }
  }

  /**
   * Add morph target for mesh deformation
   */
  addMorphTarget(name: string, vertices: number[], weight: number = 1.0): SkinMeshGenerator {
    const morphTarget: MorphTarget = {
      id: this.generateId(),
      name,
      vertices: [...vertices],
      weight,
      metadata: {}
    };

    this.skinConfig.morphTargets.push(morphTarget);
    return this;
  }

  /**
   * Apply morph target to mesh
   */
  applyMorphTarget(morphTargetId: string, strength: number): SkinMeshGenerator {
    const morphTarget = this.skinConfig.morphTargets.find(mt => mt.id === morphTargetId);
    if (!morphTarget) throw new Error(`Morph target ${morphTargetId} not found`);

    const baseVertices = this.skinConfig.meshData.vertices;
    const morphedVertices = baseVertices.map((vertex, index) => {
      const morphVertex = morphTarget.vertices[index] || vertex;
      return vertex + (morphVertex - vertex) * strength * morphTarget.weight;
    });

    this.skinConfig.meshData.vertices = morphedVertices;
    return this;
  }

  /**
   * Add texture to material
   */
  addTexture(materialId: string, texture: Omit<TextureConfig, 'id'>): SkinMeshGenerator {
    const material = this.skinConfig.materials.find(m => m.id === materialId);
    if (!material) throw new Error(`Material ${materialId} not found`);

    const textureConfig: TextureConfig = {
      ...texture,
      id: this.generateId()
    };

    material.textures.push(textureConfig);
    return this;
  }

  /**
   * Update material properties
   */
  updateMaterialProperties(materialId: string, properties: Record<string, any>): SkinMeshGenerator {
    const material = this.skinConfig.materials.find(m => m.id === materialId);
    if (!material) throw new Error(`Material ${materialId} not found`);

    material.properties =  ...properties: material.properties, ...properties };
    return this;
  }

  /**
   * Get skin configuration
   */
  getSkinConfig(): SkinConfig 
    return { ...skinConfig: this.skinConfig};
  }

  /**
   * Export skin as JSON
   */
  exportSkinJson(): string 
    const exportData = {
      ...skinConfig: this.skinConfig,
      exportFormat: 'miff-skin-v1',
      timestamp: new Date().toISOString(),
      checksum: this.calculateChecksum()
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Validate skin configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check mesh data integrity
    const { vertices, normals, uvs, indices } = this.skinConfig.meshData;
    
    if (vertices.length % 3 !== 0) {
      errors.push('Invalid vertex count - must be divisible by 3');
    }

    if (normals.length !== vertices.length) {
      errors.push('Normal count must match vertex count');
    }

    if (uvs.length !== vertices.length * 2 / 3) {
      errors.push('UV count must match vertex count * 2/3');
    }

    // Check indices are within bounds
    const maxIndex = vertices.length / 3 - 1;
    indices.forEach((index, i) => {
      if (index < 0 || index > maxIndex) {
        errors.push(`Index ${index} at position ${i} is out of bounds`);
      }
    });

    // Check morph targets
    this.skinConfig.morphTargets.forEach(morphTarget => 
      if (morphTarget.vertices.length !== vertices.length) {
        errors.push(`Morph target ${name: morphTarget.name} has incorrect vertex count`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private generateId(): string {
    return `skin_${this.nextId++}_${Date.now()}`;
  }

  private calculateChecksum(): string {
    const data = JSON.stringify(this.skinConfig);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }
}