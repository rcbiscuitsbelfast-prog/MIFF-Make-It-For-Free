// QuestSystemPure - Quest logic and progress tracking system

export interface QuestTrigger {
  type: 'talk' | 'collect' | 'defeat' | 'timer' | 'location' | 'interact';
  target?: string;
  amount?: number;
  seconds?: number;
  location?: { x: number; y: number; radius: number };
  completed: boolean;
}

export interface QuestReward {
  type: 'xp' | 'item' | 'currency' | 'unlock' | 'reputation';
  id?: string;
  amount?: number;
  granted: boolean;
}

export interface QuestStep {
  id: string;
  description: string;
  triggers: QuestTrigger[];
  next?: string | { branch: Array<{ when: string; next: string }> };
  completed: boolean;
  requiredTriggers: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  steps: Record<string, QuestStep>;
  start: string;
  rewards: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  currentStep: string;
  progress: number; // 0-100
  timed?: { seconds: number; startTime?: number };
  requirements?: string[]; // Quest IDs that must be completed first
}

export interface QuestState {
  quests: Record<string, Quest>;
  activeQuests: string[];
  completedQuests: string[];
  failedQuests: string[];
  playerStats: {
    level: number;
    xp: number;
    inventory: Record<string, number>;
    location: { x: number; y: number };
    reputation: Record<string, number>;
  };
}

export interface QuestEvent {
  type: 'start' | 'progress' | 'complete' | 'fail' | 'reset';
  questId: string;
  stepId?: string;
  triggerData?: {
    type: string;
    target?: string;
    amount?: number;
    location?: { x: number; y: number };
  };
  timestamp: number;
}

export interface QuestResult {
  questState: QuestState;
  events: QuestEvent[];
  completedQuests: string[];
  failedQuests: string[];
  rewardsGranted: QuestReward[];
}

/**
 * applyQuestEvent - Process quest events and update quest state
 * This is the main function that handles all quest logic
 */
export function applyQuestEvent(state: QuestState, event: QuestEvent): QuestResult {
  const newState = JSON.parse(JSON.stringify(state)) as QuestState;
  const newEvents: QuestEvent[] = [];
  const completedQuests: string[] = [];
  const failedQuests: string[] = [];
  const rewardsGranted: QuestReward[] = [];

  const quest = newState.quests[event.questId];
  if (!quest) {
    return { questState: newState, events: newEvents, completedQuests, failedQuests, rewardsGranted };
  }

  switch (event.type) {
    case 'start':
      if (canStartQuest(quest, newState)) {
        quest.status = 'active';
        quest.currentStep = quest.start;
        quest.progress = 0;
        if (quest.timed) {
          quest.timed.startTime = event.timestamp;
        }
        newState.activeQuests.push(event.questId);
        newEvents.push(event);
      }
      break;

    case 'progress':
      if (quest.status === 'active' && event.stepId) {
        const step = quest.steps[event.stepId];
        if (step && !step.completed) {
          // Check if trigger conditions are met
          if (checkTriggerConditions(step, event.triggerData, newState)) {
            step.completed = true;
            step.triggers.forEach(t => t.completed = true);
            
            // Move to next step or complete quest
            if (step.next) {
              if (typeof step.next === 'string') {
                quest.currentStep = step.next;
              } else {
                // Handle branching logic
                const nextStep = determineNextStep(step.next, newState);
                if (nextStep) {
                  quest.currentStep = nextStep;
                }
              }
            }
            
            // Update progress
            updateQuestProgress(quest);
            
            // Check if quest is complete
            if (isQuestComplete(quest)) {
              completeQuest(quest, newState, completedQuests, rewardsGranted);
            }
          }
        }
        newEvents.push(event);
      }
      break;

    case 'complete':
      if (quest.status === 'active') {
        completeQuest(quest, newState, completedQuests, rewardsGranted);
        newEvents.push(event);
      }
      break;

    case 'fail':
      if (quest.status === 'active') {
        quest.status = 'failed';
        newState.failedQuests.push(event.questId);
        const index = newState.activeQuests.indexOf(event.questId);
        if (index > -1) {
          newState.activeQuests.splice(index, 1);
        }
        failedQuests.push(event.questId);
        newEvents.push(event);
      }
      break;

    case 'reset':
      resetQuest(quest);
      newEvents.push(event);
      break;
  }

  return {
    questState: newState,
    events: newEvents,
    completedQuests,
    failedQuests,
    rewardsGranted
  };
}

/**
 * applyQuestEvents - Process multiple quest events in sequence
 */
export function applyQuestEvents(state: QuestState, events: QuestEvent[]): QuestResult {
  let currentState = state;
  let allEvents: QuestEvent[] = [];
  let allCompletedQuests: string[] = [];
  let allFailedQuests: string[] = [];
  let allRewardsGranted: QuestReward[] = [];

  for (const event of events) {
    const result = applyQuestEvent(currentState, event);
    currentState = result.questState;
    allEvents.push(...result.events);
    allCompletedQuests.push(...result.completedQuests);
    allFailedQuests.push(...result.failedQuests);
    allRewardsGranted.push(...result.rewardsGranted);
  }

  return {
    questState: currentState,
    events: allEvents,
    completedQuests: allCompletedQuests,
    failedQuests: allFailedQuests,
    rewardsGranted: allRewardsGranted
  };
}

/**
 * createQuest - Create a new quest with default state
 */
export function createQuest(
  id: string,
  title: string,
  description: string,
  steps: QuestStep[],
  start: string,
  rewards: QuestReward[],
  requirements?: string[],
  timed?: { seconds: number }
): Quest {
  const stepMap: Record<string, QuestStep> = {};
  steps.forEach(step => {
    stepMap[step.id] = {
      ...step,
      completed: false,
      requiredTriggers: step.triggers.length
    };
  });

  return {
    id,
    title,
    description,
    steps: stepMap,
    start,
    rewards: rewards.map(r => ({ ...r, granted: false })),
    status: 'available',
    currentStep: start,
    progress: 0,
    timed,
    requirements
  };
}

// Helper functions
function canStartQuest(quest: Quest, state: QuestState): boolean {
  if (quest.status !== 'available') return false;
  if (quest.requirements) {
    return quest.requirements.every(reqId => 
      state.completedQuests.includes(reqId)
    );
  }
  return true;
}

function checkTriggerConditions(
  step: QuestStep,
  triggerData?: QuestEvent['triggerData'],
  state?: QuestState
): boolean {
  if (!triggerData) return false;
  
  return step.triggers.some(trigger => {
    switch (trigger.type) {
      case 'talk':
        return triggerData.type === 'talk' && triggerData.target === trigger.target;
      case 'collect':
        return triggerData.type === 'collect' && 
               triggerData.target === trigger.target && 
               (triggerData.amount || 1) >= (trigger.amount || 1);
      case 'defeat':
        return triggerData.type === 'defeat' && 
               triggerData.target === trigger.target && 
               (triggerData.amount || 1) >= (trigger.amount || 1);
      case 'location':
        if (triggerData.type === 'location' && trigger.location && state?.playerStats.location) {
          const dx = triggerData.location.x - trigger.location.x;
          const dy = triggerData.location.y - trigger.location.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= trigger.location.radius;
        }
        return false;
      case 'timer':
        return triggerData.type === 'timer';
      case 'interact':
        return triggerData.type === 'interact' && triggerData.target === trigger.target;
      default:
        return false;
    }
  });
}

function determineNextStep(branch: QuestStep['next'], state: QuestState): string | undefined {
  if (typeof branch === 'string') return branch;
  
  if (branch && 'branch' in branch) {
    // Simple branching logic - could be enhanced with more complex conditions
    for (const rule of branch.branch) {
      if (rule.when === 'default' || rule.when === 'success') {
        return rule.next;
      }
    }
  }
  return undefined;
}

function updateQuestProgress(quest: Quest): void {
  const totalSteps = Object.keys(quest.steps).length;
  const completedSteps = Object.values(quest.steps).filter(s => s.completed).length;
  quest.progress = Math.round((completedSteps / totalSteps) * 100);
}

function isQuestComplete(quest: Quest): boolean {
  return Object.values(quest.steps).every(step => step.completed);
}

function completeQuest(
  quest: Quest,
  state: QuestState,
  completedQuests: string[],
  rewardsGranted: QuestReward[]
): void {
  quest.status = 'completed';
  quest.progress = 100;
  
  // Grant rewards
  quest.rewards.forEach(reward => {
    if (!reward.granted) {
      reward.granted = true;
      rewardsGranted.push(reward);
      
      // Apply reward effects
      switch (reward.type) {
        case 'xp':
          state.playerStats.xp += reward.amount || 0;
          break;
        case 'item':
          if (reward.id) {
            state.playerStats.inventory[reward.id] = (state.playerStats.inventory[reward.id] || 0) + (reward.amount || 1);
          }
          break;
        case 'currency':
          if (reward.id) {
            state.playerStats.inventory[reward.id] = (state.playerStats.inventory[reward.id] || 0) + (reward.amount || 0);
          }
          break;
        case 'reputation':
          if (reward.id) {
            state.playerStats.reputation[reward.id] = (state.playerStats.reputation[reward.id] || 0) + (reward.amount || 1);
          }
          break;
      }
    }
  });
  
  completedQuests.push(quest.id);
  const index = state.activeQuests.indexOf(quest.id);
  if (index > -1) {
    state.activeQuests.splice(index, 1);
  }
  // Also add to the state's completedQuests array
  if (!state.completedQuests.includes(quest.id)) {
    state.completedQuests.push(quest.id);
  }
}

function resetQuest(quest: Quest): void {
  quest.status = 'available';
  quest.progress = 0;
  quest.currentStep = quest.start;
  quest.rewards.forEach(r => r.granted = false);
  Object.values(quest.steps).forEach(step => {
    step.completed = false;
    step.triggers.forEach(t => t.completed = false);
  });
  if (quest.timed) {
    quest.timed.startTime = undefined;
  }
}