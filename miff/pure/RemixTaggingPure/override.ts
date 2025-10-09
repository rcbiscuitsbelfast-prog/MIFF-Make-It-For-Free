// Define remix tagging types locally since they don't exist in ConsolidatedSchema
type ModuleTag = 'core' | 'optional' | 'experimental' | 'deprecated';
type RemixLevel = 'safe' | 'risky' | 'dangerous';

interface RemixTaggingOverride {
  getEnhancedDependencies: (moduleId: string) => string[];
  getModuleTags: (moduleId: string) => ModuleTag[];
  getRemixLevel: (moduleId: string) => RemixLevel;
  validateRemixSafety: (moduleId: string) => boolean;
}

export const remixTaggingOverride: RemixTaggingOverride = {
  getEnhancedDependencies: (moduleId: string): string[] => {
    const enhancedDeps: Record<string, string[]> = {
      'CombatPure': ['HealthSystemPure', 'TeamsPure', 'ItemsPure']
    };
    
    return enhancedDeps[moduleId] || [];
  },
  
  getModuleTags: (moduleId: string): ModuleTag[] => {
    const moduleTags: Record<string, ModuleTag[]> = {
      'CombatPure': ['core'],
      'HealthSystemPure': ['core'],
      'TeamsPure': ['core'],
      'ItemsPure': ['core']
    };
    
    return moduleTags[moduleId] || ['optional'];
  },
  
  getRemixLevel: (moduleId: string): RemixLevel => {
    const remixLevels: Record<string, RemixLevel> = {
      'CombatPure': 'safe',
      'HealthSystemPure': 'safe',
      'TeamsPure': 'safe',
      'ItemsPure': 'safe'
    };
    
    return remixLevels[moduleId] || 'risky';
  },
  
  validateRemixSafety: (moduleId: string): boolean => {
    const level = remixTaggingOverride.getRemixLevel(moduleId);
    return level === 'safe';
  }
};