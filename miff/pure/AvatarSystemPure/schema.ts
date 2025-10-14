export type AvatarStyle = '3d' | '2d-side' | 'overlay' | 'pixel-art' | 'voxel' | 'skeletal';

export interface AvatarComponent {
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
  kind: 'head' | 'torso' | 'legs' | 'boots' | 'shirt' | 'cloak' | 'hat' | 'accessory' | 'weapon' | 'shield' | 'hair' | 'eyes' | 'mouth';
  id: string; // e.g. "tunic_blue_v1"
  variant?: string;
  color?: string;
  material?: string;
  animation?: AvatarAnimation;
  metadata?: Record<string, any>;
}

export interface AvatarAnchors {
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
  head?: { x: number; y: number };
  torso?: { x: number; y: number };
  feet?: { x: number; y: number };
  [key: string]: { x: number; y: number } | undefined;
}

export interface AvatarAnimation {
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
  idle?: string;
  walk?: string;
  run?: string;
  attack?: string;
  defend?: string;
  cast?: string;
  death?: string;
  victory?: string;
  emote?: Record<string, string>;
  parameters?: Record<string, number>;
}

export interface AvatarLayers {
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
  body?: string; // url or asset id
  clothing?: string[];
  face?: string; // url or asset id
  hair?: string;
  eyes?: string;
  mouth?: string;
  accessories?: string[];
}

export interface AvatarCustomization {
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
  skinTone?: string;
  hairColor?: string;
  eyeColor?: string;
  bodyScale?: number;
  height?: number;
  proportions?: Record<string, number>;
  tattoos?: AvatarTattoo[];
  scars?: AvatarScar[];
  modifications?: AvatarModification[];
}

export interface AvatarTattoo {
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
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  color?: string;
  opacity: number;
}

export interface AvatarScar {
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
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  severity: number;
}

export interface AvatarModification {
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
  component: string;
  modification: 'remove' | 'replace' | 'add';
  data: any;
}

export interface AvatarManifest {
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
  base: 'barbarian' | 'mage' | 'rogue' | string;
  clothing: string[];
  face: 'neutral' | 'smile' | 'angry' | string;
  style: AvatarStyle;
  layers?: AvatarLayers;
  anchor?: AvatarAnchors;
  customization?: AvatarCustomization;
  animation?: AvatarAnimation;
  performance?: {
    polyCount?: number;
    textureSize?: string;
    mobileOptimized?: boolean;
    lodLevels?: number;
    gpuInstancing?: boolean;
  };
  metadata?: Record<string, any>;
  version?: string;
  compatibility?: string[];
  tags?: string[];
}

export interface ResolvedAvatar {
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
  manifest: AvatarManifest;
  // Style-agnostic canonical parts list
  components: AvatarComponent[];
  // Concrete asset bindings per style
  assets: {
    style: AvatarStyle;
    entries: Array<{ anchor: string; url: string; meta?: Record<string, unknown> }>;
  };
  // Rendering information
  renderData?: AvatarRenderData;
  // Animation state
  animationState?: AvatarAnimationState;
  // Performance optimizations
  optimizations?: AvatarOptimizations;
}

export interface AvatarRenderData {
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
  bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
  materials: AvatarMaterial[];
  textures: AvatarTexture[];
  meshes?: AvatarMesh[];
  shaders?: Record<string, string>;
  lodDistances?: number[];
}

export interface AvatarMaterial {
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
  diffuse?: string;
  normal?: string;
  specular?: string;
  emissive?: string;
  metallic?: number;
  roughness?: number;
  opacity?: number;
  shader?: string;
}

export interface AvatarTexture {
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
  url: string;
  type: 'diffuse' | 'normal' | 'specular' | 'emissive';
  size: { width: number; height: number };
  format: string;
  compressed: boolean;
}

export interface AvatarMesh {
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
  vertices: number;
  triangles: number;
  uvs: number;
  bones?: number;
  blendShapes?: string[];
}

export interface AvatarAnimationState {
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
  currentAnimation: string;
  time: number;
  speed: number;
  loop: boolean;
  transitions: AvatarAnimationTransition[];
  parameters: Record<string, number>;
  events: AvatarAnimationEvent[];
}

export interface AvatarAnimationTransition {
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
  from: string;
  to: string;
  duration: number;
  conditions?: Record<string, any>;
}

export interface AvatarAnimationEvent {
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
  time: number;
  event: string;
  parameters?: Record<string, any>;
}

export interface AvatarOptimizations {
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
  instancing: boolean;
  culling: boolean;
  lod: boolean;
  compression: boolean;
  streaming: boolean;
  gpuSkinning: boolean;
  textureAtlas: boolean;
}

export function isAvatarManifest(value: any): value is AvatarManifest {
  return !!value && typeof value === 'object' && typeof value.base === 'string' && typeof value.style === 'string';
}

