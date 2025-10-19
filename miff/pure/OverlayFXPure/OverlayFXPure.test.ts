import { describe, it, expect } from '@jest/globals';
import { OverlayFXPure } from './index';

describe('OverlayFXPure', () => {
  describe('Overlay Creation', () => {
    it('should create overlay effect', () => {
      const overlay = OverlayFXPure.create({
        type: 'vignette',
        intensity: 0.5,
        enabled: true
      });

      expect(overlay).toBeDefined();
      expect(overlay.type).toBe('vignette');
    });

    it('should create with default settings', () => {
      const overlay = OverlayFXPure.create({ type: 'blur' });

      expect(overlay).toBeDefined();
      expect(overlay.type).toBe('blur');
    });
  });

  describe('Effect Application', () => {
    it('should apply vignette effect', () => {
      const overlay = OverlayFXPure.create({ type: 'vignette', intensity: 0.7 });
      const canvas = { width: 800, height: 600 };

      const result = OverlayFXPure.apply(overlay, canvas);
      expect(result).toBeDefined();
    });

    it('should apply blur effect', () => {
      const overlay = OverlayFXPure.create({ type: 'blur', intensity: 0.5 });
      const canvas = { width: 800, height: 600 };

      const result = OverlayFXPure.apply(overlay, canvas);
      expect(result).toBeDefined();
    });

    it('should apply chromatic aberration', () => {
      const overlay = OverlayFXPure.create({ type: 'chromatic-aberration' });
      const canvas = { width: 800, height: 600 };

      const result = OverlayFXPure.apply(overlay, canvas);
      expect(result).toBeDefined();
    });
  });

  describe('Overlay States', () => {
    it('should enable overlay', () => {
      const overlay = OverlayFXPure.create({ type: 'scanlines', enabled: false });
      
      const enabled = OverlayFXPure.enable(overlay);
      expect(enabled.enabled).toBe(true);
    });

    it('should disable overlay', () => {
      const overlay = OverlayFXPure.create({ type: 'vignette', enabled: true });
      
      const disabled = OverlayFXPure.disable(overlay);
      expect(disabled.enabled).toBe(false);
    });

    it('should adjust intensity', () => {
      const overlay = OverlayFXPure.create({ type: 'blur', intensity: 0.5 });
      
      const adjusted = OverlayFXPure.setIntensity(overlay, 0.8);
      expect(adjusted.intensity).toBe(0.8);
    });
  });
});
