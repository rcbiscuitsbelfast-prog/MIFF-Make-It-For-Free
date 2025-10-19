import { describe, it, expect } from '@jest/globals';
import { ButtonStylePure, createButtonStyle } from './index';

describe('ButtonStylePure', () => {
  describe('Button Style Creation', () => {
    it('should create default button style', () => {
      const style = createButtonStyle();

      expect(style).toBeDefined();
      expect(style.padding).toBeDefined();
      expect(style.borderRadius).toBeDefined();
    });

    it('should create custom button style', () => {
      const style = createButtonStyle({
        backgroundColor: '#007bff',
        color: '#ffffff',
        padding: '12px 24px'
      });

      expect(style.backgroundColor).toBe('#007bff');
      expect(style.color).toBe('#ffffff');
      expect(style.padding).toBe('12px 24px');
    });
  });

  describe('Theme Application', () => {
    it('should apply theme to button', () => {
      const baseStyle = createButtonStyle();
      const theme = {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745'
      };

      const themed = applyTheme(baseStyle, theme, 'primary');
      expect(themed).toBeDefined();
    });
  });

  describe('Button States', () => {
    it('should create hover state', () => {
      const style = createButtonStyle();
      const hoverStyle = ButtonStylePure.createHoverState(style);

      expect(hoverStyle).toBeDefined();
    });

    it('should create disabled state', () => {
      const style = createButtonStyle();
      const disabledStyle = ButtonStylePure.createDisabledState(style);

      expect(disabledStyle).toBeDefined();
    });
  });
});
