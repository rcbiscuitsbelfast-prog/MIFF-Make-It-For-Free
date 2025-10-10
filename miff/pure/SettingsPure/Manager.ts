export interface SettingsConfig {
  musicVolume: number;
  sfxVolume: number;
  language: string;
  showSubtitles: boolean;
  graphics: {
    resolution: string;
    fullscreen: boolean;
    vsync: boolean;
    antiAliasing: boolean;
    shadows: boolean;
    textureQuality: 'low' | 'medium' | 'high' | 'ultra';
  };
  controls: {
    mouseSensitivity: number;
    invertMouse: boolean;
    keyBindings: Record<string, string>;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
    ambientVolume: number;
    audioDevice: string;
  };
  gameplay: {
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    autoSave: boolean;
    autoSaveInterval: number;
    tutorialEnabled: boolean;
    hintsEnabled: boolean;
  };
  accessibility: {
    colorBlindSupport: boolean;
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
  };
  advanced: {
    debugMode: boolean;
    loggingLevel: 'error' | 'warn' | 'info' | 'debug';
    performanceMode: 'quality' | 'balanced' | 'performance';
    experimentalFeatures: boolean;
  };
}

export interface SettingsValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface SettingsStats {
  totalSettings: number;
  modifiedSettings: number;
  defaultSettings: number;
  lastModified: number;
  categories: Record<string, number>;
}

import * as fs from 'fs';
import * as path from 'path';

export class SettingsManager {
  private settings: SettingsConfig;
  private defaults: SettingsConfig;
  private history: Array<{ timestamp: number; changes: Record<string, any> }> = [];
  private validationRules: Map<string, (value: any) => boolean> = new Map();

  constructor(initPath?: string) {
    this.defaults = this.createDefaultSettings();
    
    if (initPath && fs.existsSync(initPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(path.resolve(initPath), 'utf-8'));
        this.settings = this.mergeSettings(this.defaults, data.settings || data);
      } catch (error) {
        console.warn('Failed to load settings, using defaults:', error);
        this.settings = { ...this.defaults };
      }
    } else {
      this.settings = { ...this.defaults };
    }

    this.initializeValidationRules();
  }

  private createDefaultSettings(): SettingsConfig {
    return {
      musicVolume: 0.8,
      sfxVolume: 0.8,
      language: 'en',
      showSubtitles: true,
      graphics: {
        resolution: '1920x1080',
        fullscreen: false,
        vsync: true,
        antiAliasing: true,
        shadows: true,
        textureQuality: 'high'
      },
      controls: {
        mouseSensitivity: 1.0,
        invertMouse: false,
        keyBindings: {
          'move_forward': 'W',
          'move_backward': 'S',
          'move_left': 'A',
          'move_right': 'D',
          'jump': 'Space',
          'crouch': 'Ctrl',
          'run': 'Shift'
        }
      },
      audio: {
        masterVolume: 1.0,
        musicVolume: 0.8,
        sfxVolume: 0.8,
        voiceVolume: 0.9,
        ambientVolume: 0.7,
        audioDevice: 'default'
      , blockingOperations: []},
      gameplay: {
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 300,
        tutorialEnabled: true,
        hintsEnabled: true
      },
      accessibility: {
        colorBlindSupport: false,
        fontSize: 'medium',
        highContrast: false,
        screenReader: false,
        reducedMotion: false
      },
      advanced: {
        debugMode: false,
        loggingLevel: 'info',
        performanceMode: 'balanced',
        experimentalFeatures: false
      }
    };
  }

  private mergeSettings(defaults: SettingsConfig, loaded: any): SettingsConfig {
    const merged = { ...defaults };
    
    // Deep merge nested objects
    for (const [key, value] of Object.entries(loaded as Record<string, any>)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (merged[key as keyof SettingsConfig] && typeof (merged[key as keyof SettingsConfig] as any) === 'object') {
          (merged as any)[key] = { ...(merged[key as keyof SettingsConfig] as any), ...value };
        } else {
          (merged as any)[key] = value;
        }
      } else {
        (merged as any)[key] = value;
      }
    }
    
    return merged;
  }

  private initializeValidationRules(): void {
    this.validationRules.set('musicVolume', (v) => typeof v === 'number' && v >= 0 && v <= 1);
    this.validationRules.set('sfxVolume', (v) => typeof v === 'number' && v >= 0 && v <= 1);
    this.validationRules.set('language', (v) => typeof v === 'string' && v.length >= 2);
    this.validationRules.set('showSubtitles', (v) => typeof v === 'boolean');
    this.validationRules.set('graphics.resolution', (v) => typeof v === 'string' && /^\d+x\d+$/.test(v));
    this.validationRules.set('graphics.fullscreen', (v) => typeof v === 'boolean');
    this.validationRules.set('graphics.textureQuality', (v) => ['low', 'medium', 'high', 'ultra'].includes(v as any));
    this.validationRules.set('controls.mouseSensitivity', (v) => typeof v === 'number' && v >= 0.1 && v <= 5.0);
    this.validationRules.set('gameplay.difficulty', (v) => ['easy', 'normal', 'hard', 'expert'].includes(v as any));
    this.validationRules.set('accessibility.fontSize', (v) => ['small', 'medium', 'large'].includes(v as any));
    this.validationRules.set('advanced.loggingLevel', (v) => ['error', 'warn', 'info', 'debug'].includes(v as any));
    this.validationRules.set('advanced.performanceMode', (v) => ['quality', 'balanced', 'performance'].includes(v as any));
  }

  get(key: string): any {
    const keys = key.split('.');
    let value: any = this.settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  set(key: string, value: any): boolean {
    const keys = key.split('.');
    const lastKey = keys.pop()!;
    let target: any = this.settings;
    
    // Navigate to the parent object
    for (const k of keys) {
      if (!target[k] || typeof target[k] !== 'object') {
        target[k] = {};
      }
      target = target[k];
    }
    
    // Validate the value
    const validator = this.validationRules.get(key);
    if (validator && !validator(value)) {
      return false;
    }
    
    // Store the old value for history
    const oldValue = target[lastKey];
    
    // Set the new value
    target[lastKey] = value;
    
    // Record the change
    this.history.push({
      timestamp: Date.now(),
      changes: { [key]: { old: oldValue, new: value } }
    });
    
    // Keep only last 100 changes
    if (this.history.length > 100) {
      this.history.shift();
    }
    
    return true;
  }

  getCategory(category: string): any {
    return this.settings[category as keyof SettingsConfig];
  }

  setCategory(category: string, values: Record<string, any>): boolean {
    if (!(category in this.settings)) {
      return false;
    }
    
    const oldValues = { ...(this.settings as any)[category] };
    
    for (const [key, value] of Object.entries(values)) {
      const fullKey = `${category}.${key}`;
      const validator = this.validationRules.get(fullKey);
      if (validator && !validator(value)) {
        return false;
      }
    }
    
    (this.settings as any)[category] = { ...oldValues, ...values };
    
    this.history.push({
      timestamp: Date.now(),
      changes: { [category]: { old: oldValues, new: values } }
    });
    
    return true;
  }

  validate(): SettingsValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Validate all settings
    for (const [key, validator] of this.validationRules) {
      const value = this.get(key);
      if (value !== undefined && !validator(value)) {
        errors.push(`Invalid value for ${key}: ${value}`);
      }
    }
    
    // Check for potential issues
    if (this.settings.graphics.textureQuality === 'ultra' && this.settings.advanced.performanceMode === 'performance') {
      warnings.push('Ultra texture quality with performance mode may cause issues');
    }
    
    if (this.settings.audio.masterVolume === 0) {
      warnings.push('Master volume is muted');
    }
    
    if (this.settings.gameplay.difficulty === 'expert' && this.settings.gameplay.tutorialEnabled) {
      suggestions.push('Consider disabling tutorial for expert difficulty');
    }
    
    if (this.settings.accessibility.reducedMotion && this.settings.graphics.antiAliasing) {
      suggestions.push('Reduced motion may conflict with anti-aliasing effects');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  reset(): void {
    this.settings = { ...this.defaults };
    this.history.push({
      timestamp: Date.now(),
      changes: { reset: true }
    });
  }

  resetCategory(category: string): boolean {
    if (!(category in this.defaults)) {
      return false;
    }
    
    const oldValues = { ...(this.settings as any)[category] };
    (this.settings as any)[category] = { ...(this.defaults as any)[category] };
    
    this.history.push({
      timestamp: Date.now(),
      changes: { [category]: { old: oldValues, new: (this.defaults as any)[category] } }
    });
    
    return true;
  }

  getHistory(): Array<{ timestamp: number; changes: Record<string, any> }> {
    return [...this.history];
  }

  getStats(): SettingsStats {
    const totalSettings = this.countTotalSettings(this.settings);
    const modifiedSettings = this.countModifiedSettings();
    const categories: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(this.settings)) {
      if (typeof value === 'object' && value !== null) {
        categories[key] = Object.keys(value).length;
      } else {
        categories[key] = 1;
      }
    }
    
    return {
      totalSettings,
      modifiedSettings,
      defaultSettings: totalSettings - modifiedSettings,
      lastModified: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : 0,
      categories
    };
  }

  private countTotalSettings(obj: any): number {
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        count += this.countTotalSettings(value);
      } else {
        count++;
      }
    }
    return count;
  }

  private countModifiedSettings(): number {
    let count = 0;
    for (const entry of this.history) {
      for (const [key, change] of Object.entries(entry.changes)) {
        if (change.old !== change.new) {
          count++;
        }
      }
    }
    return count;
  }

  export(format: 'json' | 'yaml' | 'markdown' | 'html' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.settings, null, 2);
      
      case 'yaml':
        return this.toYaml(this.settings);
      
      case 'markdown':
        return this.toMarkdown();
      
      case 'html':
        return this.toHtml();
      
      default:
        return JSON.stringify(this.settings, null, 2);
    }
  }

  private toYaml(obj: any, indent: number = 0): string {
    let yaml = '';
    const spaces = '  '.repeat(indent);
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.toYaml(value, indent + 1);
      } else {
        yaml += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return yaml;
  }

  private toMarkdown(): string {
    let md = '# Settings Configuration\n\n';
    
    for (const [category, values] of Object.entries(this.settings)) {
      md += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      
      if (typeof values === 'object' && values !== null) {
        for (const [key, value] of Object.entries(values)) {
          md += `- **${key}**: ${value}\n`;
        }
      } else {
        md += `- **${category}**: ${values}\n`;
      }
      
      md += '\n';
    }
    
    return md;
  }

  private toHtml(): string {
    let html = '<!DOCTYPE html><html><head><title>Settings Configuration</title></head><body>';
    html += '<h1>Settings Configuration</h1>';
    
    for (const [category, values] of Object.entries(this.settings)) {
      html += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>`;
      html += '<ul>';
      
      if (typeof values === 'object' && values !== null) {
        for (const [key, value] of Object.entries(values)) {
          html += `<li><strong>${key}</strong>: ${value}</li>`;
        }
      } else {
        html += `<li><strong>${category}</strong>: ${values}</li>`;
      }
      
      html += '</ul>';
    }
    
    html += '</body></html>';
    return html;
  }

  save(path: string): void {
    const data = {
      settings: this.settings,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        stats: this.getStats()
      }
    };
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  }

  load(path: string): boolean {
    try {
      const data = JSON.parse(fs.readFileSync(path, 'utf-8'));
      this.settings = this.mergeSettings(this.defaults, data.settings || data);
      return true;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return false;
    }
  }
}