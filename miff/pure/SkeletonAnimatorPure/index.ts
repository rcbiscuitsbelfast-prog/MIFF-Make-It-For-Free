/**
 * SkeletonAnimatorPure - Complete multi-phase skeleton animation system
 * 
 * A comprehensive system for building, animating, and exporting 3D characters
 * with full UI integration and MIFF-native export formats.
 * 
 * @module SkeletonAnimatorPure
 * @version 1.0.0
 * @license MIT
 */

export { SkeletonAnimatorManager } from './Manager';
export { RigBuilder } from './RigBuilder';
export { LimbAttachment } from './LimbAttachment';
export { SkinMeshGenerator } from './SkinMeshGenerator';
export { FacialDetailBuilder } from './FacialDetailBuilder';
export { AnimationSequencer } from './AnimationSequencer';
export { ExportIntegration } from './ExportIntegration';
export { UIBuilder } from './UIBuilder';

// Core types and interfaces
export type {
  RigConfig,
  RigNode,
  LimbConfig,
  SkinConfig,
  FaceConfig,
  AnimationConfig,
  ExportConfig,
  UIAction,
  SkeletonState
} from './types';

// CLI harness
export { cliHarness } from './cliHarness';