// ScenarioRunnerPure.ts
// Remix-safe stub for dry-running MIFF scenario logic
// Simulates objectives, triggers, and rewards without engine wiring
// MIT License, Copyright (c) 2025 MIFF Community

// Helper types for scenario simulation
interface ScenarioObjective {
  id: string;
  description: string;
  condition: () => boolean;
}

interface ScenarioTrigger {
  id: string;
  event: string;
  condition?: () => boolean;
  action: () => void;
}

interface ScenarioReward {
  id: string;
  type: 'item' | 'xp' | 'lore' | 'effect' | 'memory';
  value: string | number;
  target?: string;
}

interface ScenarioPure {
  id: string;
  title: string;
  description: string;
  objectives: ScenarioObjective[];
  triggers: ScenarioTrigger[];
  rewards: ScenarioReward[];
  dependencies: string[];
  version: string;
  author: string;
  license: string;
}

// Simulated state for dry-run testing
interface ScenarioState {
  id: string;
  objectives: { [id: string]: boolean };
  triggersFired: string[];
  rewardsGranted: string[];
}

// Pure function to initialize scenario state
export function initScenarioState(scenario: ScenarioPure): ScenarioState {
  const objectives: { [id: string]: boolean } = {};
  scenario.objectives.forEach(obj => {
    objectives[obj.id] = false;
  });
  return {
    id: scenario.id,
    objectives,
    triggersFired: [],
    rewardsGranted: [],
  };
}

// Pure function to simulate trigger evaluation
export function evaluateTriggers(
  scenario: ScenarioPure,
  state: ScenarioState,
  event: string,
  context: any = {}
): ScenarioState {
  const newState = { ...state };
  scenario.triggers
    .filter(trigger => trigger.event === event && (!trigger.condition || trigger.condition()))
    .forEach(trigger => {
      trigger.action();
      newState.triggersFired = [...newState.triggersFired, trigger.id];
    });
  return newState;
}

// Pure function to check objective completion
export function checkObjectives(scenario: ScenarioPure, state: ScenarioState): ScenarioState {
  const newState = { ...state };
  scenario.objectives.forEach(obj => {
    newState.objectives[obj.id] = obj.condition();
  });
  return newState;
}

// Pure function to grant rewards
export function grantRewards(scenario: ScenarioPure, state: ScenarioState): ScenarioState {
  const newState = { ...state };
  const allObjectivesMet = Object.values(newState.objectives).every(completed => completed);
  if (allObjectivesMet) {
    scenario.rewards.forEach(reward => {
      if (!newState.rewardsGranted.includes(reward.id)) {
        newState.rewardsGranted = [...newState.rewardsGranted, reward.id];
      }
    });
  }
  return newState;
}

// Pure function to simulate a scenario step
export function simulateStep(
  scenario: ScenarioPure,
  state: ScenarioState,
  event: string,
  context: any = {}
): ScenarioState {
  let newState = evaluateTriggers(scenario, state, event, context);
  newState = checkObjectives(scenario, newState);
  newState = grantRewards(scenario, newState);
  return newState;
}

// Type exports for remix safety
export type { ScenarioState, ScenarioPure };
