// Re-export all public APIs
export * from './Manager';
export { defaultAudioBridgePureManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'AudioBridgePure',
    version: '1.0.0',
    type: 'AudioBridgePure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
