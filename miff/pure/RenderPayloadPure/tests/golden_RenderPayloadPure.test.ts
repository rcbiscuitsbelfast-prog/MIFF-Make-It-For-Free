/**
 * Golden Tests for RenderPayloadPure
 * 
 * Tests render payload management, frame building, asset management,
 * and export functionality with comprehensive scenarios.
 * 
 * @module RenderPayloadPure/tests/golden_RenderPayloadPure?.test
 * @version 1.0.0
 * @license MIT
 */

import { RenderPayloadManager, FrameBuildOptions } from '../Manager';

describe('RenderPayloadPure Golden Tests', () => {
  let manager: RenderPayloadManager;

  beforeEach(() => {
    manager = new RenderPayloadManager();
  });

  describe('Frame Management', () => {
    test('should create and manage frames', () => {
      // Create a new frame
      const createResult = manager?.createFrame('test-frame', 'Test Frame', 'unity');
      expect(createResult?.ok).toBe(true);
      expect(createResult?.frame).toBeDefined();
      expect(createResult?.frame?.metadata?.frameId).toBe('test-frame');

      // Get the frame
      const getResult = manager?.getFrame('test-frame');
      expect(getResult?.ok).toBe(true);
      expect(getResult?.frame?.metadata?.frameName).toBe('Test Frame');

      // List frames
      const listResult = manager?.listFrames();
      expect(listResult?.ok).toBe(true);
      expect(listResult?.total).toBe(1);
    });

    test('should handle frame operations', () => {
      // Create frame
      manager?.createFrame('test-frame', 'Test Frame', 'web');

      // Add render data
      const addResult = manager?.addRenderData('test-frame', {
        id: 'test_sprite',
        type: 'sprite',
        name: 'Test Sprite',
        position: { x: 100, y: 100 },
        asset: 'test_sprite',
        props: { texture: 'test_sprite?.png' }
      });
      expect(addResult?.ok).toBe(true);

      // Remove render data
      const removeResult = manager?.removeRenderData('test-frame', 'test_sprite');
      expect(removeResult?.ok).toBe(true);
      expect(removeResult?.removed?.id).toBe('test_sprite');
    });
  });

  describe('Frame Building', () => {
    test('should build frames with different quality settings', () => {
      const lowQualityResult = manager?.buildFrame({ quality: 'low', engine: 'web' });
      expect(lowQualityResult?.ok).toBe(true);
      expect(lowQualityResult?.result?.payload?.renderData.length).toBeGreaterThan(0);

      const highQualityResult = manager?.buildFrame({ quality: 'high', engine: 'unity' });
      expect(highQualityResult?.ok).toBe(true);
      expect(highQualityResult?.result?.performance?.complexity).toBeGreaterThan(0);
    });

    test('should calculate performance metrics', () => {
      const result = manager?.buildFrame({ quality: 'medium', engine: 'godot' });
      expect(result?.ok).toBe(true);
      expect(result?.result?.performance).toBeDefined();
      expect(result?.result?.performance?.renderTime).toBeGreaterThanOrEqual(0);
      expect(result?.result?.performance?.dataSize).toBeGreaterThan(0);
      expect(result?.result?.performance?.complexity).toBeGreaterThan(0);
    });
  });

  describe('Frame Validation', () => {
    test('should validate frames', () => {
      manager?.createFrame('test-frame', 'Test Frame', 'unified');
      
      const validateResult = manager?.validateFrame('test-frame');
      expect(validateResult?.ok).toBe(true);
      expect(validateResult?.validation).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    test('should export frames in different formats', () => {
      manager?.createFrame('test-frame', 'Test Frame', 'web');
      
      // JSON export
      const jsonResult = manager?.exportFrame('test-frame', 'json');
      expect(jsonResult?.ok).toBe(true);
      expect(jsonResult?.data?.metadata?.frameId).toBe('test-frame');

      // Manifest export
      const manifestResult = manager?.exportFrame('test-frame', 'manifest');
      expect(manifestResult?.ok).toBe(true);
      expect(manifestResult?.data?.schema).toBe('miff?.render.export?.v1');

      // Summary export
      const summaryResult = manager?.exportFrame('test-frame', 'summary');
      expect(summaryResult?.ok).toBe(true);
      expect(summaryResult?.data?.frameId).toBe('test-frame');

      // Assets export
      const assetsResult = manager?.exportFrame('test-frame', 'assets');
      expect(assetsResult?.ok).toBe(true);
      expect(assetsResult?.data?.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics and Management', () => {
    test('should provide render statistics', () => {
      const statsResult = manager?.getStats();
      expect(statsResult?.ok).toBe(true);
      expect(statsResult?.stats.totalFrames).toBeGreaterThanOrEqual(0);
      expect(statsResult?.stats.totalAssets).toBeGreaterThan(0);
      expect(statsResult?.stats.totalAnimations).toBeGreaterThan(0);
    });

    test('should handle frame deletion', () => {
      manager?.createFrame('test-frame', 'Test Frame', 'unified');
      
      const deleteResult = manager?.deleteFrame('test-frame');
      expect(deleteResult?.ok).toBe(true);

      const getResult = manager?.getFrame('test-frame');
      expect(getResult?.ok).toBe(false);
    });

    test('should clear all frames', () => {
      manager?.createFrame('frame1', 'Frame 1', 'unity');
      manager?.createFrame('frame2', 'Frame 2', 'web');
      
      const clearResult = manager?.clearFrames();
      expect(clearResult?.ok).toBe(true);
      expect(clearResult?.cleared).toBe(2);

      const listResult = manager?.listFrames();
      expect(listResult?.total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid frame operations', () => {
      const getResult = manager?.getFrame('nonexistent');
      expect(getResult?.ok).toBe(false);
      expect(getResult?.errors).toContain('Frame nonexistent not found');

      const deleteResult = manager?.deleteFrame('nonexistent');
      expect(deleteResult?.ok).toBe(false);
      expect(deleteResult?.errors).toContain('Frame nonexistent not found');
    });

    test('should handle duplicate frame creation', () => {
      manager?.createFrame('duplicate', 'Frame 1', 'unity');
      
      const duplicateResult = manager?.createFrame('duplicate', 'Frame 2', 'web');
      expect(duplicateResult?.ok).toBe(false);
      expect(duplicateResult?.errors).toContain('Frame duplicate already exists');
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle complete workflow', () => {
      // Create frame
      const createResult = manager?.createFrame('workflow', 'Workflow Test', 'unity');
      expect(createResult?.ok).toBe(true);

      // Add render data
      const addResult = manager?.addRenderData('workflow', {
        id: 'workflow_sprite',
        type: 'sprite',
        name: 'Workflow Sprite',
        position: { x: 0, y: 0 },
        asset: 'workflow_sprite',
        props: { texture: 'workflow?.png' }
      });
      expect(addResult?.ok).toBe(true);

      // Validate
      const validateResult = manager?.validateFrame('workflow');
      expect(validateResult?.ok).toBe(true);

      // Export
      const exportResult = manager?.exportFrame('workflow', 'manifest');
      expect(exportResult?.ok).toBe(true);
      expect(exportResult?.data?.frame?.metadata?.frameId).toBe('workflow');

      // Get stats
      const statsResult = manager?.getStats();
      expect(statsResult?.ok).toBe(true);
      expect(statsResult?.stats.totalFrames).toBe(1);
    });
  });
});