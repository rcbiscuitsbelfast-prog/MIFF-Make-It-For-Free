# StorySystemPure

Narrative hooks, story progression, and flag management system for the MIFF unified framework.

## Overview

StorySystemPure provides comprehensive narrative management with conditional branching, flag tracking, and story progression. It integrates with the broader MIFF/MHRF/WIFE ecosystem to provide rich storytelling and player choice systems.

## Features

- **Story Arc Management**: Create and manage complex story arcs with multiple nodes
- **Conditional Branching**: Support for complex story conditions and prerequisites
- **Flag System**: Track story flags and player state
- **Progress Tracking**: Monitor story completion and player progression
- **Reward Integration**: Integrate story rewards with game systems
- **Multi-format Export**: Export story data in various formats

## Schema

### StoryArc
```typescript
type StoryArc = {
  id: string;                    // Unique arc identifier
  name: string;                  // Arc display name
  description: string;           // Arc description
  nodes: Map<string, StoryNode>; // Story nodes
  startNode: string;             // Starting node ID
  endNodes: string[];            // Ending node IDs
  flags: Map<string, StoryFlag>; // Arc-specific flags
  progress: Map<string, StoryProgress>; // Progress tracking
  metadata: Record<string, any>; // Additional data
};
```

### StoryNode
```typescript
type StoryNode = {
  id: string;                    // Node identifier
  title: string;                 // Node title
  content: string;               // Node content
  type: 'narrative' | 'choice' | 'action' | 'cutscene' | 'battle' | 'exploration';
  conditions: StoryCondition[];  // Access conditions
  rewards: StoryReward[];        // Node rewards
  nextNodes: string[];           // Next node IDs
  metadata: Record<string, any>; // Additional data
};
```

## Usage

### CLI Commands

```bash
# Create a story arc
tsx cliHarness.ts createArc arc_data.json

# Start a story arc
tsx cliHarness.ts startArc main_story

# Advance to a specific node
tsx cliHarness.ts advanceToNode main_story chapter_1

# Set a story flag
tsx cliHarness.ts setFlag tutorial_completed true boolean "Tutorial completed"

# Check if flag exists
tsx cliHarness.ts hasFlag tutorial_completed

# Set player stat
tsx cliHarness.ts setStat level 5

# Get player stat
tsx cliHarness.ts getStat level

# Simulate story progression
tsx cliHarness.ts simulateStory main_story

# Get story statistics
tsx cliHarness.ts getStatistics
```

### Programmatic Usage

```typescript
import { StoryManager, StoryArc, StoryNode } from './Manager';

const storyManager = new StoryManager();

// Create a story arc
const arc: StoryArc = {
  id: 'main_story',
  name: 'Main Story',
  description: 'The primary story arc',
  nodes: new Map([
    ['start', {
      id: 'start',
      title: 'The Beginning',
      content: 'You wake up in a strange land...',
      type: 'narrative',
      conditions: [],
      rewards: [],
      nextNodes: ['choice_1'],
      metadata: {}
    }],
    ['choice_1', {
      id: 'choice_1',
      title: 'First Choice',
      content: 'What do you do?',
      type: 'choice',
      conditions: [],
      rewards: [],
      nextNodes: ['path_a', 'path_b'],
      metadata: {}
    }]
  ]),
  startNode: 'start',
  endNodes: ['ending'],
  flags: new Map(),
  progress: new Map(),
  metadata: { difficulty: 'normal' }
};

const result = storyManager.createArc(arc);
console.log(result.isValid); // true

// Start the arc
const storyResult = storyManager.startArc('main_story');
console.log(storyResult.status); // 'success'

// Set flags and stats
storyManager.setFlag('tutorial_completed', true, 'boolean', 'Tutorial completed');
storyManager.setStat('level', 5);
storyManager.setStat('xp', 1000);
```

## Integration

StorySystemPure integrates with:
- **ChainManagerPure**: For quest-based story progression
- **RaidSystemPure**: For raid-based story encounters
- **AIProfileIntegrationLayer**: For AI-driven story choices
- **CombatSystemPure**: For combat-based story nodes

## Condition Types

The system supports various condition types:

- **level**: Check player level
- **quest**: Check quest completion
- **item**: Check item possession
- **flag**: Check story flag state
- **stat**: Check player statistics
- **location**: Check player location
- **time**: Check game time

## Reward Types

Story rewards include:

- **xp**: Experience points
- **item**: Items and equipment
- **currency**: In-game currency
- **unlock**: Unlock new content
- **flag**: Set story flags
- **stat**: Modify player statistics
- **cutscene**: Unlock cutscenes

## Examples

### Sample Story Arc
```json
{
  "id": "tutorial_arc",
  "name": "Tutorial Arc",
  "description": "Learn the basics of the game",
  "nodes": {
    "start": {
      "id": "start",
      "title": "Welcome",
      "content": "Welcome to the game! Let's learn the basics.",
      "type": "narrative",
      "conditions": [],
      "rewards": [
        {
          "type": "xp",
          "amount": 100,
          "description": "Welcome bonus XP"
        }
      ],
      "nextNodes": ["movement_tutorial"],
      "metadata": {}
    },
    "movement_tutorial": {
      "id": "movement_tutorial",
      "title": "Movement Tutorial",
      "content": "Use WASD to move around.",
      "type": "action",
      "conditions": [],
      "rewards": [
        {
          "type": "flag",
          "id": "movement_learned",
          "description": "Movement tutorial completed"
        }
      ],
      "nextNodes": ["combat_tutorial"],
      "metadata": {}
    }
  },
  "startNode": "start",
  "endNodes": ["tutorial_complete"],
  "flags": {},
  "progress": {},
  "metadata": {
    "difficulty": "tutorial",
    "estimated_time": "10 minutes"
  }
}
```

## Testing

Run the CLI harness with sample data:

```bash
# Test arc creation
tsx cliHarness.ts createArc sample_arc.json

# Test story progression
tsx cliHarness.ts startArc tutorial_arc

# Test flag management
tsx cliHarness.ts setFlag movement_learned true boolean "Movement learned"

# Test simulation
tsx cliHarness.ts simulateStory tutorial_arc

# Test export functionality
tsx cliHarness.ts getStatistics --format=csv
```

## License

MIT License - See LICENSE.md for details.