# ChainManagerPure

Quest chain linking, validation, and progress tracking system for the MIFF unified framework.

## Overview

ChainManagerPure provides comprehensive quest chain management with dependency resolution, progress tracking, and multi-format export capabilities. It integrates with the broader MIFF/MHRF/WIFE ecosystem to provide narrative progression and quest completion tracking.

## Features

- **Quest Chain Creation**: Create and validate quest chains with prerequisites
- **Progress Tracking**: Monitor completion status and progress percentage
- **Dependency Resolution**: Handle complex quest dependencies and circular dependency detection
- **Multi-format Export**: Export chains in JSON, YAML, and CSV formats
- **Statistics & Analytics**: Track chain completion rates and performance metrics

## Schema

### QuestChain
```typescript
type QuestChain = {
  id: string;                    // Unique chain identifier
  name: string;                  // Human-readable chain name
  description: string;           // Chain description
  quests: string[];             // Array of quest IDs in order
  prerequisites: string[];      // Required completed chains
  rewards: QuestChainReward[];  // Chain completion rewards
  metadata: Record<string, any>; // Additional chain data
};
```

### ChainProgress
```typescript
type ChainProgress = {
  chainId: string;              // Chain identifier
  completedQuests: string[];    // Completed quest IDs
  currentQuest?: string;        // Currently active quest
  progress: number;             // Completion percentage (0-100)
  status: 'locked' | 'available' | 'active' | 'completed';
  unlockedAt?: number;          // Timestamp when unlocked
  completedAt?: number;         // Timestamp when completed
};
```

## Usage

### CLI Commands

```bash
# Create a quest chain
tsx cliHarness.ts createChain chain_data.json

# Update quest progress
tsx cliHarness.ts updateProgress chain_1 quest_1 true

# Get chain information
tsx cliHarness.ts getChain chain_1

# Get all available chains
tsx cliHarness.ts getAvailableChains

# Export chain data
tsx cliHarness.ts exportChain chain_1 yaml

# Get chain statistics
tsx cliHarness.ts getStatistics
```

### Programmatic Usage

```typescript
import { ChainManager, QuestChain } from './Manager';

const chainManager = new ChainManager();

// Create a quest chain
const chain: QuestChain = {
  id: 'main_story',
  name: 'Main Story',
  description: 'The primary quest line',
  quests: ['tutorial', 'first_dungeon', 'boss_fight'],
  prerequisites: [],
  rewards: [
    { type: 'xp', amount: 1000, description: 'Main story completion XP' }
  ],
  metadata: { difficulty: 'normal' }
};

const result = chainManager.createChain(chain);
console.log(result.isValid); // true

// Update progress
const progress = chainManager.updateProgress('main_story', 'tutorial', true);
console.log(progress.progress); // 33
```

## Integration

ChainManagerPure integrates with:
- **QuestSystemPure**: For individual quest management
- **StorySystemPure**: For narrative progression
- **RaidSystemPure**: For raid-based quest chains
- **AIProfileIntegrationLayer**: For AI-driven quest progression

## Export Formats

- **JSON**: Full chain data with progress
- **YAML**: Human-readable chain structure
- **CSV**: Quest completion tracking

## Examples

### Sample Chain Data
```json
{
  "id": "tutorial_chain",
  "name": "Tutorial Chain",
  "description": "Learn the basics of the game",
  "quests": ["learn_movement", "learn_combat", "learn_crafting"],
  "prerequisites": [],
  "rewards": [
    {
      "type": "xp",
      "amount": 500,
      "description": "Tutorial completion XP"
    },
    {
      "type": "unlock",
      "id": "advanced_features",
      "description": "Unlock advanced game features"
    }
  ],
  "metadata": {
    "difficulty": "easy",
    "estimated_time": "30 minutes"
  }
}
```

## Testing

Run the CLI harness with sample data:

```bash
# Test chain creation
tsx cliHarness.ts createChain sample_chain.json

# Test progress tracking
tsx cliHarness.ts updateProgress tutorial_chain learn_movement true

# Test export functionality
tsx cliHarness.ts exportChain tutorial_chain csv --format=csv
```

## License

MIT License - See LICENSE.md for details.