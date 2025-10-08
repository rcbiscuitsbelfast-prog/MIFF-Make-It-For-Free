/**
 * RenderPayloadPure Module
 * 
 * Unified render payload management for cross-engine compatibility.
 * Provides frame building, asset management, and export adapters.
 * 
 * @module RenderPayloadPure
 * @version 1.0.0
 * @license MIT
 */

export { 
  RenderPayloadManager,
  RenderPayloadBuilder,
  createSampleFrame,
  type FrameBuildOptions,
  type BuildResult,
  type AssetReference,
  type AnimationSequence,
  type RenderStats
} from './Manager';

// Default export for convenience
import { RenderPayloadManager as _RenderPayloadManager } from './Manager';
export default _RenderPayloadManager;

export { RenderPayload, RenderData, BridgeSchemaValidator } from '../BridgeSchemaPure/schema';