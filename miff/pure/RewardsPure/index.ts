// Re-export all public APIs
export * from './Manager';
export { defaultRewardsPureManager as default } from './Manager';

// Export module utilities
export function getModuleInfo(): { name: string; version: string; type: string } {
  return {
    name: 'RewardsPure',
    version: '1.0.0',
    type: 'RewardsPure'
  };
}

export function isModuleAvailable(): boolean {
  return true;
}

export function getModuleCapabilities(): string[] {
  return ['core', 'management', 'optimization'];
}
