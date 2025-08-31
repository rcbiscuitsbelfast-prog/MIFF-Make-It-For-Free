# QuestSystemPure

A deterministic quest logic and progress tracking system for game scenarios.

## Overview

QuestSystemPure handles quest definitions, progress tracking, and completion logic in a pure, engine-agnostic manner. It processes quest events and maintains quest state, ensuring consistent behavior across different game engines and platforms.

## Core Concepts

### Quest Structure
- **Quest**: A complete quest with multiple steps, triggers, and rewards
- **QuestStep**: Individual objectives within a quest
- **QuestTrigger**: Conditions that must be met to complete a step
- **QuestReward**: Benefits granted upon quest completion

### Quest States
- `available`: Quest can be started
- `active`: Quest is in progress
- `completed`: Quest finished successfully
- `failed`: Quest failed (timed out, etc.)

### Trigger Types
- `talk`: Interact with specific NPCs
- `collect`: Gather required items
- `defeat`: Eliminate enemies
- `timer`: Complete within time limit
- `location`: Reach specific coordinates
- `interact`: Use specific objects

## Schema

### QuestTrigger
```typescript
interface QuestTrigger {
  type: 'talk' | 'collect' | 'defeat' | 'timer' | 'location' | 'interact';
  target?: string;           // Target entity/item
  amount?: number;           // Required quantity
  seconds?: number;          // Time limit
  location?: {               // Location coordinates
    x: number;
    y: number;
    radius: number;
  };
  completed: boolean;        // Completion status
}
```

### QuestStep
```typescript
interface QuestStep {
  id: string;                // Unique step identifier
  description: string;       // Human-readable description
  triggers: QuestTrigger[];  // Required triggers
  next?: string | {          // Next step or branching logic
    branch: Array<{ when: string; next: string }>
  };
  completed: boolean;        // Completion status
  requiredTriggers: number;  // Number of triggers needed
}
```

### Quest
```typescript
interface Quest {
  id: string;                // Unique quest identifier
  title: string;             // Quest title
  description: string;       // Quest description
  steps: Record<string, QuestStep>;  // All quest steps
  start: string;             // Starting step ID
  rewards: QuestReward[];    // Completion rewards
  status: QuestStatus;       // Current quest state
  currentStep: string;       // Active step ID
  progress: number;          // Completion percentage (0-100)
  timed?: {                  // Optional time limit
    seconds: number;
    startTime?: number;
  };
  requirements?: string[];    // Prerequisite quest IDs
}
```

### QuestState
```typescript
interface QuestState {
  quests: Record<string, Quest>;     // All available quests
  activeQuests: string[];            // Currently active quests
  completedQuests: string[];         // Finished quests
  failedQuests: string[];            // Failed quests
  playerStats: {                     // Player state
    level: number;
    xp: number;
    inventory: Record<string, number>;
    location: { x: number; y: number };
    reputation: Record<string, number>;
  };
}
```

## Usage

### Basic Quest Processing

```typescript
import { applyQuestEvents, QuestState, QuestEvent } from './index';

// Process multiple quest events
const result = applyQuestEvents(questState, questEvents);

// Check results
console.log('Completed quests:', result.completedQuests);
console.log('Rewards granted:', result.rewardsGranted);
```

### Single Event Processing

```typescript
import { applyQuestEvent } from './index';

// Process single quest event
const result = applyQuestEvent(questState, questEvent);

// Update state
questState = result.questState;
```

### Quest Creation

```typescript
import { createQuest } from './index';

const quest = createQuest(
  'quest_001',
  'First Steps',
  'Begin your adventure',
  [/* steps */],
  'step_1',
  [/* rewards */]
);
```

## CLI Harness

The CLI harness processes JSON input files containing quest state and events:

```bash
npx ts-node cliHarness.ts fixtures/quest_events.json
```

### Input Format
```json
{
  "state": {
    "quests": { /* quest definitions */ },
    "activeQuests": [],
    "completedQuests": [],
    "failedQuests": [],
    "playerStats": { /* player state */ }
  },
  "events": [
    {
      "type": "start",
      "questId": "quest_001",
      "timestamp": 1000
    }
  ]
}
```

### Output Format
```json
{
  "questState": { /* updated quest state */ },
  "events": [ /* processed events */ ],
  "completedQuests": [ /* newly completed quests */ ],
  "failedQuests": [ /* newly failed quests */ ],
  "rewardsGranted": [ /* newly granted rewards */ ]
}
```

## Remix-Safe Features

### Deterministic Behavior
- Same inputs always produce identical outputs
- No external dependencies or random elements
- Pure functions with no side effects

### State Immutability
- Input state is never modified directly
- New state objects are created for updates
- Original data remains unchanged

### Event-Driven Architecture
- All quest changes occur through events
- Event history provides audit trail
- Easy to replay or undo quest progress

### Validation
- Input validation ensures data integrity
- Quest requirements prevent invalid states
- Trigger conditions are explicitly defined

## Testing

Run the golden tests to verify deterministic behavior:

```bash
npm test -- systems/QuestSystemPure/tests/golden_QuestSystemPure.test.ts
```

### Test Coverage
- **Full Quest Flow**: Complete quest progression from start to finish
- **Partial Progress**: Quest state with incomplete steps
- **Quest Failure**: Handling of failed quests
- **Reward System**: Proper reward granting and player stat updates
- **State Transitions**: Correct quest status changes

## Integration

QuestSystemPure integrates with other Pure modules:

- **AssetManifestPure**: Validate quest-related assets
- **DialogueSystemPure**: Handle NPC interactions for talk triggers
- **InventorySystemPure**: Track item collection for collect triggers
- **CombatSystemPure**: Monitor enemy defeats for defeat triggers

## Extensibility

The system is designed for easy extension:

- **New Trigger Types**: Add custom trigger logic
- **Complex Branching**: Implement advanced quest flow control
- **Quest Chains**: Create dependent quest sequences
- **Dynamic Rewards**: Implement conditional reward systems

## Performance

- **Efficient State Updates**: Minimal object copying
- **Event Batching**: Process multiple events efficiently
- **Memory Management**: Clean state transitions
- **Scalability**: Handle hundreds of concurrent quests

## License

This module follows the same licensing as the parent project, ensuring remix-safe usage and distribution.