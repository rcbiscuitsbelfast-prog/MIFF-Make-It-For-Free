// Re-export all public APIs
export * from './Manager';
export { defaultThemeParkManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'ThemeParkPure',
    version: '1.0.0',
    type: 'ThemeParkPure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
