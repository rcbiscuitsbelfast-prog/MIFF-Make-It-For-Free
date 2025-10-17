import { RemixTaggingOverride, ModuleTag, RemixLevel } from './Manager';

export function getOverride(): RemixTaggingOverride {
  return {
    validateTag: (tag: ModuleTag): boolean => {
      // Custom validation: remix-required tags must have detailed reasons
      if (tag.remixLevel === 'remix-required') {
        return tag.reason.length > 20;
      }
      return true;
    },
    
    getCustomLevel: (moduleId: string): RemixLevel | null => {
      // Special modules get custom levels
      const specialModules: Record<string, RemixLevel> = {
        'BridgeSchemaPure': 'remix-required',
        'SharedSchemaPure': 'remix-required',
        'MiffAttributionPure': 'remix-required'
      };
      
      return specialModules[moduleId] || null;
    },
    
    getDependencies: (moduleId: string): string[] => {
      // Enhanced dependency mapping
      const enhancedDeps: Record<string, string[]> = {
        'CombatPure': ['CombatCorePure', 'StatsSystemPure', 'EquipmentPure'],
        'QuestsPure': ['NPCsPure', 'DialogPure', 'WorldLayoutPure'],
        'BridgeSchemaPure': ['SharedSchemaPure'],
        'UnityBridgePure': ['BridgeSchemaPure', 'CombatPure'],
        'GodotBridgePure': ['BridgeSchemaPure', 'CombatPure'],
        'WebBridgePure': ['BridgeSchemaPure', 'CombatPure']
      };
      
      return enhancedDeps[moduleId] || [];
    }
  };
}