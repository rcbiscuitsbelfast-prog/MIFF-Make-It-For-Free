import { RemixTaggingOverride, ModuleTag, RemixLevel } from '../shared/ConsolidatedSchema.js';

export const remixTaggingOverride: RemixTaggingOverride = {
  getEnhancedDependencies: (moduleId: string): string[] => {
    const enhancedDeps: Record<string, string[]> = {
      'CombatPure': ['HealthSystemPure', 'TeamsPure', 'ItemsPure']
    };
    
    return enhancedDeps[moduleId] || [];
  }
};