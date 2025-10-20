/**
 * ButtonStylePure Tests
 * 
 * Tests for ButtonStylePure using actual implementation
 */

import { ButtonStylePure, createButtonStyle, ButtonVariant, ButtonSize } from './index';

describe('ButtonStylePure', () => {
  describe('Button Style Creation', () => {
    it('should create button style with default options', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      expect(style).toBeDefined();
      expect(style.variant).toBe(ButtonVariant.PRIMARY);
      expect(style.size).toBe(ButtonSize.MEDIUM);
    });

    it('should create button with custom colors', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.CUSTOM,
        size: ButtonSize.LARGE,
        backgroundColor: '#FF5733',
        textColor: '#FFFFFF'
      });

      expect(style.backgroundColor).toBe('#FF5733');
      expect(style.textColor).toBe('#FFFFFF');
    });
  });

  describe('Button Variants', () => {
    it('should create primary button style', () => {
      const style = ButtonStylePure.createPrimary();
      expect(style.variant).toBe(ButtonVariant.PRIMARY);
    });

    it('should create secondary button style', () => {
      const style = ButtonStylePure.createSecondary();
      expect(style.variant).toBe(ButtonVariant.SECONDARY);
    });

    it('should create danger button style', () => {
      const style = ButtonStylePure.createDanger();
      expect(style.variant).toBe(ButtonVariant.DANGER);
    });

    it('should create success button style', () => {
      const style = ButtonStylePure.createSuccess();
      expect(style.variant).toBe(ButtonVariant.SUCCESS);
    });
  });

  describe('Button Sizes', () => {
    it('should create small button', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.SMALL
      });

      expect(style.size).toBe(ButtonSize.SMALL);
      expect(style.padding).toBeDefined();
    });

    it('should create medium button', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      expect(style.size).toBe(ButtonSize.MEDIUM);
    });

    it('should create large button', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.LARGE
      });

      expect(style.size).toBe(ButtonSize.LARGE);
    });
  });

  describe('Button States', () => {
    it('should apply hover state', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      const hoverStyle = ButtonStylePure.applyHoverState(style);
      expect(hoverStyle).toBeDefined();
    });

    it('should apply active state', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      const activeStyle = ButtonStylePure.applyActiveState(style);
      expect(activeStyle).toBeDefined();
    });

    it('should apply disabled state', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      const disabledStyle = ButtonStylePure.applyDisabledState(style);
      expect(disabledStyle.disabled).toBe(true);
    });
  });

  describe('Style Utilities', () => {
    it('should merge button styles', () => {
      const baseStyle = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      const overrides = {
        backgroundColor: '#333333',
        borderRadius: 8
      };

      const merged = ButtonStylePure.mergeStyles(baseStyle, overrides);
      expect(merged.backgroundColor).toBe('#333333');
      expect(merged.borderRadius).toBe(8);
    });

    it('should convert style to CSS', () => {
      const style = createButtonStyle({
        variant: ButtonVariant.PRIMARY,
        size: ButtonSize.MEDIUM
      });

      const css = ButtonStylePure.toCSS(style);
      expect(typeof css).toBe('string');
      expect(css.length).toBeGreaterThan(0);
    });
  });
});
