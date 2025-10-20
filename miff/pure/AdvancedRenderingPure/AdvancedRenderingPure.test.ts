import { describe, it, expect } from '@jest/globals';
import AdvancedRenderingPure, { PixelMatrix } from './index';

describe('AdvancedRenderingPure', () => {
  describe('Rendering Effects', () => {
    it('should apply outline', () => {
      const matrix: PixelMatrix = [
        [null, null, null],
        [null, '#FF0000', null],
        [null, null, null]
      ];
      
      const outlined = AdvancedRenderingPure.applyOutline(matrix, { color: '#000000', thickness: 1 });
      expect(outlined).toBeDefined();
      expect(outlined.length).toBe(3);
    });

    it('should apply shading', () => {
      const matrix: PixelMatrix = [
        ['#FF0000', '#FF0000'],
        ['#FF0000', '#FF0000']
      ];
      
      const shaded = AdvancedRenderingPure.applyShading(matrix, { strength: 0.5, ambient: 0.3 });
      expect(shaded).toBeDefined();
      expect(shaded.length).toBe(2);
    });

    it('should apply lighting', () => {
      const matrix: PixelMatrix = [
        ['#FF0000', '#FF0000'],
        ['#FF0000', '#FF0000']
      ];
      
      const lit = AdvancedRenderingPure.applyLighting(matrix, {
        direction: { x: 1, y: 0 },
        int: '#FFFFFF',
        intStrength: 0.3
      });
      expect(lit).toBeDefined();
      expect(lit.length).toBe(2);
    });

    it('should apply double thickness outline', () => {
      const matrix: PixelMatrix = [
        [null, null, null, null, null],
        [null, null, '#FF0000', null, null],
        [null, null, null, null, null]
      ];
      
      const outlined = AdvancedRenderingPure.applyOutline(matrix, { color: '#000000', thickness: 2 });
      expect(outlined).toBeDefined();
    });

    it('should handle empty matrix', () => {
      const matrix: PixelMatrix = [];
      
      const outlined = AdvancedRenderingPure.applyOutline(matrix, { color: '#000000', thickness: 1 });
      expect(outlined).toBeDefined();
    });

    it('should preserve matrix structure in shading', () => {
      const matrix: PixelMatrix = [
        ['#FF0000', null, '#00FF00'],
        [null, '#0000FF', null]
      ];
      
      const shaded = AdvancedRenderingPure.applyShading(matrix, { strength: 0.8, ambient: 0.2 });
      expect(shaded[0][0]).toBeTruthy(); // Red pixel should be shaded
      expect(shaded[0][1]).toBeFalsy(); // Null should stay null
      expect(shaded[0][2]).toBeTruthy(); // Green pixel should be shaded
    });
  });
});
