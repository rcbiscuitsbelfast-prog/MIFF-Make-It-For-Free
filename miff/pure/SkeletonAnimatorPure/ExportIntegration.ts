/**
 * Phase 6: Export + Integration
 * 
 * Bundles full creature as .gbpg
 * Integrates with RenderWorldPure, CombatCorePure, DialogueSystemPure
 * Ensures compatibility with StartMenuPure and SaveLoadModule
 */

import { 
  RigConfig, 
  SkinConfig, 
  FaceConfig, 
  AnimationConfig, 
  ExportConfig,
  SkeletonState,
  Keyframe
} from './types';

export class ExportIntegration {
  private skeletonState: SkeletonState;
  private nextId: number = 0;

  constructor(skeletonState: SkeletonState) {
    this.skeletonState = skeletonState;
  }

  /**
   * Create complete creature export
   */
  createCreatureExport(
    name: string,
    format: ExportConfig['format'] = 'gbpg',
    options: {
      includeAnimations?: boolean;
      includeMorphTargets?: boolean;
      compressionLevel?: number;
      metadata?: Record<string, any>;
    } = {}
  ): ExportConfig {
    const exportConfig: ExportConfig = {
      id: this.generateId(),
      name,
      format,
      rig: this.skeletonState.rig,
      skin: this.skeletonState.skin,
      face: this.skeletonState.face,
      animations: options.includeAnimations ? Object.values(this.skeletonState.animations) : [],
      metadata: {
        ...options.metadata,
        exportVersion: '1.0.0',
        timestamp: new Date().toISOString(),
        compressionLevel: options.compressionLevel || 6,
        includeMorphTargets: options.includeMorphTargets || false
      }
    };

    return exportConfig;
  }

  /**
   * Export as .gbpg format (MIFF Game Bundle Package)
   */
  exportAsGbpkg(exportConfig: ExportConfig): string {
    const gbpkgData = {
      format: 'gbpkg-v1',
      version: '1.0.0',
      metadata: exportConfig.metadata,
      content: {
        rig: this.serializeRig(exportConfig.rig),
        skin: exportConfig.skin ? this.serializeSkin(exportConfig.skin) : null,
        face: exportConfig.face ? this.serializeFace(exportConfig.face) : null,
        animations: exportConfig.animations.map(anim => this.serializeAnimation(anim)),
        integration: this.generateIntegrationData(exportConfig)
      },
      checksum: this.calculateChecksum(exportConfig)
    };

    return JSON.stringify(gbpkgData, null, 2);
  }

  /**
   * Export as GLTF format
   */
  exportAsGLTF(exportConfig: ExportConfig): string {
    const gltfData = {
      asset: {
        version: '2.0',
        generator: 'MIFF-SkeletonAnimatorPure'
      },
      scene: 0,
      scenes: [{
        nodes: [0]
      }],
      nodes: this.generateGLTFNodes(exportConfig),
      meshes: exportConfig.skin ? this.generateGLTFMeshes(exportConfig.skin) : [],
      materials: exportConfig.skin ? this.generateGLTFMaterials(exportConfig.skin) : [],
      animations: exportConfig.animations.map(anim => this.generateGLTFAnimation(anim)),
      skins: exportConfig.skin ? this.generateGLTFSkins(exportConfig) : [],
      extensionsUsed: ['MIFF_creature_data'],
      extensions: {
        MIFF_creature_data: this.generateMIFFExtensions(exportConfig)
      }
    };

    return JSON.stringify(gltfData, null, 2);
  }

  /**
   * Generate RenderWorldPure integration data
   */
  generateRenderWorldIntegration(exportConfig: ExportConfig): any {
    return {
      type: 'creature',
      id: exportConfig.id,
      name: exportConfig.name,
      components: {
        transform: {
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          scale: { x: 1, y: 1, z: 1 }
        },
        mesh: exportConfig.skin ? {
          geometry: 'creature_geometry',
          material: 'creature_material',
          morphTargets: exportConfig.skin.morphTargets.map(mt => ({
            name: mt.name,
            weight: mt.weight
          }))
        } : null,
        skeleton: {
          rig: exportConfig.rig.id,
          bones: this.generateBoneMapping(exportConfig.rig),
          animations: exportConfig.animations.map(anim => ({
            name: anim.name,
            type: anim.type,
            duration: anim.duration,
            loop: anim.loop
          }))
        },
        physics: {
          type: 'kinematic',
          shape: 'capsule',
          mass: 70, // kg
          friction: 0.7,
          restitution: 0.1
        }
      },
      systems: ['SkeletonAnimatorPure', 'RenderWorldPure', 'PhysicsSystemPure']
    };
  }

  /**
   * Generate CombatCorePure integration data
   */
  generateCombatCoreIntegration(exportConfig: ExportConfig): any {
    return {
      type: 'combat_creature',
      id: exportConfig.id,
      name: exportConfig.name,
      combat: {
        stats: {
          health: 100,
          stamina: 100,
          attack: 10,
          defense: 5,
          speed: 1.0
        },
        abilities: [
          {
            name: 'punch',
            type: 'melee',
            damage: 15,
            range: 1.0,
            cooldown: 1000,
            animation: 'Attack_punch'
          },
          {
            name: 'kick',
            type: 'melee',
            damage: 20,
            range: 1.2,
            cooldown: 1500,
            animation: 'Attack_kick'
          }
        ],
        hitboxes: this.generateHitboxes(exportConfig.rig),
        animations: {
          attack: exportConfig.animations.filter(anim => anim.type === 'attack'),
          hit: exportConfig.animations.filter(anim => anim.type === 'emote'),
          death: exportConfig.animations.filter(anim => anim.type === 'emote')
        }
      }
    };
  }

  /**
   * Generate DialogueSystemPure integration data
   */
  generateDialogueIntegration(exportConfig: ExportConfig): any {
    return {
      type: 'dialogue_creature',
      id: exportConfig.id,
      name: exportConfig.name,
      dialogue: {
        voice: {
          pitch: 1.0,
          speed: 1.0,
          volume: 1.0
        },
        expressions: {
          happy: 'Emote_wave',
          sad: 'Emote_nod',
          angry: 'Attack_punch',
          surprised: 'Emote_shake'
        },
        animations: {
          idle: 'Idle',
          talking: 'Emote_wave',
          listening: 'Idle'
        },
        morphTargets: exportConfig.face?.features.map(feature => ({
          name: feature.name,
          type: feature.type,
          morphTargets: feature.morphTargets
        })) || []
      }
    };
  }

  /**
   * Generate StartMenuPure integration data
   */
  generateStartMenuIntegration(exportConfig: ExportConfig): any {
    return {
      type: 'character_preset',
      id: exportConfig.id,
      name: exportConfig.name,
      preview: {
        thumbnail: `creatures/${exportConfig.id}/preview.png`,
        description: `Generated creature: ${exportConfig.name}`,
        tags: ['generated', 'custom', 'creature']
      },
      data: {
        rig: exportConfig.rig.id,
        skin: exportConfig.skin?.id,
        face: exportConfig.face?.id,
        animations: exportConfig.animations.map(anim => anim.id)
      },
      metadata: {
        created: new Date().toISOString(),
        version: '1.0.0',
        author: 'MIFF-SkeletonAnimatorPure'
      }
    };
  }

  /**
   * Generate SaveLoadModule integration data
   */
  generateSaveLoadIntegration(exportConfig: ExportConfig): any {
    return {
      type: 'creature_save',
      id: exportConfig.id,
      name: exportConfig.name,
      saveData: {
        rig: this.serializeRig(exportConfig.rig),
        skin: exportConfig.skin ? this.serializeSkin(exportConfig.skin) : null,
        face: exportConfig.face ? this.serializeFace(exportConfig.face) : null,
        animations: exportConfig.animations.map(anim => this.serializeAnimation(anim)),
        state: {
          currentAnimation: 'Idle',
          morphWeights: this.generateMorphWeights(exportConfig),
          transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            scale: { x: 1, y: 1, z: 1 }
          }
        }
      },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Serialize rig configuration
   */
  private serializeRig(rig: RigConfig): any {
    return {
      id: rig.id,
      name: rig.name,
      version: rig.version,
      nodes: Object.values(rig.nodes).map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        transform: node.transform,
        parent: node.parent,
        children: node.children,
        snapPoints: node.snapPoints,
        constraints: node.constraints,
        metadata: node.metadata
      })),
      rootNode: rig.rootNode,
      metadata: rig.metadata
    };
  }

  /**
   * Serialize skin configuration
   */
  private serializeSkin(skin: SkinConfig): any {
    return {
      id: skin.id,
      name: skin.name,
      rigId: skin.rigId,
      meshData: {
        vertices: skin.meshData.vertices,
        normals: skin.meshData.normals,
        uvs: skin.meshData.uvs,
        indices: skin.meshData.indices,
        groups: skin.meshData.groups
      },
      materials: skin.materials,
      morphTargets: skin.morphTargets,
      metadata: skin.metadata
    };
  }

  /**
   * Serialize face configuration
   */
  private serializeFace(face: FaceConfig): any {
    return {
      id: face.id,
      name: face.name,
      rigId: face.rigId,
      features: face.features.map(feature => ({
        id: feature.id,
        type: feature.type,
        position: feature.position,
        scale: feature.scale,
        rotation: feature.rotation,
        morphTargets: feature.morphTargets,
        symmetry: feature.symmetry,
        metadata: feature.metadata
      })),
      symmetry: face.symmetry,
      metadata: face.metadata
    };
  }

  /**
   * Serialize animation configuration
   */
  private serializeAnimation(anim: AnimationConfig): any {
    return {
      id: anim.id,
      name: anim.name,
      type: anim.type,
      duration: anim.duration,
      loop: anim.loop,
      keyframes: anim.keyframes,
      rigId: anim.rigId,
      metadata: anim.metadata
    };
  }

  /**
   * Generate integration data for all systems
   */
  private generateIntegrationData(exportConfig: ExportConfig): any {
    return {
      renderWorld: this.generateRenderWorldIntegration(exportConfig),
      combatCore: this.generateCombatCoreIntegration(exportConfig),
      dialogueSystem: this.generateDialogueIntegration(exportConfig),
      startMenu: this.generateStartMenuIntegration(exportConfig),
      saveLoad: this.generateSaveLoadIntegration(exportConfig)
    };
  }

  /**
   * Generate GLTF nodes
   */
  private generateGLTFNodes(exportConfig: ExportConfig): any[] {
    const nodes: any[] = [];
    
    // Root node
    nodes.push({
      name: exportConfig.name,
      mesh: exportConfig.skin ? 0 : undefined,
      children: Object.values(exportConfig.rig.nodes)
        .filter(node => !node.parent)
        .map(node => this.findNodeIndex(exportConfig.rig, node.id))
    });

    // Rig nodes
    Object.values(exportConfig.rig.nodes).forEach(node => {
      nodes.push({
        name: node.name,
        translation: [node.transform.position.x, node.transform.position.y, node.transform.position.z],
        rotation: [node.transform.rotation.x, node.transform.rotation.y, node.transform.rotation.z, node.transform.rotation.w],
        scale: [node.transform.scale.x, node.transform.scale.y, node.transform.scale.z],
        children: node.children.map(childId => this.findNodeIndex(exportConfig.rig, childId))
      });
    });

    return nodes;
  }

  /**
   * Generate GLTF meshes
   */
  private generateGLTFMeshes(skin: SkinConfig): any[] {
    return [{
      name: 'creature_mesh',
      primitives: [{
        attributes: {
          POSITION: 0,
          NORMAL: 1,
          TEXCOORD_0: 2
        },
        indices: 3,
        material: 0
      }]
    }];
  }

  /**
   * Generate GLTF materials
   */
  private generateGLTFMaterials(skin: SkinConfig): any[] {
    return skin.materials.map(material => ({
      name: material.name,
      pbrMetallicRoughness: {
        baseColorFactor: [
          material.properties.color?.r || 1,
          material.properties.color?.g || 1,
          material.properties.color?.b || 1,
          1
        ],
        metallicFactor: material.properties.metallic || 0,
        roughnessFactor: material.properties.roughness || 0.5
      }
    }));
  }

  /**
   * Generate GLTF animation
   */
  private generateGLTFAnimation(anim: AnimationConfig): any {
    const channels: any[] = [];
    const samplers: any[] = [];

    // Group keyframes by node
    const nodeKeyframes = new Map<string, Keyframe[]>();
    anim.keyframes.forEach((kf: Keyframe) => {
      if (!nodeKeyframes.has(kf.nodeId)) {
        nodeKeyframes.set(kf.nodeId, []);
      }
      nodeKeyframes.get(kf.nodeId)!.push(kf);
    });

    let samplerIndex = 0;
    nodeKeyframes.forEach((keyframes: Keyframe[], nodeId: string) => {
      const times = keyframes.map((kf: Keyframe) => Number(kf.time || 0) / 1000);
      const positions = keyframes.map((kf: Keyframe) => [
        Number((kf.transform as any)?.position?.x) || 0,
        Number((kf.transform as any)?.position?.y) || 0,
        Number((kf.transform as any)?.position?.z) || 0
      ]);
      const rotations = keyframes.map((kf: Keyframe) => [
        Number((kf.transform as any)?.rotation?.x) || 0,
        Number((kf.transform as any)?.rotation?.y) || 0,
        Number((kf.transform as any)?.rotation?.z) || 0,
        Number((kf.transform as any)?.rotation?.w) || 1
      ]);
      const scales = keyframes.map((kf: Keyframe) => [
        Number((kf.transform as any)?.scale?.x) || 1,
        Number((kf.transform as any)?.scale?.y) || 1,
        Number((kf.transform as any)?.scale?.z) || 1
      ]);

      // Position channel
      channels.push({
        sampler: samplerIndex,
        target: {
          node: this.findNodeIndex(this.skeletonState.rig, nodeId),
          path: 'translation'
        }
      });
      samplers.push({
        input: samplerIndex,
        output: samplerIndex + 1,
        interpolation: 'LINEAR'
      });
      samplerIndex += 2;

      // Rotation channel
      channels.push({
        sampler: samplerIndex,
        target: {
          node: this.findNodeIndex(this.skeletonState.rig, nodeId),
          path: 'rotation'
        }
      });
      samplers.push({
        input: samplerIndex,
        output: samplerIndex + 1,
        interpolation: 'LINEAR'
      });
      samplerIndex += 2;

      // Scale channel
      channels.push({
        sampler: samplerIndex,
        target: {
          node: this.findNodeIndex(this.skeletonState.rig, nodeId),
          path: 'scale'
        }
      });
      samplers.push({
        input: samplerIndex,
        output: samplerIndex + 1,
        interpolation: 'LINEAR'
      });
      samplerIndex += 2;
    });

    return {
      name: anim.name,
      channels,
      samplers
    };
  }

  /**
   * Generate GLTF skins
   */
  private generateGLTFSkins(exportConfig: ExportConfig): any[] {
    return [{
      name: 'creature_skin',
      joints: Object.values(exportConfig.rig.nodes).map(node => this.findNodeIndex(exportConfig.rig, node.id)),
      inverseBindMatrices: 0
    }];
  }

  /**
   * Generate MIFF-specific extensions
   */
  private generateMIFFExtensions(exportConfig: ExportConfig): any {
    return {
      creature: {
        rig: exportConfig.rig,
        face: exportConfig.face,
        morphTargets: exportConfig.skin?.morphTargets || [],
        animations: exportConfig.animations,
        integration: this.generateIntegrationData(exportConfig)
      }
    };
  }

  /**
   * Generate bone mapping for skeleton
   */
  private generateBoneMapping(rig: RigConfig): any {
    const mapping: any = {};
    Object.values(rig.nodes).forEach(node => {
      mapping[node.id] = {
        name: node.name,
        type: node.type,
        transform: node.transform,
        parent: node.parent,
        children: node.children
      };
    });
    return mapping;
  }

  /**
   * Generate hitboxes for combat
   */
  private generateHitboxes(rig: RigConfig): any[] {
    const hitboxes: any[] = [];
    
    Object.values(rig.nodes).forEach(node => {
      if (node.type === 'head' || node.type === 'torso' || node.metadata?.limbType) {
        hitboxes.push({
          nodeId: node.id,
          name: node.name,
          type: 'capsule',
          size: {
            x: node.transform.scale.x,
            y: node.transform.scale.y,
            z: node.transform.scale.z
          },
          offset: node.transform.position,
          damageMultiplier: node.type === 'head' ? 2.0 : 1.0
        });
      }
    });

    return hitboxes;
  }

  /**
   * Generate morph weights
   */
  private generateMorphWeights(exportConfig: ExportConfig): any {
    const weights: any = {};
    
    if (exportConfig.skin) {
      exportConfig.skin.morphTargets.forEach(mt => {
        weights[mt.name] = mt.weight;
      });
    }

    if (exportConfig.face) {
      exportConfig.face.features.forEach(feature => {
        feature.morphTargets.forEach(mt => {
          weights[`${feature.name}_${mt.name}`] = mt.weight;
        });
      });
    }

    return weights;
  }

  /**
   * Find node index in rig
   */
  private findNodeIndex(rig: RigConfig, nodeId: string): number {
    const nodeIds = Object.keys(rig.nodes);
    return nodeIds.indexOf(nodeId);
  }

  /**
   * Calculate checksum for validation
   */
  private calculateChecksum(exportConfig: ExportConfig): string {
    const data = JSON.stringify(exportConfig);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private generateId(): string {
    return `export_${this.nextId++}_${Date.now()}`;
  }
}