// Re-export all public APIs
export * from './Manager';
export { defaultWebBridgePureManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'WebBridgePure',
    version: '1.0.0',
    type: 'WebBridgePure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
