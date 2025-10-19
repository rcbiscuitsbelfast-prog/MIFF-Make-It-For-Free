import { describe, it, expect } from '@jest/globals';
import AdvancedRenderingPure, { PixelMatrix, Color } from './index';

describe('AdvancedRenderingPure', () => {
  describe('Pixel Matrix', () => {
    it('should create empty pixel matrix', () => {
      const matrix = AdvancedRenderingPure.createMatrix(16, 16);

      expect(matrix).toBeDefined();
      expect(matrix.width).toBe(16);
      expect(matrix.height).toBe(16);
    });

    it('should set pixel color', () => {
      const matrix = AdvancedRenderingPure.createMatrix(8, 8);
      const color: Color = { r: 255, g: 0, b: 0, a: 255 };

      AdvancedRenderingPure.setPixel(matrix, 4, 4, color);
      expect(matrix).toBeDefined();
    });

    it('should get pixel color', () => {
      const matrix = AdvancedRenderingPure.createMatrix(8, 8);
      const color: Color = { r: 255, g: 0, b: 0, a: 255 };

      AdvancedRenderingPure.setPixel(matrix, 4, 4, color);
      const retrieved = AdvancedRenderingPure.getPixel(matrix, 4, 4);

      expect(retrieved).toEqual(color);
    });
  });

  describe('Rendering Effects', () => {
    it('should apply blur effect', () => {
      const matrix = AdvancedRenderingPure.createMatrix(16, 16);
      
      const blurred = AdvancedRenderingPure.applyBlur(matrix, 2);
      expect(blurred).toBeDefined();
    });

    it('should apply glow effect', () => {
      const matrix = AdvancedRenderingPure.createMatrix(16, 16);
      
      const glowing = AdvancedRenderingPure.applyGlow(matrix);
      expect(glowing).toBeDefined();
    });
  });

  describe('Color Operations', () => {
    it('should blend colors', () => {
      const color1: Color = { r: 255, g: 0, b: 0, a: 255 };
      const color2: Color = { r: 0, g: 0, b: 255, a: 255 };

      const blended = AdvancedRenderingPure.blendColors(color1, color2, 0.5);
      expect(blended).toBeDefined();
      expect(blended.r).toBeGreaterThan(0);
      expect(blended.b).toBeGreaterThan(0);
    });
  });
});
