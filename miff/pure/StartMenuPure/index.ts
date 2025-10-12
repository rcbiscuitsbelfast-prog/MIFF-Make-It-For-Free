// Re-export all public APIs
export * from './Manager';
export { defaultStartMenuPureManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'StartMenuPure',
    version: '1.0.0',
    type: 'StartMenuPure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
