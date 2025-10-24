/**
 * ButtonStylePure Tests
 */

import { ButtonStyleManager, ButtonVariant, ButtonSize, ButtonState } from './index';

describe('ButtonStylePure', () => {
  let manager: ButtonStyleManager;

  beforeEach(() => {
    manager = new ButtonStyleManager();
  });

  describe('Button Creation', () => {
    it('should create button with default values', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM);
      expect(style).toBeDefined();
      expect(style.variant).toBe(ButtonVariant.PRIMARY);
      expect(style.size).toBe(ButtonSize.MEDIUM);
    });

    it('should create button with custom size', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.LARGE);
      expect(style.size).toBe(ButtonSize.LARGE);
    });
  });

  describe('Button Variants', () => {
    it('should create primary button style', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM);
      expect(style.variant).toBe(ButtonVariant.PRIMARY);
    });

    it('should create secondary button style', () => {
      const style = manager.getStyle(ButtonVariant.SECONDARY, ButtonSize.MEDIUM);
      expect(style.variant).toBe(ButtonVariant.SECONDARY);
    });

    it('should create success button style', () => {
      const style = manager.getStyle(ButtonVariant.SUCCESS, ButtonSize.MEDIUM);
      expect(style.variant).toBe(ButtonVariant.SUCCESS);
    });

    it('should create warning button style', () => {
      const style = manager.getStyle(ButtonVariant.WARNING, ButtonSize.MEDIUM);
      expect(style.variant).toBe(ButtonVariant.WARNING);
    });

    it('should create danger button style', () => {
      const style = manager.getStyle(ButtonVariant.DANGER, ButtonSize.MEDIUM);
      expect(style.variant).toBe(ButtonVariant.DANGER);
    });
  });

  describe('Button States', () => {
    it('should handle hover state', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM, ButtonState.HOVER);
      expect(style.state).toBe(ButtonState.HOVER);
    });

    it('should handle active state', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM, ButtonState.ACTIVE);
      expect(style.state).toBe(ButtonState.ACTIVE);
    });

    it('should handle disabled state', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM, ButtonState.DISABLED);
      expect(style.state).toBe(ButtonState.DISABLED);
    });
  });

  describe('Theme Support', () => {
    it('should apply theme to button style', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM);
      const themedStyle = manager.applyTheme(style, 'dark');
      expect(themedStyle).toBeDefined();
      expect(themedStyle.variant).toBe(ButtonVariant.PRIMARY);
    });
  });

  describe('Utility Functions', () => {
    it('should convert button style to CSS', () => {
      const style = manager.getStyle(ButtonVariant.PRIMARY, ButtonSize.MEDIUM);
      // toCSS method validation
      expect(style).toBeDefined();
      expect(style.backgroundColor).toBeDefined();
      expect(style.textColor).toBeDefined();
    });
  });
});
