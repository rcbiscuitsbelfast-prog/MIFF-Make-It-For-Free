# NPCsPure

Comprehensive NPC management system including behavior simulation, quest integration, faction management, and location tracking for game development.

## Features

- **NPC Management**: Create, update, and manage NPCs with full lifecycle support
- **Behavior Simulation**: Simulate NPC behavior based on type and schedule
- **Quest Integration**: Link NPCs to quests and track quest assignments
- **Faction System**: Manage NPC factions and reputation
- **Location Tracking**: Track NPC positions and movement patterns
- **Export Support**: Export NPCs in multiple formats (JSON, manifest, summary, quests)

## CLI Usage

### Basic Commands

```bash
# Create a new NPC
node cliHarness.ts create --npc-id=guard_001 --name="Town Guard" --behavior=aggressive --faction=guards

# Get NPC details
node cliHarness.ts get --npc-id=npc_001

# Update NPC
node cliHarness.ts update --npc-id=npc_001 --name="Updated Name" --reputation=85

# List NPCs with filters
node cliHarness.ts list --zone-id=zone_village --behavior=quest_giver

# Simulate NPC behavior
node cliHarness.ts simulate --npc-id=npc_001 --duration=120

# Update NPC location
node cliHarness.ts update-location --npc-id=npc_001 --x=10 --y=20 --z=5

# Add quest to NPC
node cliHarness.ts add-quest --npc-id=npc_001 --quest-id=quest_001

# Get NPCs by behavior
node cliHarness.ts get-by-behavior --behavior=merchant

# Get NPCs by reputation
node cliHarness.ts get-by-reputation --min-rep=70 --max-rep=100

# Export NPCs
node cliHarness.ts export --format=manifest

# Get statistics
node cliHarness.ts stats

# Create demo NPCs
node cliHarness.ts demo
```

### Export Formats

- **JSON**: Raw NPC data
- **Manifest**: Complete export with metadata
- **Summary**: NPC statistics and overview
- **Quests**: NPCs with quest assignments

## API Usage

```typescript
import { NPCsManager, NPC } from './Manager';

const manager = new NPCsManager();

// Create NPC
const npc: NPC = {
  id: 'guard_001',
  name: 'Town Guard',
  stats: [
    { key: 'health', base: 150 },
    { key: 'strength', base: 20 }
  ],
  behavior: {
    type: 'aggressive',
    aggression: 30,
    curiosity: 20,
    loyalty: 80
  },
  location: { zoneId: 'town_gate', x: 10, y: 10 },
  questIds: [],
  movementPattern: { type: 'patrol', speed: 3, range: 15 },
  faction: 'town_guards',
  reputation: 60
};

const result = manager.createNPC(npc);

// Update NPC
manager.updateNPC('guard_001', { reputation: 75 });

// Simulate behavior
const simulation = manager.simulateNPC('guard_001', 60);

// Export NPCs
const exportData = manager.exportNPCs('manifest');
```

## NPC Structure

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

## Behavior Types

- **Passive**: Non-aggressive, friendly NPCs
- **Aggressive**: Hostile NPCs that attack
- **Friendly**: Helpful NPCs that assist players
- **Merchant**: NPCs that trade items
- **Quest Giver**: NPCs that provide quests

## Movement Patterns

- **Idle**: NPCs that stay in place
- **Patrol**: NPCs that follow a patrol route
- **Follow**: NPCs that follow a target
- **Wander**: NPCs that move randomly

## Faction System

NPCs can belong to factions with reputation tracking:
- **Village Elders**: High reputation, quest givers
- **Merchants**: Trading faction
- **Town Guards**: Protective faction
- **Bandits**: Hostile faction

## Quest Integration

```typescript
// Add quest to NPC
manager.addQuestToNPC('npc_001', 'quest_tutorial');

// Remove quest from NPC
manager.removeQuestFromNPC('npc_001', 'quest_tutorial');

// Get NPCs with quests
const questNPCs = manager.getNPCsWithQuests();
```

## Location Management

```typescript
// Update NPC location
manager.updateNPCLocation('npc_001', 100, 200, 0);

// Get NPCs in zone
const zoneNPCs = manager.getNPCsInZone('zone_village');

// Get NPCs by faction
const factionNPCs = manager.getNPCsByFaction('village_elders');
```

## Behavior Simulation

```typescript
// Simulate NPC behavior for 60 seconds
const simulation = manager.simulateNPC('npc_001', 60);

// Results include:
// - Events: What the NPC is doing
// - Interactions: NPC interactions with others
// - Duration: Simulation duration
```

## Statistics

```typescript
const stats = manager.getNPCStats();
// Returns:
// - Total NPCs
// - NPCs by behavior type
// - NPCs by faction
// - NPCs with quests
// - Average reputation
// - Total quest assignments
```

## Integration

NPCsPure integrates with:
- **QuestsPure**: Quest assignment and tracking
- **MovementPure**: Location and movement management
- **DialoguePure**: Dialogue tree management
- **FactionPure**: Faction and reputation systems

## Examples

### Creating a Quest Giver

```typescript
const questGiver: NPC = {
  id: 'elder_oak',
  name: 'Elder Oak',
  stats: [
    { key: 'health', base: 100 },
    { key: 'wisdom', base: 25 }
  ],
  behavior: {
    type: 'quest_giver',
    aggression: 0,
    curiosity: 80,
    loyalty: 90
  },
  location: { zoneId: 'village_center', x: 50, y: 50 },
  questIds: ['tutorial_quest', 'main_quest_1'],
  movementPattern: { type: 'idle', speed: 1 },
  faction: 'village_elders',
  reputation: 100
};

manager.createNPC(questGiver);
```

### Creating a Merchant

```typescript
const merchant: NPC = {
  id: 'merchant_sarah',
  name: 'Merchant Sarah',
  stats: [
    { key: 'health', base: 80 },
    { key: 'wisdom', base: 15 }
  ],
  behavior: {
    type: 'merchant',
    aggression: 10,
    curiosity: 60,
    loyalty: 70
  },
  location: { zoneId: 'market_square', x: 25, y: 25 },
  questIds: [],
  movementPattern: { type: 'patrol', speed: 2, range: 10 },
  faction: 'merchants',
  reputation: 75
};

manager.createNPC(merchant);
```

## Testing

Run the golden tests to verify functionality:

```bash
npm test -- --testPathPattern=NPCsPure
```

## License

MIT License - see LICENSE file for details.