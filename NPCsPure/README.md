# NPCsPure

**Schema Version**: v13  
**Module Type**: Core Gameplay  
**Dependencies**: SharedSchemaPure

## Overview

NPCsPure provides comprehensive NPC (Non-Player Character) management for the MIFF framework. It handles NPC creation, behavior simulation, location tracking, quest associations, and dialogue systems. The module is designed to integrate seamlessly with QuestsPure and MovementPure for complete character interaction systems.

## Features

- **NPC Management**: Create, update, delete, and query NPCs
- **Behavior Simulation**: AI-driven behavior patterns and daily schedules
- **Location Tracking**: Zone-based positioning with movement patterns
- **Quest Integration**: Associate NPCs with quests and quest chains
- **Dialogue System**: Branching dialogue trees with conditions and actions
- **Faction System**: NPC affiliations and reputation tracking
- **Inventory Support**: NPC item management and trading capabilities

## Schema v13

### Core Types

```typescript
interface NPC {
  id: EntityID;
  name: string;
  stats: StatBlock;
  behavior: NPBehavior;
  location: NPCLocation;
  questIds: EntityID[];
  movementPattern: MovementPattern;
  dialogueTree?: DialogueNode;
  inventory?: EntityID[];
  faction?: string;
  reputation?: number;
}
```

### Behavior Types
- `passive` - Non-aggressive, friendly NPCs
- `aggressive` - Hostile or territorial NPCs
- `friendly` - Helpful and cooperative NPCs
- `merchant` - Trading and commerce NPCs
- `quest_giver` - Quest distribution NPCs

### Movement Patterns
- `idle` - Stationary NPCs
- `patrol` - Guarding or patrolling NPCs
- `follow` - Following a target NPC
- `wander` - Random movement NPCs

## CLI Usage

### Commands

```bash
# List all NPCs
npx ts-node NPCsPure/cliHarness.ts list

# List NPCs with filter
npx ts-node NPCsPure/cliHarness.ts list zoneId=zone_village
npx ts-node NPCsPure/cliHarness.ts list behaviorType=merchant
npx ts-node NPCsPure/cliHarness.ts list faction=city_guards
npx ts-node NPCsPure/cliHarness.ts list hasQuest=true

# Create NPC from JSON file
npx ts-node NPCsPure/cliHarness.ts create sample_npcs.json

# Update NPC
npx ts-node NPCsPure/cliHarness.ts update npc_001 update_data.json

# Delete NPC
npx ts-node NPCsPure/cliHarness.ts delete npc_001

# Get NPC by ID
npx ts-node NPCsPure/cliHarness.ts get npc_001

# Simulate NPC behavior
npx ts-node NPCsPure/cliHarness.ts simulate npc_001 3600

# Dump all NPCs
npx ts-node NPCsPure/cliHarness.ts dump
```

### Output Format

All operations return standardized JSON output:

```json
{
  "op": "list|create|update|delete|get|simulate|dump",
  "status": "ok|error",
  "result": "NPC data or array",
  "issues": ["error messages if any"]
}
```

## Remix Hooks

### 1. Behavior Customization
Override default behavior patterns by extending the `NPBehavior` interface:

```typescript
// In your remix module
interface CustomBehavior extends NPBehavior {
  customTraits: string[];
  specialAbilities: string[];
}
```

### 2. Dialogue System Extension
Extend dialogue conditions and actions for custom interactions:

```typescript
// Add custom dialogue conditions
interface CustomDialogueCondition extends DialogueCondition {
  type: 'custom_check' | 'skill_requirement' | 'item_combination';
  customLogic: (npc: NPC, player: any) => boolean;
}
```

### 3. Movement Pattern Override
Customize movement patterns for specific NPC types:

```typescript
// In override.ts
export function getCustomMovementPattern(npc: NPC): MovementPattern {
  if (npc.behavior.type === 'merchant') {
    return {
      type: 'patrol',
      speed: 1.5,
      range: 8
    };
  }
  return npc.movementPattern;
}
```

### 4. Schedule Integration
Hook into daily schedules for custom activities:

```typescript
// Override schedule activities
export function getCustomSchedule(npc: NPC): DailySchedule {
  const baseSchedule = npc.behavior.schedule;
  return {
    activities: [
      ...baseSchedule.activities,
      {
        time: "20:00",
        activity: "custom_night_activity",
        location: { zoneId: 'zone_custom', x: 0, y: 0 }
      }
    ]
  };
}
```

## Dependencies

### Required
- **SharedSchemaPure**: Uses `EntityID` and `StatBlock` types

### Optional Integration
- **QuestsPure**: NPC quest associations and quest giver functionality
- **MovementPure**: Advanced movement patterns and pathfinding
- **InventoryPure**: NPC inventory management
- **DialogPure**: Enhanced dialogue system integration

## Sample Data

The module includes sample NPCs demonstrating various behavior types:

- **Elder Oak**: Quest giver with daily schedule
- **Merchant Sarah**: Merchant with patrol movement
- **Guard Captain Marcus**: Aggressive guard with complex schedule
- **Mystic Elara**: Friendly mystic with dialogue tree
- **Blacksmith Thorin**: Merchant with crafting quests

## Testing

Run golden tests to verify deterministic output:

```bash
npm test -- NPCsPure/tests/goldenNPCsPure.test.ts
```

Tests cover:
- NPC listing and filtering
- Creation and deletion operations
- Behavior simulation
- Integration with other modules

## Integration Examples

### With QuestsPure
```typescript
// Get all NPCs that give quests
const questGivers = manager.getNPCsWithQuests();

// Check if NPC has specific quest
const hasQuest = npc.questIds.includes('quest_tutorial');
```

### With MovementPure
```typescript
// Get NPCs in specific zone
const zoneNPCs = manager.getNPCsInZone('zone_village');

// Filter by movement pattern
const patrollingNPCs = npcs.filter(npc => 
  npc.movementPattern.type === 'patrol'
);
```

## License Notes

This module is part of the MIFF framework and follows the dual-license model:
- **AGPLv3**: Open source use with attribution
- **Commercial**: Paid license for commercial use without attribution

See `LICENSE.md` for full terms.