/**
 * Core types and interfaces for SkeletonAnimatorPure
 */

export interface Vec3 {
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
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
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
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface Transform {
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
  position: Vec3;
  rotation: Quaternion;
  scale: Vec3;
}

export interface RigNode {
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
  type: 'head' | 'neck' | 'torso' | 'limb' | 'joint';
  transform: Transform;
  parent?: string;
  children: string[];
  snapPoints: SnapPoint[];
  constraints: Constraint[];
  metadata: Record<string, any>;
}

export interface SnapPoint {
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
  position: Vec3;
  normal: Vec3;
  type: 'attachment' | 'joint' | 'constraint';
  radius: number;
  metadata: Record<string, any>;
}

export interface Constraint {
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
  type: 'hinge' | 'ball' | 'slider' | 'fixed';
  axis?: Vec3;
  limits?: {
    min: number;
    max: number;
  };
  stiffness: number;
  damping: number;
}

export interface RigConfig {
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
  version: string;
  nodes: Record<string, RigNode>;
  rootNode: string;
  metadata: Record<string, any>;
}

export interface LimbConfig {
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
  type: 'arm' | 'leg' | 'tail' | 'wing' | 'custom';
  segments: LimbSegment[];
  attachmentPoint: string;
  constraints: Constraint[];
  symmetry?: string; // ID of symmetric limb
  metadata: Record<string, any>;
}

export interface LimbSegment {
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
  length: number;
  thickness: number;
  jointType: 'hinge' | 'ball' | 'fixed';
  transform: Transform;
  parent?: string;
  children: string[];
  metadata: Record<string, any>;
}

export interface SkinConfig {
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
  rigId: string;
  meshData: MeshData;
  materials: MaterialConfig[];
  morphTargets: MorphTarget[];
  metadata: Record<string, any>;
}

export interface MeshData {
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
  vertices: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  groups: MeshGroup[];
}

export interface MeshGroup {
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
  name: string;
  start: number;
  count: number;
  materialIndex: number;
}

export interface MaterialConfig {
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
  type: 'standard' | 'toon' | 'pbr';
  properties: Record<string, any>;
  textures: TextureConfig[];
}

export interface TextureConfig {
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
  type: 'diffuse' | 'normal' | 'specular' | 'roughness' | 'metallic';
  path: string;
  scale: Vec3;
  offset: Vec3;
}

export interface MorphTarget {
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
  vertices: number[];
  weight: number;
  metadata: Record<string, any>;
}

export interface FaceConfig {
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
  rigId: string;
  features: FaceFeature[];
  symmetry: boolean;
  metadata: Record<string, any>;
}

export interface FaceFeature {
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
  type: 'nose' | 'ear' | 'eye' | 'mouth' | 'brow' | 'cheek';
  position: Vec3;
  scale: Vec3;
  rotation: Quaternion;
  morphTargets: MorphTarget[];
  symmetry?: string; // ID of symmetric feature
  metadata: Record<string, any>;
}

export interface AnimationConfig {
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
  type: 'walk' | 'idle' | 'jump' | 'attack' | 'emote' | 'custom';
  duration: number;
  loop: boolean;
  keyframes: Keyframe[];
  rigId: string;
  metadata: Record<string, any>;
}

export interface Keyframe {
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
  nodeId: string;
  transform: Transform;
  interpolation: 'linear' | 'bezier' | 'step';
  handles?: {
    in: Vec3;
    out: Vec3;
  };
}

export interface ExportConfig {
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
  format: 'gbpg' | 'gltf' | 'fbx' | 'obj';
  rig: RigConfig;
  skin?: SkinConfig;
  face?: FaceConfig;
  animations: AnimationConfig[];
  metadata: Record<string, any>;
}

export interface UIAction {
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
  type: 'create' | 'update' | 'delete' | 'select' | 'drag' | 'resize' | 'rotate';
  target: string;
  data: any;
  timestamp: number;
}

export interface SkeletonState {
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
  rig: RigConfig;
  skin?: SkinConfig;
  face?: FaceConfig;
  animations: Record<string, AnimationConfig>;
  selectedNode?: string;
  uiState: UIState;
}

export interface UIState {
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
  mode: 'rig' | 'limb' | 'skin' | 'face' | 'animation' | 'export';
  selectedTool: string;
  viewport: ViewportState;
  panels: PanelState[];
}

export interface ViewportState {
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
  camera: {
    position: Vec3;
    target: Vec3;
    fov: number;
  };
  grid: {
    visible: boolean;
    size: number;
  };
  gizmos: {
    visible: boolean;
    size: number;
  };
}

export interface PanelState {
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
  type: 'properties' | 'hierarchy' | 'materials' | 'animation';
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}