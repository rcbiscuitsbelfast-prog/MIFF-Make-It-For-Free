# RaidSystemPure

Enemy scaling, raid management, and encounter simulation system for the MIFF unified framework.

## Overview

RaidSystemPure provides comprehensive raid management with difficulty scaling, party management, and real-time encounter simulation. It integrates with the broader MIFF/MHRF/WIFE ecosystem to provide challenging group content and boss encounters.

## Features

- **Boss Management**: Create and scale bosses for different difficulty levels
- **Party Management**: Track party composition and statistics
- **Encounter Simulation**: Real-time raid encounter processing
- **Loot System**: Dynamic loot generation based on performance
- **Performance Analytics**: Track raid statistics and player performance
- **Multi-difficulty Scaling**: Support for normal, heroic, mythic, and legendary difficulties

## Schema

### RaidBoss
```typescript
type RaidBoss = {
  id: string;                    // Unique boss identifier
  name: string;                  // Boss display name
  level: number;                 // Boss level
  health: number;                // Current health
  maxHealth: number;             // Maximum health
  attack: number;                // Attack power
  defense: number;               // Defense value
  abilities: RaidAbility[];      // Boss abilities
  lootTable: LootEntry[];        // Loot drops
  scalingFactor: number;         // Difficulty scaling
  metadata: Record<string, any>; // Additional boss data
};
```

### RaidParty
```typescript
type RaidParty = {
  id: string;                    // Party identifier
  name: string;                  // Party name
  members: RaidMember[];         // Party members
  averageLevel: number;          // Average member level
  totalHealth: number;           // Combined health
  totalDamage: number;           // Combined damage
  buffs: RaidEffect[];          // Active buffs
  debuffs: RaidEffect[];        // Active debuffs
};
```

## Usage

### CLI Commands

```bash
# Create a raid boss
tsx cliHarness.ts createBoss boss_data.json

# Create a raid party
tsx cliHarness.ts createParty party_data.json

# Start a raid encounter
tsx cliHarness.ts startEncounter dragon_boss party_1 heroic

# Process encounter events
tsx cliHarness.ts processEncounter encounter_123 events.json

# Complete encounter and get rewards
tsx cliHarness.ts completeEncounter encounter_123

# Simulate a complete raid
tsx cliHarness.ts simulateRaid dragon_boss party_1 mythic

# Get raid statistics
tsx cliHarness.ts getStatistics
```

### Programmatic Usage

```typescript
import { RaidManager, RaidBoss, RaidParty } from './Manager';

const raidManager = new RaidManager();

// Create a raid boss
const boss: RaidBoss = {
  id: 'dragon_boss',
  name: 'Ancient Dragon',
  level: 50,
  health: 10000,
  maxHealth: 10000,
  attack: 500,
  defense: 300,
  abilities: [
    {
      id: 'fire_breath',
      name: 'Fire Breath',
      description: 'Breathes fire on all enemies',
      cooldown: 10,
      damage: 200,
      effects: [],
      targetType: 'all',
      range: 5
    }
  ],
  lootTable: [
    {
      itemId: 'dragon_scale',
      dropRate: 0.8,
      quantity: 1,
      rarity: 'epic',
      requiredLevel: 45
    }
  ],
  scalingFactor: 1.0,
  metadata: { type: 'dragon', element: 'fire' }
};

raidManager.createBoss(boss);

// Create a raid party
const party: RaidParty = {
  id: 'party_1',
  name: 'Heroes of Light',
  members: [
    {
      id: 'tank_1',
      name: 'Guardian',
      level: 50,
      health: 5000,
      maxHealth: 5000,
      attack: 200,
      defense: 400,
      role: 'tank',
      abilities: ['taunt', 'shield_wall'],
      position: { x: 0, y: 0 }
    }
  ],
  averageLevel: 50,
  totalHealth: 5000,
  totalDamage: 200,
  buffs: [],
  debuffs: []
};

raidManager.createParty(party);

// Start encounter
const encounter = raidManager.startEncounter('dragon_boss', 'party_1', 'heroic');
```

## Integration

RaidSystemPure integrates with:
- **ChainManagerPure**: For raid-based quest chains
- **StorySystemPure**: For narrative raid encounters
- **AIProfileIntegrationLayer**: For AI-controlled raid members
- **CombatSystemPure**: For combat mechanics

## Difficulty Scaling

The system supports four difficulty levels:

- **Normal**: 1.0x scaling
- **Heroic**: 1.5x scaling  
- **Mythic**: 2.0x scaling
- **Legendary**: 3.0x scaling

Scaling affects:
- Boss health and damage
- Ability damage and cooldowns
- Loot drop rates
- Experience rewards

## Examples

### Sample Boss Data
```json
{
  "id": "orc_warlord",
  "name": "Orc Warlord",
  "level": 25,
  "health": 5000,
  "maxHealth": 5000,
  "attack": 150,
  "defense": 100,
  "abilities": [
    {
      "id": "berserker_rage",
      "name": "Berserker Rage",
      "description": "Increases attack power",
      "cooldown: 15,
      "damage": 0,
      "effects": [
        {
          "type": "buff",
          "value": 50,
          "duration": 10,
          "stackable": false,
          "description": "Increases attack by 50"
        }
      ],
      "targetType": "self",
      "range": 0
    }
  ],
  "lootTable": [
    {
      "itemId": "warlord_axe",
      "dropRate": 0.3,
      "quantity": 1,
      "rarity": "rare",
      "requiredLevel": 20
    }
  ],
  "scalingFactor": 1.0,
  "metadata": {
    "type": "orc",
    "faction": "horde"
  }
}
```

## Testing

Run the CLI harness with sample data:

```bash
# Test boss creation
tsx cliHarness.ts createBoss sample_boss.json

# Test party creation
tsx cliHarness.ts createParty sample_party.json

# Test encounter simulation
tsx cliHarness.ts simulateRaid orc_warlord party_1 normal

# Test export functionality
tsx cliHarness.ts getStatistics --format=csv
```

## License

MIT License - See LICENSE.md for details.