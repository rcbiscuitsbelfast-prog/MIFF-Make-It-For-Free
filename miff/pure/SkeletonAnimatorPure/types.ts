/**
 * Core types and interfaces for SkeletonAnimatorPure
 */

export interface Vec3 {
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
  type: 'head' | 'neck' | 'torso' | 'limb' | 'joint';
  transform: Transform;
  parent?: string;
  children: string[];
  snapPoints: SnapPoint[];
  constraints: Constraint[];
}

export interface SnapPoint {
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
  normal: Vec3;
  type: 'attachment' | 'joint' | 'constraint';
  radius: number;
}

export interface Constraint {
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
  version: string;
  nodes: Record<string, RigNode>;
  rootNode: string;
}

export interface LimbConfig {
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
  type: 'arm' | 'leg' | 'tail' | 'wing' | 'custom';
  segments: LimbSegment[];
  attachmentPoint: string;
  constraints: Constraint[];
  symmetry?: string; // ID of symmetric limb
}

export interface LimbSegment {
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
  length: number;
  thickness: number;
  jointType: 'hinge' | 'ball' | 'fixed';
  transform: Transform;
  parent?: string;
  children: string[];
}

export interface SkinConfig {
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
  rigId: string;
  meshData: MeshData;
  materials: MaterialConfig[];
  morphTargets: MorphTarget[];
}

export interface MeshData {
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
  start: number;
  count: number;
  materialIndex: number;
}

export interface MaterialConfig {
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
  type: 'standard' | 'toon' | 'pbr';
  properties: Record<string, any>;
  textures: TextureConfig[];
}

export interface TextureConfig {
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
  type: 'diffuse' | 'normal' | 'specular' | 'roughness' | 'metallic';
  path: string;
  scale: Vec3;
  offset: Vec3;
}

export interface MorphTarget {
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
  weight: number;
}

export interface FaceConfig {
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
  rigId: string;
  features: FaceFeature[];
  symmetry: boolean;
}

export interface FaceFeature {
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
  type: 'nose' | 'ear' | 'eye' | 'mouth' | 'brow' | 'cheek';
  position: Vec3;
  scale: Vec3;
  rotation: Quaternion;
  morphTargets: MorphTarget[];
  symmetry?: string; // ID of symmetric feature
}

export interface AnimationConfig {
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
  type: 'walk' | 'idle' | 'jump' | 'attack' | 'emote' | 'custom';
  duration: number;
  loop: boolean;
  keyframes: Keyframe[];
  rigId: string;
}

export interface Keyframe {
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
  format: 'gbpg' | 'gltf' | 'fbx' | 'obj';
  rig: RigConfig;
  skin?: SkinConfig;
  face?: FaceConfig;
  animations: AnimationConfig[];
}

export interface UIAction {
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
  type: 'create' | 'update' | 'delete' | 'select' | 'drag' | 'resize' | 'rotate';
  target: string;
}

export interface SkeletonState {
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
  type: 'properties' | 'hierarchy' | 'materials' | 'animation';
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}