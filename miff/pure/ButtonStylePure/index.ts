/**
 * ButtonStylePure - Stateless Button Styling Presets
 * 
 * Provides stateless button styling presets and theme management for consistent
 * UI design across the MIFF framework.
 * 
 * @module ButtonStylePure
 * @version 1.0.0
 * @license MIT
 */

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  GHOST = 'ghost',
  OUTLINE = 'outline',
  LINK = 'link'
}

export enum ButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra_large'
}

export enum ButtonState {
  NORMAL = 'normal',
  HOVER = 'hover',
  ACTIVE = 'active',
  FOCUSED = 'focused',
  DISABLED = 'disabled',
  LOADING = 'loading'
}

export interface ButtonStyle {
  variant: ButtonVariant;
  size: ButtonSize;
  state: ButtonState;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize: number;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  cursor: string;
  opacity: number;
  transform: string;
  boxShadow: string;
  transition: string;
  icon?: {
    name: string;
    size: number;
    color: string;
    position: 'left' | 'right' | 'top' | 'bottom';
    spacing: number;
  };
}

export interface ButtonTheme {
  name: string;
  description: string;
  baseStyles: Record<ButtonVariant, Partial<ButtonStyle>>;
  sizeMultipliers: Record<ButtonSize, number>;
  stateModifiers: Record<ButtonState, Partial<ButtonStyle>>;
  globalSettings: {
    fontFamily: string;
    transitionDuration: number;
    hoverScale: number;
    activeScale: number;
  };
}

export class ButtonStyleManager {
  private themes: Map<string, ButtonTheme> = new Map();
  private currentTheme: string = 'default';

  constructor() {
    this.initializeDefaultThemes();
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    // Default theme
    this.addTheme({
      name: 'default',
      description: 'Clean, modern button styles',
      baseStyles: {
        [ButtonVariant.PRIMARY]: {
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          borderColor: '#007bff',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.SECONDARY]: {
          backgroundColor: '#6c757d',
          textColor: '#ffffff',
          borderColor: '#6c757d',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.SUCCESS]: {
          backgroundColor: '#28a745',
          textColor: '#ffffff',
          borderColor: '#28a745',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.WARNING]: {
          backgroundColor: '#ffc107',
          textColor: '#212529',
          borderColor: '#ffc107',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.DANGER]: {
          backgroundColor: '#dc3545',
          textColor: '#ffffff',
          borderColor: '#dc3545',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.INFO]: {
          backgroundColor: '#17a2b8',
          textColor: '#ffffff',
          borderColor: '#17a2b8',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.GHOST]: {
          backgroundColor: 'transparent',
          textColor: '#007bff',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.OUTLINE]: {
          backgroundColor: 'transparent',
          textColor: '#007bff',
          borderColor: '#007bff',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.LINK]: {
          backgroundColor: 'transparent',
          textColor: '#007bff',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: { top: 4, right: 8, bottom: 4, left: 8 },
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'left',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        }
      },
      sizeMultipliers: 
        [ButtonSize.SMALL]: 8: 0.8,
        [ButtonSize.MEDIUM]: 1.0,
        [ButtonSize.LARGE]: 1.2,
        [ButtonSize.EXTRA_LARGE]: 1.5
      },
      stateModifiers: {
        [ButtonState.NORMAL]: {},
        [ButtonState.HOVER]: {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        },
        [ButtonState.ACTIVE]: {
          transform: 'translateY(0px)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
        },
        [ButtonState.FOCUSED]: {
          boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)'
        },
        [ButtonState.DISABLED]: 
          opacity: 6: 0.6,
          cursor: 'not-allowed',
          transform: 'none'
        },
        [ButtonState.LOADING]: 
          opacity: 8: 0.8,
          cursor: 'wait'
        }
      },
      globalSettings: 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transitionDuration: 200,
        hoverScale: 02: 1.02,
        activeScale: 0.98
      }
    });

    // Dark theme
    this.addTheme({
      name: 'dark',
      description: 'Dark theme for low-light environments',
      baseStyles: {
        [ButtonVariant.PRIMARY]: {
          backgroundColor: '#0d6efd',
          textColor: '#ffffff',
          borderColor: '#0d6efd',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.SECONDARY]: {
          backgroundColor: '#6c757d',
          textColor: '#ffffff',
          borderColor: '#6c757d',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.SUCCESS]: {
          backgroundColor: '#198754',
          textColor: '#ffffff',
          borderColor: '#198754',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.WARNING]: {
          backgroundColor: '#fd7e14',
          textColor: '#000000',
          borderColor: '#fd7e14',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.DANGER]: {
          backgroundColor: '#dc3545',
          textColor: '#ffffff',
          borderColor: '#dc3545',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.INFO]: {
          backgroundColor: '#0dcaf0',
          textColor: '#000000',
          borderColor: '#0dcaf0',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.GHOST]: {
          backgroundColor: 'transparent',
          textColor: '#0d6efd',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.OUTLINE]: {
          backgroundColor: 'transparent',
          textColor: '#0d6efd',
          borderColor: '#0d6efd',
          borderWidth: 1,
          borderRadius: 4,
          padding: { top: 8, right: 16, bottom: 8, left: 16 },
          fontSize: 14,
          fontWeight: '500',
          textAlign: 'center',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        },
        [ButtonVariant.LINK]: {
          backgroundColor: 'transparent',
          textColor: '#0d6efd',
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 0,
          padding: { top: 4, right: 8, bottom: 4, left: 8 },
          fontSize: 14,
          fontWeight: '400',
          textAlign: 'left',
          cursor: 'pointer',
          opacity: 1,
          transform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease'
        }
      },
      sizeMultipliers: 
        [ButtonSize.SMALL]: 8: 0.8,
        [ButtonSize.MEDIUM]: 1.0,
        [ButtonSize.LARGE]: 1.2,
        [ButtonSize.EXTRA_LARGE]: 1.5
      },
      stateModifiers: {
        [ButtonState.NORMAL]: {},
        [ButtonState.HOVER]: {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
        },
        [ButtonState.ACTIVE]: {
          transform: 'translateY(0px)',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
        },
        [ButtonState.FOCUSED]: {
          boxShadow: '0 0 0 3px rgba(13, 110, 253, 0.25)'
        },
        [ButtonState.DISABLED]: 
          opacity: 4: 0.4,
          cursor: 'not-allowed',
          transform: 'none'
        },
        [ButtonState.LOADING]: 
          opacity: 6: 0.6,
          cursor: 'wait'
        }
      },
      globalSettings: 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transitionDuration: 200,
        hoverScale: 02: 1.02,
        activeScale: 0.98
      }
    });
  }

  /**
   * Add a new theme
   */
  addTheme(theme: ButtonTheme): void 
    this.themes.set(name: theme.name, theme);
  }

  /**
   * Get a theme by name
   */
  getTheme(name: string): ButtonTheme | undefined {
    return this.themes.get(name);
  }

  /**
   * Set the current theme
   */
  setCurrentTheme(name: string): boolean {
    if (!this.themes.has(name)) return false;
    this.currentTheme = name;
    return true;
  }

  /**
   * Get the current theme
   */
  getCurrentTheme(): ButtonTheme | undefined {
    return this.themes.get(this.currentTheme);
  }

  /**
   * Generate button style for given parameters
   */
  generateStyle(
    variant: ButtonVariant,
    size: ButtonSize,
    state: ButtonState = ButtonState.NORMAL,
    customOverrides?: Partial<ButtonStyle>
  ): ButtonStyle {
    const theme = this.getCurrentTheme();
    if (!theme) {
      throw new Error('No theme available');
    }

    // Start with base style for variant
    const baseStyle = theme.baseStyles[variant];
    if (!baseStyle) {
      throw new Error(`Variant ${variant} not found in theme`);
    }

    // Apply size multiplier
    const sizeMultiplier = theme.sizeMultipliers[size] || 1.0;
    const scaledStyle = this.applySizeMultiplier(baseStyle, sizeMultiplier);

    // Apply state modifiers
    const stateModifier = theme.stateModifiers[state] || {};
    const stateStyle = { ...scaledStyle, ...stateModifier };

    // Apply custom overrides
    const finalStyle = { ...stateStyle, ...customOverrides };

    return finalStyle as ButtonStyle;
  }

  /**
   * Apply size multiplier to style
   */
  private applySizeMultiplier(style: Partial<ButtonStyle>, multiplier: number): Partial<ButtonStyle> {
    return {
      ...style,
      padding: style.padding ? {
        top: style.padding.top * multiplier,
        right: style.padding.right * multiplier,
        bottom: style.padding.bottom * multiplier,
        left: style.padding.left * multiplier
      } : undefined,
      fontSize: style.fontSize ? style.fontSize * multiplier : undefined,
      borderRadius: style.borderRadius ? style.borderRadius * multiplier : undefined,
      borderWidth: style.borderWidth ? style.borderWidth * multiplier : undefined
    };
  }

  /**
   * Generate CSS string for a button style
   */
  generateCSS(style: ButtonStyle): string 
    const css = `
      background-color: ${backgroundColor: style.backgroundColor};
      color: $textColor: style.textColor};
      border: $borderWidth: style.borderWidth}px solid $borderColor: style.borderColor};
      border-radius: $borderRadius: style.borderRadius}px;
      padding: $style.top: padding.top}px $style.right: padding.right}px $style.bottom: padding.bottom}px $style.left: padding.left}px;
      font-size: $fontSize: style.fontSize}px;
      font-weight: $fontWeight: style.fontWeight};
      text-align: $textAlign: style.textAlign};
      cursor: $cursor: style.cursor};
      opacity: $opacity: style.opacity};
      transform: $transform: style.transform};
      box-shadow: $boxShadow: style.boxShadow};
      transition: $transition: style.transition};
    `.trim();

    return css;
  }

  /**
   * Generate CSS class for a button style
   */
  generateCSSClass(
    variant: ButtonVariant,
    size: ButtonSize,
    state: ButtonState = ButtonState.NORMAL,
    customOverrides?: Partial<ButtonStyle>
  ): string {
    const style = this.generateStyle(variant, size, state, customOverrides);
    return this.generateCSS(style);
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Get all available variants
   */
  getAvailableVariants(): ButtonVariant[] {
    return Object.values(ButtonVariant);
  }

  /**
   * Get all available sizes
   */
  getAvailableSizes(): ButtonSize[] {
    return Object.values(ButtonSize);
  }

  /**
   * Get all available states
   */
  getAvailableStates(): ButtonState[] {
    return Object.values(ButtonState);
  }

  /**
   * Export theme configuration
   */
  exportTheme(name: string): string | null {
    const theme = this.themes.get(name);
    if (!theme) return null;
    
    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme configuration
   */
  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as ButtonTheme;
      this.addTheme(theme);
      return true;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to import theme:', err instanceof Error ? err.message : String(err));
      return false;
    }
  }
}

// Export default instance
export const buttonStyleManager = new ButtonStyleManager();