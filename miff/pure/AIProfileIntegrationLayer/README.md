# AIProfileIntegrationLayer

Personality-driven behavior and skill modifier integration system for the MIFF unified framework.

## Overview

AIProfileIntegrationLayer provides comprehensive AI personality management with trait-based decision making, behavior modification, and learning systems. It integrates with the broader MIFF/MHRF/WIFE ecosystem to provide intelligent, personality-driven AI behavior.

## Features

- **Personality Traits**: Define and manage AI personality traits
- **Behavior Modifiers**: Apply situational behavior modifications
- **Skill Bonuses**: Calculate personality-based skill bonuses
- **Decision Making**: AI decision making with reasoning
- **Learning System**: Adaptive AI that learns from experience
- **Gameplay Integration**: Seamless integration with game systems

## Schema

### AIProfile
```typescript
type AIProfile = {
  id: string;                    // Unique profile identifier
  name: string;                  // Profile display name
  description: string;           // Profile description
  traits: PersonalityTrait[];    // Personality traits
  behaviorModifiers: BehaviorModifier[]; // Behavior modifiers
  skillBonuses: SkillBonus[];    // Skill bonuses
  preferences: AIPreference[];   // AI preferences
  metadata: Record<string, any>; // Additional data
};
```

### PersonalityTrait
```typescript
type PersonalityTrait = {
  id: string;                    // Trait identifier
  name: string;                  // Trait name
  value: number;                 // Trait value (-1 to 1)
  weight: number;                // Trait weight (0 to 1)
  description: string;           // Trait description
};
```

## Usage

### CLI Commands

```bash
# Create an AI profile
tsx cliHarness.ts createProfile profile_data.json

# Update an AI profile
tsx cliHarness.ts updateProfile profile_1 updates.json

# Get AI profile
tsx cliHarness.ts getProfile profile_1

# Make a decision
tsx cliHarness.ts makeDecision profile_1 combat actions.json

# Integrate with gameplay
tsx cliHarness.ts integrateWithGameplay profile_1 game_state.json

# Record learning data
tsx cliHarness.ts recordLearning profile_1 learning_data.json

# Simulate AI behavior
tsx cliHarness.ts simulateAI profile_1 game_state.json

# Get AI statistics
tsx cliHarness.ts getStatistics
```

### Programmatic Usage

```typescript
import { AIProfileIntegrationLayer, AIProfile, AIAction } from './Manager';

const aiLayer = new AIProfileIntegrationLayer();

// Create an AI profile
const profile: AIProfile = {
  id: 'aggressive_warrior',
  name: 'Aggressive Warrior',
  description: 'A bold and aggressive AI personality',
  traits: [
    {
      id: 'aggression',
      name: 'Aggression',
      value: 0.8,
      weight: 0.9,
      description: 'High aggression trait'
    },
    {
      id: 'cooperation',
      name: 'Cooperation',
      value: 0.2,
      weight: 0.3,
      description: 'Low cooperation trait'
    }
  ],
  behaviorModifiers: [
    {
      id: 'combat_aggression',
      name: 'Combat Aggression',
      type: 'aggression',
      value: 0.5,
      conditions: [
        {
          type: 'situation',
          target: 'combat',
          operator: 'contains',
          value: 'combat'
        }
      ],
      description: 'Increased aggression in combat'
    }
  ],
  skillBonuses: [
    {
      skillId: 'attack',
      skillName: 'Attack',
      bonus: 10,
      multiplier: 1.2,
      conditions: [],
      description: 'Attack bonus from aggression'
    }
  ],
  preferences: [
    {
      id: 'combat_style',
      name: 'Combat Style',
      type: 'combat_style',
      value: 'aggressive',
      weight: 0.8,
      description: 'Prefers aggressive combat'
    }
  ],
  metadata: { type: 'warrior', difficulty: 'normal' }
};

aiLayer.createProfile(profile);

// Make a decision
const actions: AIAction[] = [
  {
    id: 'attack_1',
    name: 'Attack',
    type: 'attack',
    target: 'enemy_1',
    parameters: { damage: 10 },
    confidence: 0.5,
    reasoning: 'Attack enemy'
  },
  {
    id: 'defend_1',
    name: 'Defend',
    type: 'defend',
    parameters: { defense: 5 },
    confidence: 0.3,
    reasoning: 'Defend against attack'
  }
];

const decision = aiLayer.makeDecision('aggressive_warrior', 'combat', actions);
console.log(decision.chosenAction.type); // 'attack'
```

## Integration

AIProfileIntegrationLayer integrates with:
- **ChainManagerPure**: For AI-driven quest progression
- **StorySystemPure**: For AI story choices
- **RaidSystemPure**: For AI raid behavior
- **CombatSystemPure**: For AI combat decisions

## Personality Traits

The system supports various personality traits:

- **Aggression**: Tendency toward aggressive behavior
- **Cooperation**: Tendency toward cooperative behavior
- **Caution**: Tendency toward cautious behavior
- **Curiosity**: Tendency toward exploratory behavior
- **Loyalty**: Tendency toward loyal behavior
- **Independence**: Tendency toward independent behavior

## Behavior Modifiers

Behavior modifiers adjust AI behavior based on conditions:

- **Situation**: Current game situation
- **Health**: AI health level
- **Ally Count**: Number of allies present
- **Enemy Count**: Number of enemies present
- **Time**: Game time factors
- **Location**: Current location

## Examples

### Sample AI Profile
```json
{
  "id": "cautious_mage",
  "name": "Cautious Mage",
  "description": "A careful and methodical AI personality",
  "traits": [
    {
      "id": "caution",
      "name": "Caution",
      "value": 0.7,
      "weight": 0.8,
      "description": "High caution trait"
    },
    {
      "id": "curiosity",
      "name": "Curiosity",
      "value": 0.6,
      "weight": 0.6,
      "description": "Moderate curiosity trait"
    }
  ],
  "behaviorModifiers": [
    {
      "id": "low_health_caution",
      "name": "Low Health Caution",
      "type": "caution",
      "value": 0.8,
      "conditions": [
        {
          "type": "health",
          "target": "current_health",
          "operator": "less",
          "value": 0.3
        }
      ],
      "description": "Increased caution when health is low"
    }
  ],
  "skillBonuses": [
    {
      "skillId": "magic_defense",
      "skillName": "Magic Defense",
      "bonus": 15,
      "multiplier": 1.3,
      "conditions": [],
      "description": "Magic defense bonus from caution"
    }
  ],
  "preferences": [
    {
      "id": "exploration_style",
      "name": "Exploration Style",
      "type": "exploration_style",
      "value": "methodical",
      "weight": 0.7,
      "description": "Prefers methodical exploration"
    }
  ],
  "metadata": {
    "type": "mage",
    "difficulty": "normal",
    "archetype": "support"
  }
}
```

## Testing

Run the CLI harness with sample data:

```bash
# Test profile creation
tsx cliHarness.ts createProfile sample_profile.json

# Test decision making
tsx cliHarness.ts makeDecision cautious_mage combat sample_actions.json

# Test gameplay integration
tsx cliHarness.ts integrateWithGameplay cautious_mage sample_game_state.json

# Test simulation
tsx cliHarness.ts simulateAI cautious_mage sample_game_state.json

# Test export functionality
tsx cliHarness.ts getStatistics --format=csv
```

## License

MIT License - See LICENSE.md for details.