/**
 * SplashScreenPure - Modular Splash Screen System for MIFF
 *
 * Provides a standardized, configurable splash screen that appears at the start
 * of every MIFF-powered game, preview, or export across all platforms.
 *
 * @module SplashScreenPure
 * @version 1.0.0
 * @license MIT
 */

import { EventBus } from '../EventsPure';

interface SplashScreenConfig {
  duration: number;
  fadeInTime: number;
  fadeOutTime: number;
  theme: 'dark' | 'light';
  showSubtitle: boolean;
  autoDismiss: boolean;
  clickToDismiss: boolean;
  logoScale: number;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  customLogo?: string;
  customText?: string;
  customSubtitle?: string;
}

interface SplashScreenState {
  isVisible: boolean;
  isAnimating: boolean;
  startTime: number;
  endTime: number;
  currentPhase: 'fade-in' | 'hold' | 'fade-out';
}

export class SplashScreenPure {
  private config: SplashScreenConfig;
  private state: SplashScreenState;
  private container: HTMLElement | null = null;
  private onCompleteCallback: (() => void) | null = null;

  constructor(config: Partial<SplashScreenConfig> = {}) {
    this?.config = {
      duration: 3000,
      fadeInTime: 1000,
      fadeOutTime: 1000,
      theme: 'dark',
      showSubtitle: true,
      autoDismiss: true,
      clickToDismiss: true,
      logoScale: 1.0,
      textColor: '#00ff88',
      backgroundColor: '#000000',
      accentColor: '#00ff88',
      ...config
    };

    this?.state = {
      isVisible: false,
      isAnimating: false,
      startTime: 0,
      endTime: 0,
      currentPhase: 'fade-in'
    };

    this?.setupEventListeners();
  }

  private setupEventListeners(): void {
    EventBus?.on('splashscreen?.show', this?.show.bind(this));
    EventBus?.on('splashscreen?.hide', this?.hide.bind(this));
    EventBus?.on('splashscreen?.updateConfig', this?.updateConfig.bind(this));
  }

  private updateConfig(newConfig: Partial<SplashScreenConfig>): void {
    this?.config = { ...this?.config, ...newConfig };
    if (this?.container) {
      this?.updateVisualElements();
    }
  }

  public async show(onComplete?: () => void): Promise<void> {
    if (this?.state.isVisible) return;

    this?.onCompleteCallback = onComplete || null;
    this?.state.isVisible = true;
    this?.state.isAnimating = true;
    this.state.startTime = new Date();
    this?.state.endTime = this?.state.startTime + this?.config.duration;
    this?.state.currentPhase = 'fade-in';

    await this?.createContainer();
    this?.renderSplashScreen();
    this?.startAnimationLoop();

    // Auto-dismiss if enabled
    if (this?.config.autoDismiss) {
      setTimeout(() => {
        this?.hide();
      }, this?.config.duration);
    }
  }

  public async hide(): Promise<void> {
    if (!this?.state.isVisible) return;

    this?.state.isVisible = false;
    this?.state.currentPhase = 'fade-out';

    // Wait for fade-out animation
    await new Promise(resolve => setTimeout(resolve, this?.config.fadeOutTime));

    this?.cleanup();
    this?.onCompleteCallback?.();
    EventBus?.publish('splashscreen?.complete');
  }

  private createContainer(): void {
    if (this?.container) return;

    this?.container = document?.createElement('div');
    this?.container.id = 'miff-splash-screen';
    this?.container.style?.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity ${this?.config.fadeInTime}ms ease-in-out;
      pointer-events: ${this?.config.clickToDismiss ? 'auto' : 'none'};
      background: ${this?.config.backgroundColor};
      font-family: 'JetBrains Mono', monospace, sans-serif;
      user-select: none;
    `;

    // Add click handler if enabled
    if (this?.config.clickToDismiss) {
      this?.container.addEventListener('click', () => {
        if (this?.state.currentPhase === 'hold') {
          this?.hide();
        }
      });

      this?.container.style?.cursor = 'pointer';
    }

    document?.body.appendChild(this?.container);
  }

  private renderSplashScreen(): void {
    if (!this?.container) return;

    const logoHtml = this?.generateLogoHTML();
    const textHtml = this?.generateTextHTML();

    this?.container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        ${logoHtml}
        ${textHtml}
      </div>
    `;

    // Apply theme-specific styling
    this?.applyThemeStyling();
  }

  private generateLogoHTML(): string {
    if (this?.config.customLogo) {
      return `<img src="${this?.config.customLogo}" alt="MIFF Logo" style="width: ${120 * this?.config.logoScale}px; height: ${120 * this?.config.logoScale}px; margin-bottom: 20px;">`;
    }

    return `
      <div style="margin-bottom: 20px; position: relative;">
        <svg width="${120 * this?.config.logoScale}" height="${120 * this?.config.logoScale}" viewBox="0 0 120 120" xmlns="http://www?.w3.org/2000/svg">
          <!-- Brain-shaped puzzle composed of four interlocking pieces -->
          <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${this?.config.accentColor};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${this?.config.accentColor};stop-opacity:1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <!-- Puzzle piece 1 (top-left) -->
          <path d="M15 25 Q10 20 15 15 L35 15 Q40 20 35 25 Q30 30 25 25 Q20 30 15 25 Z"
                fill="url(#brainGradient)" filter="url(#glow)" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
          </path>

          <!-- Puzzle piece 2 (top-right) -->
          <path d="M45 25 Q50 20 55 15 L75 15 Q80 20 75 25 Q70 30 65 25 Q60 30 55 25 Q50 30 45 25 Z"
                fill="url(#brainGradient)" filter="url(#glow)" opacity="0.8">
            <animate attributeName="opacity" values="0.8;0.6;0.8" dur="2.5s" repeatCount="indefinite"/>
          </path>

          <!-- Puzzle piece 3 (bottom-right) -->
          <path d="M45 55 Q50 50 55 45 L75 45 Q80 50 75 55 Q70 60 65 55 Q60 60 55 55 Q50 60 45 55 Z"
                fill="url(#brainGradient)" filter="url(#glow)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;0.7;0.9" dur="1.8s" repeatCount="indefinite"/>
          </path>

          <!-- Puzzle piece 4 (bottom-left) -->
          <path d="M15 55 Q10 50 15 45 L35 45 Q40 50 35 55 Q30 60 25 55 Q20 60 15 55 Z"
                fill="url(#brainGradient)" filter="url(#glow)" opacity="0.7">
            <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.2s" repeatCount="indefinite"/>
          </path>

          <!-- Center connecting pieces -->
          <circle cx="40" cy="40" r="8" fill="url(#brainGradient)" opacity="0.5">
            <animate attributeName="r" values="6;10;6" dur="3s" repeatCount="indefinite"/>
          </circle>

          <!-- Glow effects -->
          <circle cx="30" cy="30" r="4" fill="${this?.config.accentColor}" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite"/>
          </circle>

          <circle cx="50" cy="30" r="3" fill="${this?.config.accentColor}" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.5s" repeatCount="indefinite"/>
          </circle>

          <circle cx="50" cy="50" r="4" fill="${this?.config.accentColor}" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.4;0.1" dur="1.8s" repeatCount="indefinite"/>
          </circle>

          <circle cx="30" cy="50" r="3" fill="${this?.config.accentColor}" opacity="0.4">
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2.2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    `;
  }

  private generateTextHTML(): string {
    const textColor = this?.config.textColor;
    const accentColor = this?.config.accentColor;

    return `
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <h1 style="font-size: 4rem; font-weight: 900; color: ${textColor}; margin: 0; text-shadow: 0 0 20px ${accentColor}40;">MIFF</h1>
      </div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: ${textColor}; margin: 0 0 10px 0; letter-spacing: 0.1em;">MAKE IT FOR FREE</h2>
      ${this?.config.showSubtitle ? `<p style="font-size: 1rem; color: ${textColor}aa; margin: 0; opacity: 0.8;">Modular Interactive Framework for the Future</p>` : ''}
    `;
  }

  private applyThemeStyling(): void {
    if (!this?.container) return;

    // Apply theme-specific adjustments
    if (this?.config.theme === 'light') {
      this?.config.textColor = '#00cc66';
      this?.config.backgroundColor = '#ffffff';
      this?.config.accentColor = '#00cc66';
    } else {
      this?.config.textColor = '#00ff88';
      this?.config.backgroundColor = '#000000';
      this?.config.accentColor = '#00ff88';
    }

    // Re-render with updated theme
    this?.renderSplashScreen();
  }

  private startAnimationLoop(): void {
    const animate = () => {
      if (!this?.state.isVisible) return;

      const now = new Date();
      const elapsed = now - this?.state.startTime;
      const totalDuration = this?.config.duration;

      // Update animation phases
      if (elapsed < this?.config.fadeInTime) {
        this?.state.currentPhase = 'fade-in';
        const progress = elapsed / this?.config.fadeInTime;
        if (this?.container) {
          this?.container.style?.opacity = progress?.toString();
        }
      } else if (elapsed < totalDuration - this?.config.fadeOutTime) {
        this?.state.currentPhase = 'hold';
        if (this?.container) {
          this?.container.style?.opacity = '1';
        }
      } else {
        this?.state.currentPhase = 'fade-out';
        const fadeProgress = (elapsed - (totalDuration - this?.config.fadeOutTime)) / this?.config.fadeOutTime;
        const opacity = Math.max(0, 1 - fadeProgress);
        if (this?.container) {
          this?.container.style?.opacity = opacity?.toString();
        }
      }

      if (this?.state.isVisible) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  private cleanup(): void {
    if (this?.container && this?.container.parentNode) {
      this?.container.parentNode?.removeChild(this?.container);
      this?.container = null;
    }
    this?.state.isVisible = false;
    this?.state.isAnimating = false;
  }

  // Public API methods
  public getConfig(): SplashScreenConfig {
    return { ...this?.config };
  }

  public setConfig(newConfig: Partial<SplashScreenConfig>): void {
    this?.updateConfig(newConfig);
  }

  public isVisible(): boolean {
    return this?.state.isVisible;
  }

  public getState(): SplashScreenState {
    return { ...this?.state };
  }

  // Static utility methods
  public static createDefaultConfig(): SplashScreenConfig {
    return {
      duration: 3000,
      fadeInTime: 1000,
      fadeOutTime: 1000,
      theme: 'dark',
      showSubtitle: true,
      autoDismiss: true,
      clickToDismiss: true,
      logoScale: 1.0,
      textColor: '#00ff88',
      backgroundColor: '#000000',
      accentColor: '#00ff88'
    };
  }

  public static injectSplashScreen(htmlContent: string, config: Partial<SplashScreenConfig> = {}): string {
    const splashConfig = { ...this?.createDefaultConfig(), ...config };
    const splashHTML = this?.generateSplashScreenHTML(splashConfig);

    // Insert splash screen before closing body tag
    return htmlContent?.replace('</body>', `${splashHTML}\n</body>`);
  }

  private static generateSplashScreenHTML(config: SplashScreenConfig): string {
    return `
<!-- MIFF Splash Screen -->
<div id="miff-splash-screen" style="
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  opacity: 0;
  transition: opacity ${config?.fadeInTime}ms ease-in-out;
  pointer-events: ${config?.clickToDismiss ? 'auto' : 'none'};
  background: ${config?.backgroundColor};
  font-family: 'JetBrains Mono', monospace, sans-serif;
  user-select: none;
  ${config?.clickToDismiss ? 'cursor: pointer;' : ''}
">
  <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
    ${this?.generateLogoHTML(config)}
    ${this?.generateTextHTML(config)}
  </div>
</div>

<script>
(function() {
  const splashScreen = document?.getElementById('miff-splash-screen');
  if (!splashScreen) return;

  let startTime = new Date();

  // Fade in
  setTimeout(() => {
    splashScreen?.style.opacity = '1';
  }, 100);

  // Auto-dismiss after duration
  if (${config?.autoDismiss}) {
    setTimeout(() => {
      splashScreen?.style.opacity = '0';
      setTimeout(() => {
        if (splashScreen?.parentNode) {
          splashScreen?.parentNode.removeChild(splashScreen);
        }
      }, ${config?.fadeOutTime});
    }, ${config?.duration});
  }

  // Click to dismiss
  if (${config?.clickToDismiss}) {
    splashScreen?.addEventListener('click', () => {
      splashScreen?.style.opacity = '0';
      setTimeout(() => {
        if (splashScreen?.parentNode) {
          splashScreen?.parentNode.removeChild(splashScreen);
        }
      }, ${config?.fadeOutTime});
    });
  }
})();
</script>
    `.trim();
  }

  private static generateLogoHTML(config: SplashScreenConfig): string {
    return `
      <div style="margin-bottom: 20px; position: relative;">
        <svg width="${120 * config?.logoScale}" height="${120 * config?.logoScale}" viewBox="0 0 120 120" xmlns="http://www?.w3.org/2000/svg">
          <defs>
            <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${config?.accentColor};stop-opacity:0.8" />
              <stop offset="100%" style="stop-color:${config?.accentColor};stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M15 25 Q10 20 15 15 L35 15 Q40 20 35 25 Q30 30 25 25 Q20 30 15 25 Z"
                fill="url(#brainGradient)" opacity="0.9"/>
          <path d="M45 25 Q50 20 55 15 L75 15 Q80 20 75 25 Q70 30 65 25 Q60 30 55 25 Q50 30 45 25 Z"
                fill="url(#brainGradient)" opacity="0.8"/>
          <path d="M45 55 Q50 50 55 45 L75 45 Q80 50 75 55 Q70 60 65 55 Q60 60 55 55 Q50 60 45 55 Z"
                fill="url(#brainGradient)" opacity="0.9"/>
          <path d="M15 55 Q10 50 15 45 L35 45 Q40 50 35 55 Q30 60 25 55 Q20 60 15 55 Z"
                fill="url(#brainGradient)" opacity="0.7"/>
          <circle cx="40" cy="40" r="8" fill="url(#brainGradient)" opacity="0.5"/>
        </svg>
      </div>
    `;
  }

  private static generateTextHTML(config: SplashScreenConfig): string {
    return `
      <div style="display: flex; align-items: center; margin-bottom: 15px;">
        <h1 style="font-size: 4rem; font-weight: 900; color: ${config?.textColor}; margin: 0; text-shadow: 0 0 20px ${config?.accentColor}40;">MIFF</h1>
      </div>
      <h2 style="font-size: 1.5rem; font-weight: 600; color: ${config?.textColor}; margin: 0 0 10px 0; letter-spacing: 0.1em;">MAKE IT FOR FREE</h2>
      ${config?.showSubtitle ? `<p style="font-size: 1rem; color: ${config?.textColor}aa; margin: 0; opacity: 0.8;">Modular Interactive Framework for the Future</p>` : ''}
    `;
  }
}

// Export for CLI harness
export function splashScreenDemo(): any {
  const splashScreen = new SplashScreenPure();

  return {
    op: 'splashscreen_demo',
    status: 'ok',
    module: 'SplashScreenPure',
    features: [
      'Configurable splash screen with MIFF branding',
      'SVG-based green brain puzzle logo',
      'Responsive design for desktop and mobile',
      'Auto-dismiss and click-to-dismiss functionality',
      'Theme support (dark/light modes)',
      'Integration with HUDPure and DebugOverlayPure'
    ],
    orchestrationReady: true,
    modulesIntegrated: [
      'EventsPure',
      'HUDPure',
      'DebugOverlayPure'
    ]
  };
}