// ScenarioRegistry.ts
// Remix-safe registry for indexing MIFF scenarios
// Enables runtime loading of ScenarioPure objects without orchestration
// MIT License, Copyright (c) 2025 MIFF Community

import type { TrialOfForgottenSpirit } from './scenarios/trial-of-forgotten-spirit';
import type { EmberPact } from './scenarios/ember-pact';
import type { WhispersFromHollowTree } from './scenarios/whispers-hollow-tree';
import type { TrialOfEchoes } from './scenarios/trial-of-echoes';
import type { SiegeOfEmberwatch } from './scenarios/siege-of-emberwatch';
import type { AltarOfForgottenNames } from './scenarios/altar-forgotten-names';
import type { MirrorOfManyPaths } from './scenarios/mirror-many-paths';
import type { HarvestUnderRedMoon } from './scenarios/harvest-red-moon';
import type { SongOfSilentBell } from './scenarios/song-silent-bell';
import type { PactOfTwinFlames } from './scenarios/pact-twin-flames';
import type { LabyrinthOfUnspokenTruths } from './scenarios/labyrinth-unspoken-truths';

// Placeholder types for scenarios not yet fully defined
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
    load: () => import('./scenarios/trial-of-forgotten-spirit'),
  },
  {
    id: 'ember-pact',
    title: 'The Ember Pact',
    load: () => import('./scenarios/ember-pact'),
  },
  {
    id: 'whispers-hollow-tree',
    title: 'Whispers from the Hollow Tree',
    load: () => import('./scenarios/whispers-hollow-tree'),
  },
  {
    id: 'trial-of-echoes',
    title: 'The Trial of Echoes',
    load: () => import('./scenarios/trial-of-echoes'),
  },
  {
    id: 'siege-of-emberwatch',
    title: 'Siege of the Emberwatch',
    load: () => import('./scenarios/siege-of-emberwatch'),
  },
  {
    id: 'altar-forgotten-names',
    title: 'The Altar of Forgotten Names',
    load: () => import('./scenarios/altar-forgotten-names'),
  },
  {
    id: 'mirror-many-paths',
    title: 'The Mirror of Many Paths',
    load: () => import('./scenarios/mirror-many-paths'),
  },
  {
    id: 'harvest-red-moon',
    title: 'Harvest Under the Red Moon',
    load: () => import('./scenarios/harvest-red-moon'),
  },
  {
    id: 'song-silent-bell',
    title: 'The Song of the Silent Bell',
    load: () => import('./scenarios/song-silent-bell'),
  },
  {
    id: 'pact-twin-flames',
    title: 'The Pact of the Twin Flames',
    load: () => import('./scenarios/pact-twin-flames'),
  },
  {
    id: 'labyrinth-unspoken-truths',
    title: 'The Labyrinth of Unspoken Truths',
    load: () => import('./scenarios/labyrinth-unspoken-truths'),
  },
  {
    id: 'council-fractured-banner',
    title: 'Council of the Fractured Banner',
    load: () => import('./scenarios/council-fractured-banner'),
  },
  {
    id: 'stormbound-expanse',
    title: 'Stormbound Expanse',
    load: () => import('./scenarios/stormbound-expanse'),
  },
  {
    id: 'vault-three-sigils',
    title: 'Vault of the Three Sigils',
    load: () => import('./scenarios/vault-three-sigils'),
  },
  {
    id: 'loop-beneath-larkspire',
    title: 'Loop Beneath Larkspire',
    load: () => import('./scenarios/loop-beneath-larkspire'),
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
