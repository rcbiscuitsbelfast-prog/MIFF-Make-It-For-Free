import {
  AvatarManifest,
  AvatarStyle,
  ResolvedAvatar,
  isAvatarManifest,
  AvatarComponent,
  AvatarCustomization,
  AvatarRenderData,
  AvatarAnimationState,
  AvatarOptimizations,
  AvatarAnimation,
  AvatarMaterial,
  AvatarTexture,
  AvatarMesh
} from './schema';

export interface AssetRegistryRecord {
  id: string;
  remixSafety: 'CC0' | 'restricted' | string;
  compatibility: Array<'web' | 'godot' | 'unity'>;
  anchors: Record<string, string>; // anchorId -> asset URL
  generationHints?: Record<string, unknown>;
}

export interface AvatarRegistry {
  version: string;
  items: AssetRegistryRecord[];
}

export interface ResolveOptions {
  registry: AvatarRegistry;
  style: AvatarStyle;
}

export class AvatarSystemPure {
  private static readonly SUPPORTED_STYLES: AvatarStyle[] = [
    '3d', '2d-side', 'overlay', 'pixel-art', 'voxel', 'skeletal'
  ];

  private static readonly ANIMATION_STATES = [
    'idle', 'walk', 'run', 'attack', 'defend', 'cast', 'death', 'victory'
  ];

  private static readonly COMPONENT_KINDS = [
    'head', 'torso', 'legs', 'boots', 'shirt', 'cloak', 'hat',
    'accessory', 'weapon', 'shield', 'hair', 'eyes', 'mouth'
  ];

  public static validate(manifest: unknown): { ok: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!isAvatarManifest(manifest)) {
      return { ok: false, errors: ['Not an AvatarManifest'] };
    }

    // Validate style
    if (!AvatarSystemPure?.SUPPORTED_STYLES.includes(manifest?.style)) {
      errors?.push(`Unsupported style: ${manifest?.style}. Supported: ${AvatarSystemPure?.SUPPORTED_STYLES.join(', ')}`);
    }

    // Validate clothing array
    if (!Array.isArray(manifest.clothing)) {
      errors?.push('clothing must be an array');
    }

    // Validate base
    if (!manifest?.base || typeof manifest?.base !== 'string') {
      errors?.push('base must be a non-empty string');
    }

    // Validate face
    if (!manifest?.face || typeof manifest?.face !== 'string') {
      errors?.push('face must be a non-empty string');
    }

    // Validate customization if present
    if (manifest?.customization) {
      const customErrors = AvatarSystemPure?.validateCustomization(manifest?.customization);
      errors?.push(...customErrors);
    }

    // Validate animation if present
    if (manifest?.animation) {
      const animErrors = AvatarSystemPure?.validateAnimation(manifest?.animation);
      errors?.push(...animErrors);
    }

    // Validate performance options
    if (manifest?.performance) {
      if (manifest?.performance.polyCount && manifest?.performance.polyCount < 0) {
        errors?.push('polyCount must be non-negative');
      }
      if (manifest?.performance.lodLevels && manifest?.performance.lodLevels < 1) {
        errors?.push('lodLevels must be at least 1');
      }
    }

    return { ok: errors?.length === 0, errors };
  }

  private static validateCustomization(customization: AvatarCustomization): string[] {
    const errors: string[] = [];

    if (customization?.skinTone && !/^[a-f0-9]{6}$/i?.test(customization?.skinTone)) {
      errors?.push('skinTone must be a valid hex color');
    }

    if (customization?.hairColor && !/^[a-f0-9]{6}$/i?.test(customization?.hairColor)) {
      errors?.push('hairColor must be a valid hex color');
    }

    if (customization?.eyeColor && !/^[a-f0-9]{6}$/i?.test(customization?.eyeColor)) {
      errors?.push('eyeColor must be a valid hex color');
    }

    if (customization?.bodyScale && (customization?.bodyScale <= 0 || customization?.bodyScale > 2)) {
      errors?.push('bodyScale must be between 0 and 2');
    }

    if (customization?.height && customization?.height <= 0) {
      errors?.push('height must be positive');
    }

    return errors;
  }

  private static validateAnimation(animation: AvatarAnimation): string[] {
    const errors: string[] = [];

    for (const state of AvatarSystemPure?.ANIMATION_STATES) {
      if (animation[state as keyof AvatarAnimation] && typeof animation[state as keyof AvatarAnimation] !== 'string') {
        errors?.push(`${state} animation must be a string URL`);
      }
    }

    if (animation?.emote) {
      for (const [key, value] of Object.entries(animation.emote)) {
        if (typeof value !== 'string') {
          errors?.push(`emote.${key} must be a string URL`);
        }
      }
    }

    if (animation?.parameters) {
      for (const [key, value] of Object.entries(animation.parameters)) {
        if (typeof value !== 'number') {
          errors?.push(`animation parameter ${key} must be a number`);
        }
      }
    }

    return errors;
  }

  public static validateComponent(component: AvatarComponent): { ok: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!AvatarSystemPure?.COMPONENT_KINDS.includes(component?.kind)) {
      errors?.push(`Invalid component kind: ${component?.kind}`);
    }

    if (!component?.id || typeof component?.id !== 'string') {
      errors?.push('Component id must be a non-empty string');
    }

    if (component?.variant && typeof component?.variant !== 'string') {
      errors?.push('Component variant must be a string');
    }

    if (component?.color && !/^[a-f0-9]{6}$/i?.test(component?.color)) {
      errors?.push('Component color must be a valid hex color');
    }

    if (component?.animation) {
      const animErrors = AvatarSystemPure?.validateAnimation(component?.animation);
      errors?.push(...animErrors?.map((e: any) => `animation: ${e}`));
    }

    return { ok: errors?.length === 0, errors };
  }

  public static translateStyle(manifest: AvatarManifest, to: AvatarStyle): AvatarManifest {
    return { ...manifest, style: to };
  }

  public static resolve(manifest: AvatarManifest, opts: ResolveOptions): ResolvedAvatar {
    const components = AvatarSystemPure?.toComponents(manifest);
    const entries: Array<{ anchor: string; url: string; meta?: Record<string, unknown> }> = [];

    for (const comp of components) {
      const anchor = AvatarSystemPure?.anchorFor(comp);
      const url = AvatarSystemPure?.findAssetURL(anchor, opts?.registry, opts?.style);
      entries?.push({
        anchor,
        url,
        meta: {
          component: comp?.id,
          variant: comp?.variant,
          color: comp?.color,
          material: comp?.material,
          animation: comp?.animation
        }
      });
    }

    // Generate render data
    const renderData = AvatarSystemPure?.generateRenderData(manifest, components, opts?.style);

    // Generate animation state
    const animationState = AvatarSystemPure?.generateAnimationState(manifest);

    // Generate optimizations
    const optimizations = AvatarSystemPure?.generateOptimizations(manifest, opts?.registry);

    return {
      manifest,
      components,
      assets: { style: opts?.style, entries },
      renderData,
      animationState,
      optimizations
    };
  }

  private static generateRenderData(
    manifest: AvatarManifest,
    components: AvatarComponent[],
    style: AvatarStyle
  ): AvatarRenderData {
    const bounds = AvatarSystemPure?.calculateBounds(components, style);
    const materials = AvatarSystemPure?.generateMaterials(manifest, components);
    const textures = AvatarSystemPure?.generateTextures(manifest, components);
    const meshes = AvatarSystemPure?.generateMeshes(components, style);

    return {
      bounds,
      materials,
      textures,
      meshes,
      lodDistances: AvatarSystemPure?.generateLODDistances(manifest)
    };
  }

  private static calculateBounds(components: AvatarComponent[], style: AvatarStyle): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } {
    // Simplified bounds calculation - in real implementation would be more sophisticated
    const baseBounds = {
      min: { x: -0.5, y: 0, z: -0.5 },
      max: { x: 0.5, y: 1.8, z: 0.5 }
    };

    // Adjust based on style
    switch (style) {
      case '3d':
        return { ...baseBounds, min: { ...baseBounds?.min, y: -0.2 }, max: { ...baseBounds?.max, y: 2.0 } };
      case '2d-side':
        return { ...baseBounds, min: { ...baseBounds?.min, z: 0 }, max: { ...baseBounds?.max, z: 0 } };
      case 'pixel-art':
        return { ...baseBounds, min: { ...baseBounds?.min, x: -0.4, z: -0.4 }, max: { ...baseBounds?.max, x: 0.4, z: 0.4 } };
      case 'voxel':
        return { ...baseBounds, min: { ...baseBounds?.min, x: -0.3, z: -0.3 }, max: { ...baseBounds?.max, x: 0.3, z: 0.3 } };
      default:
        return baseBounds;
    }
  }

  private static generateMaterials(manifest: AvatarManifest, components: AvatarComponent[]): AvatarMaterial[] {
    const materials: AvatarMaterial[] = [];

    // Base material
    materials?.push({
      id: 'body',
      name: 'Body Material',
      diffuse: `avatars/${manifest?.base}/body_diffuse?.png`,
      normal: `avatars/${manifest?.base}/body_normal?.png`,
      specular: `avatars/${manifest?.base}/body_specular?.png`,
      metallic: 0.0,
      roughness: 0.8,
      opacity: 1.0
    });

    // Clothing materials
    for (const clothing of manifest?.clothing) {
      materials?.push({
        id: `clothing_${clothing}`,
        name: `${clothing} Material`,
        diffuse: `avatars/clothing/${clothing}_diffuse?.png`,
        normal: `avatars/clothing/${clothing}_normal?.png`,
        metallic: 0.0,
        roughness: 0.9,
        opacity: 1.0
      });
    }

    // Face material
    materials?.push({
      id: 'face',
      name: 'Face Material',
      diffuse: `avatars/faces/${manifest?.face}_diffuse?.png`,
      normal: `avatars/faces/${manifest?.face}_normal?.png`,
      metallic: 0.0,
      roughness: 0.6,
      opacity: 1.0
    });

    return materials;
  }

  private static generateTextures(manifest: AvatarManifest, components: AvatarComponent[]): AvatarTexture[] {
    const textures: AvatarTexture[] = [];

    // Body texture
    textures?.push({
      id: 'body_diffuse',
      url: `avatars/${manifest?.base}/body_diffuse?.png`,
      type: 'diffuse',
      size: { width: 512, height: 512 },
      format: 'png',
      compressed: false
    });

    // Clothing textures
    for (const clothing of manifest?.clothing) {
      textures?.push({
        id: `clothing_${clothing}_diffuse`,
        url: `avatars/clothing/${clothing}_diffuse?.png`,
        type: 'diffuse',
        size: { width: 256, height: 256 },
        format: 'png',
        compressed: false
      });
    }

    return textures;
  }

  private static generateMeshes(components: AvatarComponent[], style: AvatarStyle): AvatarMesh[] {
    const meshes: AvatarMesh[] = [];

    // Base mesh
    meshes?.push({
      id: 'body',
      vertices: style === '3d' ? 1024 : 256,
      triangles: style === '3d' ? 2048 : 512,
      uvs: 2,
      bones: style === 'skeletal' ? 24 : undefined,
      blendShapes: ['smile', 'angry', 'surprised']
    });

    // Clothing meshes
    for (const clothing of components?.filter((c: any) => c?.kind === 'shirt' || c?.kind === 'cloak')) {
      meshes?.push({
        id: `clothing_${clothing?.id}`,
        vertices: 512,
        triangles: 1024,
        uvs: 2
      });
    }

    return meshes;
  }

  private static generateLODDistances(manifest: AvatarManifest): number[] {
    const lodLevels = manifest?.performance?.lodLevels || 3;
    const baseDistance = 10;

    const distances: number[] = [];
    for (let i = 0; i < lodLevels; i++) {
      distances.push(baseDistance * Math.pow(2, i));
    }

    return distances;
  }

  private static generateAnimationState(manifest: AvatarManifest): AvatarAnimationState {
    return {
      currentAnimation: 'idle',
      time: 0,
      speed: 1.0,
      loop: true,
      transitions: [
        {
          from: 'idle',
          to: 'walk',
          duration: 0.3,
          conditions: { speed: { gt: 0.1 } }
        },
        {
          from: 'walk',
          to: 'run',
          duration: 0.2,
          conditions: { speed: { gt: 2.0 } }
        }
      ],
      parameters: {
        speed: 0,
        health: 1.0,
        stamina: 1.0,
        emotion: 0.5
      },
      events: []
    };
  }

  private static generateOptimizations(manifest: AvatarManifest, registry: AvatarRegistry): AvatarOptimizations {
    return {
      instancing: manifest?.performance?.gpuInstancing ?? true,
      culling: true,
      lod: (manifest?.performance?.lodLevels ?? 1) > 1,
      compression: true,
      streaming: manifest?.performance?.textureSize === 'high',
      gpuSkinning: manifest?.style === 'skeletal',
      textureAtlas: true
    };
  }

  public static toComponents(manifest: AvatarManifest): AvatarComponent[] {
    const components: AvatarComponent[] = [];

    // Base components
    components?.push(
      {
        kind: 'head',
        id: `${manifest?.base}_head`,
        variant: 'default',
        metadata: { base: true, required: true }
      },
      {
        kind: 'torso',
        id: `${manifest?.base}_torso`,
        variant: 'default',
        metadata: { base: true, required: true }
      },
      {
        kind: 'legs',
        id: `${manifest?.base}_legs`,
        variant: 'default',
        metadata: { base: true, required: true }
      }
    );

    // Face components
    components?.push({
      kind: 'eyes',
      id: `eyes_${manifest?.face}`,
      variant: 'default',
      metadata: { facial: true, expression: manifest?.face }
    });

    components?.push({
      kind: 'mouth',
      id: `mouth_${manifest?.face}`,
      variant: 'default',
      metadata: { facial: true, expression: manifest?.face }
    });

    // Hair component (if specified in layers)
    if (manifest?.layers?.hair) {
      components?.push({
        kind: 'hair',
        id: manifest?.layers.hair,
        variant: 'default',
        metadata: { customizable: true }
      });
    }

    // Clothing components
    for (const clothing of (manifest?.clothing || [])) {
      components?.push({
        kind: 'shirt',
        id: clothing,
        variant: 'default',
        metadata: { clothing: true, removable: true }
      });
    }

    // Accessories from layers
    if (manifest?.layers?.accessories) {
      for (const accessory of manifest?.layers.accessories) {
        components?.push({
          kind: 'accessory',
          id: accessory,
          variant: 'default',
          metadata: { accessory: true, removable: true }
        });
      }
    }

    // Add customization components
    if (manifest?.customization) {
      AvatarSystemPure?.applyCustomization(components, manifest?.customization);
    }

    // Add animation to applicable components
    if (manifest?.animation) {
      AvatarSystemPure?.applyAnimation(components, manifest?.animation);
    }

    return components;
  }

  private static applyCustomization(components: AvatarComponent[], customization: AvatarCustomization): void {
    // Apply skin tone to body components
    if (customization?.skinTone) {
      const bodyComponents = components?.filter((c: any) => ['head', 'torso', 'legs'].includes(c?.kind));
      for (const component of bodyComponents) {
        component?.color = customization?.skinTone;
        component?.metadata = { ...component?.metadata, skinTone: customization?.skinTone };
      }
    }

    // Apply hair color to hair components
    if (customization?.hairColor) {
      const hairComponents = components?.filter((c: any) => c?.kind === 'hair');
      for (const component of hairComponents) {
        component?.color = customization?.hairColor;
        component?.metadata = { ...component?.metadata, hairColor: customization?.hairColor };
      }
    }

    // Apply body scaling
    if (customization?.bodyScale) {
      for (const component of components) {
        component?.metadata = { ...component?.metadata, bodyScale: customization?.bodyScale };
      }
    }
  }

  private static applyAnimation(components: AvatarComponent[], animation: AvatarAnimation): void {
    // Apply animation to all components
    for (const component of components) {
      component?.animation = {
        idle: animation?.idle,
        walk: animation?.walk,
        run: animation?.run,
        attack: animation?.attack,
        defend: animation?.defend,
        cast: animation?.cast,
        death: animation?.death,
        victory: animation?.victory,
        emote: animation?.emote,
        parameters: animation?.parameters
      };
    }
  }
}

export type AvatarComponentKind = 'head' | 'torso' | 'legs' | 'boots' | 'shirt' | 'cloak' | 'hat' | 'accessory' | 'weapon' | 'shield' | 'hair' | 'eyes' | 'mouth';

export namespace AvatarSystemPure {
  export function anchorFor(comp: { kind: AvatarComponentKind; id: string }): string {
    switch (comp?.kind) {
      case 'head': return 'anchor_head';
      case 'torso': return 'anchor_torso';
      case 'legs': return 'anchor_legs';
      case 'boots': return 'anchor_boots';
      case 'shirt': return 'anchor_shirt';
      case 'cloak': return 'anchor_cloak';
      case 'hat': return 'anchor_hat';
      case 'accessory': return 'anchor_accessory';
      case 'weapon': return 'anchor_weapon';
      case 'shield': return 'anchor_shield';
      case 'hair': return 'anchor_hair';
      case 'eyes': return 'anchor_eyes';
      case 'mouth': return 'anchor_mouth';
    }
  }

  export function findAssetURL(anchor: string, registry: AvatarRegistry, style: AvatarStyle): string {
    // Fallback chain: registry -> procedural -> template -> AI -> placeholder
    for (const item of registry?.items) {
      const url = item?.anchors[`${style}:${anchor}`] || item?.anchors[anchor] || '';
      if (url) return url;
    }
    // Procedural
    const procedural = generateProcedural(anchor, style);
    if (procedural) return procedural;
    // Template
    const template = templateURL(anchor, style);
    if (template) return template;
    // AI hint (non-blocking placeholder)
    const ai = aiHintURL(anchor, style);
    if (ai) return ai;
    // Final placeholder
    return placeholderURL(anchor, style);
  }

  export function generateProcedural(anchor: string, style: AvatarStyle): string | null {
    return null;
  }

  export function templateURL(anchor: string, style: AvatarStyle): string | null {
    return `/site/assets/avatars/templates/${style}/${anchor}.png`;
  }

  export function aiHintURL(anchor: string, style: AvatarStyle): string | null {
    return `/site/assets/avatars/hints/${style}/${anchor}.png`;
  }

  export function placeholderURL(anchor: string, style: AvatarStyle): string {
    return `/site/assets/avatars/placeholders/${style}/${anchor}.png`;
  }
}

