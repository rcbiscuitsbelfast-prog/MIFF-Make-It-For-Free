// ScenarioRegistry.ts
// Remix-safe registry for indexing MIFF scenarios
// Enables runtime loading of ScenarioPure objects without orchestration
// MIT License, Copyright (c) 2025 MIFF Community

// Placeholder types for scenarios not yet fully defined
interface TrialOfForgottenSpirit { id: string; title: string; description: string; }
interface EmberPact { id: string; title: string; description: string; }
interface WhispersFromHollowTree { id: string; title: string; description: string; }
interface TrialOfEchoes { id: string; title: string; description: string; }
interface SiegeOfEmberwatch { id: string; title: string; description: string; }
interface AltarOfForgottenNames { id: string; title: string; description: string; }
interface MirrorOfManyPaths { id: string; title: string; description: string; }
interface HarvestUnderRedMoon { id: string; title: string; description: string; }
interface SongOfSilentBell { id: string; title: string; description: string; }
interface PactOfTwinFlames { id: string; title: string; description: string; }
interface LabyrinthOfUnspokenTruths { id: string; title: string; description: string; }
interface CouncilOfFracturedBanner { id: string; title: string; description: string; }
interface StormboundExpanse { id: string; title: string; description: string; }
interface VaultOfThreeSigils { id: string; title: string; description: string; }
interface LoopBeneathLarkspire { id: string; title: string; description: string; }

// Type for scenario registry entries
interface ScenarioEntry {
  id: string;
  title: string;
  load: () => Promise<any>; // Dynamic import for scenario module
}

// Registry of all scenarios, mapping IDs to metadata and loaders
const ScenarioRegistry: ScenarioEntry[] = [
  {
    id: 'trial-of-forgotten-spirit',
    title: 'Trial of the Forgotten Spirit',
    load: () => Promise.resolve({ default: { id: 'trial-of-forgotten-spirit', title: 'Trial of the Forgotten Spirit', description: 'Placeholder scenario' } }),
  },
  {
    id: 'ember-pact',
    title: 'The Ember Pact',
    load: () => Promise.resolve({ default: { id: 'ember-pact', title: 'The Ember Pact', description: 'Placeholder scenario' } }),
  },
  {
    id: 'whispers-hollow-tree',
    title: 'Whispers from the Hollow Tree',
    load: () => Promise.resolve({ default: { id: 'whispers-hollow-tree', title: 'Whispers from the Hollow Tree', description: 'Placeholder scenario' } }),
  },
  {
    id: 'trial-of-echoes',
    title: 'The Trial of Echoes',
    load: () => Promise.resolve({ default: { id: 'trial-of-echoes', title: 'The Trial of Echoes', description: 'Placeholder scenario' } }),
  },
  {
    id: 'siege-of-emberwatch',
    title: 'Siege of the Emberwatch',
    load: () => Promise.resolve({ default: { id: 'siege-of-emberwatch', title: 'Siege of the Emberwatch', description: 'Placeholder scenario' } }),
  },
  {
    id: 'altar-forgotten-names',
    title: 'The Altar of Forgotten Names',
    load: () => Promise.resolve({ default: { id: 'altar-forgotten-names', title: 'The Altar of Forgotten Names', description: 'Placeholder scenario' } }),
  },
  {
    id: 'mirror-many-paths',
    title: 'The Mirror of Many Paths',
    load: () => Promise.resolve({ default: { id: 'mirror-many-paths', title: 'The Mirror of Many Paths', description: 'Placeholder scenario' } }),
  },
  {
    id: 'harvest-red-moon',
    title: 'Harvest Under the Red Moon',
    load: () => Promise.resolve({ default: { id: 'harvest-red-moon', title: 'Harvest Under the Red Moon', description: 'Placeholder scenario' } }),
  },
  {
    id: 'song-silent-bell',
    title: 'The Song of the Silent Bell',
    load: () => Promise.resolve({ default: { id: 'song-silent-bell', title: 'The Song of the Silent Bell', description: 'Placeholder scenario' } }),
  },
  {
    id: 'pact-twin-flames',
    title: 'The Pact of the Twin Flames',
    load: () => Promise.resolve({ default: { id: 'pact-twin-flames', title: 'The Pact of the Twin Flames', description: 'Placeholder scenario' } }),
  },
  {
    id: 'labyrinth-unspoken-truths',
    title: 'The Labyrinth of Unspoken Truths',
    load: () => Promise.resolve({ default: { id: 'labyrinth-unspoken-truths', title: 'The Labyrinth of Unspoken Truths', description: 'Placeholder scenario' } }),
  },
  {
    id: 'council-fractured-banner',
    title: 'Council of the Fractured Banner',
    load: () => Promise.resolve({ default: { id: 'council-fractured-banner', title: 'Council of the Fractured Banner', description: 'Placeholder scenario' } }),
  },
  {
    id: 'stormbound-expanse',
    title: 'Stormbound Expanse',
    load: () => Promise.resolve({ default: { id: 'stormbound-expanse', title: 'Stormbound Expanse', description: 'Placeholder scenario' } }),
  },
  {
    id: 'vault-three-sigils',
    title: 'Vault of the Three Sigils',
    load: () => Promise.resolve({ default: { id: 'vault-three-sigils', title: 'Vault of the Three Sigils', description: 'Placeholder scenario' } }),
  },
  {
    id: 'loop-beneath-larkspire',
    title: 'Loop Beneath Larkspire',
    load: () => Promise.resolve({ default: { id: 'loop-beneath-larkspire', title: 'Loop Beneath Larkspire', description: 'Placeholder scenario' } }),
  },
] as const;

// Pure function to get scenario metadata by ID
export function getScenario(id: string): ScenarioEntry | undefined {
  return ScenarioRegistry.find(entry => entry.id === id);
}

// Pure function to list all scenario IDs
export function listScenarios(): string[] {
  return ScenarioRegistry.map(entry => entry.id);
}

// Pure function to load all scenario metadata
export function getAllScenarios(): ScenarioEntry[] {
  return [...ScenarioRegistry];
}

// Type exports for remix safety
export type ScenarioRegistryType = typeof ScenarioRegistry;
export type ScenarioTypes =
  | TrialOfForgottenSpirit
  | EmberPact
  | WhispersFromHollowTree
  | TrialOfEchoes
  | SiegeOfEmberwatch
  | AltarOfForgottenNames
  | MirrorOfManyPaths
  | HarvestUnderRedMoon
  | SongOfSilentBell
  | PactOfTwinFlames
  | LabyrinthOfUnspokenTruths
  | CouncilOfFracturedBanner
  | StormboundExpanse
  | VaultOfThreeSigils
  | LoopBeneathLarkspire;

export default ScenarioRegistry;
