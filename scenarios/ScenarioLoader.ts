// ScenarioLoader.ts
// Remix-safe module for dynamically loading MIFF scenario files
// Uses dynamic imports for lazy loading without orchestration
// MIT License, Copyright (c) 2025 MIFF Community

// Helper type for scenario structure (mirrors ScenarioPure)
interface ScenarioPure {
  id: string;
  title: string;
  description: string;
  objectives: { id: string; description: string; condition: () => boolean }[];
  triggers: { id: string; event: string; condition?: () => boolean; action: () => void }[];
  rewards: { id: string; type: string; value: string | number; target?: string }[];
  dependencies: string[];
  version: string;
  author: string;
  license: string;
}

// Helper type for loaded scenario module
interface LoadedScenario {
  id: string;
  title: string;
  metadata: {
    description: string;
    version: string;
    dependencies: string[];
  };
  module: ScenarioPure;
}

// Pure function to dynamically load all scenario modules
export async function loadScenarios(): Promise<LoadedScenario[]> {
  // Use dynamic imports for Node.js compatibility
  // This replaces import.meta.glob with a more portable approach
  const scenarioModules: (() => Promise<{ default: ScenarioPure }>)[] = [
    // Add your scenario modules here as needed
    // Example: () => import('./scenario1'),
    // Example: () => import('./scenario2'),
  ];

  const loadedScenarios: LoadedScenario[] = [];

  // Iterate over available modules
  for (const load of scenarioModules) {
    try {
      // Dynamically import the module
      const module = await load() as { default: ScenarioPure };
      const scenario = module.default;

      loadedScenarios.push({
        id: scenario.id,
        title: scenario.title,
        metadata: {
          description: scenario.description,
          version: scenario.version,
          dependencies: scenario.dependencies,
        },
        module: scenario,
      });
    } catch (error) {
      // Log errors for debugging; do not throw to maintain modularity
      console.warn(`Failed to load scenario:`, error);
    }
  }

  return loadedScenarios;
}

// Pure function to load a single scenario by ID
export async function loadScenarioById(id: string): Promise<LoadedScenario | undefined> {
  const scenarios = await loadScenarios();
  return scenarios.find(scenario => scenario.id === id);
}

// Pure function to extract metadata for all scenarios
export function extractMetadata(scenarios: LoadedScenario[]): Array<{ id: string; title: string; description: string; version: string; dependencies: string[] }> {
  return scenarios.map(scenario => ({
    id: scenario.id,
    title: scenario.title,
    description: scenario.metadata.description,
    version: scenario.metadata.version,
    dependencies: scenario.metadata.dependencies,
  }));
}

// Type exports for remix safety
export type { LoadedScenario, ScenarioPure };
