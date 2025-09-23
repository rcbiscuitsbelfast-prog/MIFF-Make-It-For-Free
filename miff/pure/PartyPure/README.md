# PartyPure - Party Management System

A comprehensive party management system for handling player party members, party slots, KO handling, and revival mechanics. Supports party organization, member management, and status tracking for modular gameplay systems.

## Features

- **Party Slots**: Flexible party slot management with member assignment
- **KO Handling**: Track knocked-out members and revival mechanics
- **Member Management**: Add, remove, swap, and move party members
- **Status Tracking**: Real-time party status and combat effectiveness
- **Healing System**: Built-in healing and revival functionality
- **Event System**: Event-driven revival notifications
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces
- **Performance Optimized**: Efficient member lookup and status calculations

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { PartyManager, PartyUtils, IPartyMember } from 'miff-framework';

// Create a party
const party = new PartyManager(6);

// Create a party member
const hero: IPartyMember = {
  id: 'hero_1',
  name: 'Hero',
  maxHP: 100,
  currentHP: 85,
  isKO: false
};

// Add to party
party.addMember(hero);

// Check status
console.log('Party size:', party.memberCount);
console.log('Active members:', party.activeMemberCount);

// Heal party
party.healAll();
```

### Advanced Usage

```typescript
import { PartyManager, KOHandler, PartyUtils } from 'miff-framework';

const party = new PartyManager(6);
const koHandler = new KOHandler();

// Add revival listener
party.addRevivedListener((member) => {
  console.log(`${member.name} has been revived!`);
  koHandler.revive(member.id.toString());
});

// Create and add members
const warrior = PartyUtils.createPartyMember(1, 'Warrior', 120, 120);
const mage = PartyUtils.createPartyMember(2, 'Mage', 80, 60);

party.addMember(warrior);
party.addMember(mage);

// Simulate combat
mage.currentHP = 0; // Mage gets KO'd
koHandler.markKO('2');

// Heal party
const revived = party.healAll();
console.log('Revived members:', revived.length);
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
party> add "Hero" 100
party> add "Mage" 80
party> status
party> damage 0 25
party> heal 0
party> ko 1
party> revive 1
party> demo
```

## API Reference

### Classes

#### PartySlot
Represents a single party slot.

**Properties:**
- `member: IPartyMember | null` - The member in this slot
- `isEmpty: boolean` - Whether the slot is empty
- `isKO: boolean` - Whether the member is knocked out

**Methods:**
- `setMember(member): void` - Set the member in this slot
- `clear(): void` - Clear the slot
- `getActiveMember(): IPartyMember | null` - Get active (non-KO) member
- `healToFull(): boolean` - Heal member to full HP
- `takeDamage(amount): boolean` - Deal damage to member

#### PartyManager
Manages a collection of party slots.

**Constructor:**
- `constructor(maxSize?)`

**Properties:**
- `slots: readonly PartySlot[]` - All party slots
- `maxSize: number` - Maximum party size
- `memberCount: number` - Current number of members
- `activeMemberCount: number` - Number of active members
- `isFull: boolean` - Whether party is full
- `isEmpty: boolean` - Whether party is empty

**Methods:**
- `addMember(member): boolean` - Add member to first available slot
- `removeMember(memberId): boolean` - Remove member by ID
- `swapMembers(indexA, indexB): boolean` - Swap members between slots
- `moveMember(fromIndex, toIndex): boolean` - Move member to another slot
- `getMemberAt(index): IPartyMember | null` - Get member at slot index
- `getActiveMemberAt(index): IPartyMember | null` - Get active member at slot index
- `setMemberAt(index, member): boolean` - Set member at slot index
- `handleKO(memberId): boolean` - Mark member as KO
- `healAll(): IPartyMember[]` - Heal all members to full HP
- `getActiveMembers(): IPartyMember[]` - Get all active members
- `getKOMembers(): IPartyMember[]` - Get all KO members
- `hasKOMembers(): boolean` - Check if any members are KO
- `getStatusSummary(): PartyStatusSummary` - Get status summary
- `addRevivedListener(callback): void` - Add revival listener
- `removeRevivedListener(callback): void` - Remove revival listener
- `clear(): void` - Clear all slots

#### KOHandler
Handles tracking fainted spirits and revival events.

**Methods:**
- `markKO(spiritId): boolean` - Mark spirit as KO
- `revive(spiritId): boolean` - Revive fainted spirit
- `isFainted(spiritId): boolean` - Check if spirit is fainted
- `getFaintedSpiritIds(): string[]` - Get all fainted spirit IDs
- `getFaintedCount(): number` - Get count of fainted spirits
- `hasFaintedSpirits(): boolean` - Check if any spirits are fainted
- `clear(): void` - Clear all fainted status
- `addReviveListener(callback): void` - Add revival listener
- `removeReviveListener(callback): void` - Remove revival listener

### Interfaces

#### IPartyMember
Party member interface.

**Properties:**
- `id: number | string` - Unique identifier
- `spiritId?: string` - Spirit type identifier
- `name: string` - Display name
- `currentHP: number` - Current HP
- `maxHP: number` - Maximum HP
- `isKO: boolean` - Whether member is knocked out

#### PartyStatusSummary
Party status summary information.

**Properties:**
- `totalMembers: number` - Total number of members
- `activeMembers: number` - Number of active members
- `koMembers: number` - Number of KO members
- `totalHP: number` - Total current HP
- `totalMaxHP: number` - Total maximum HP
- `averageHPPercent: number` - Average HP percentage

### Utility Functions

#### PartyUtils
Static utility functions for common party operations.

- `createPartyMember(id, name, maxHP, currentHP?, spiritId?)` - Create party member
- `calculateEffectiveness(party)` - Calculate combat effectiveness (0-100%)
- `findLowestHPMember(party)` - Find member with lowest HP percentage
- `findHighestHPMember(party)` - Find member with highest HP percentage
- `getMembersByHP(party, ascending?)` - Get members sorted by HP percentage
- `getHealableMembers(party)` - Get members that can be healed
- `getCriticalMembers(party)` - Get members in critical condition (< 25% HP)

## Configuration

### Basic Party Setup

```typescript
import { PartyManager } from 'miff-framework';

const party = new PartyManager(4); // 4-member party

// Add members
const hero = { id: 1, name: 'Hero', maxHP: 100, currentHP: 85, isKO: false };
const mage = { id: 2, name: 'Mage', maxHP: 80, currentHP: 60, isKO: false };

party.addMember(hero);
party.addMember(mage);
```

### Advanced Party Setup

```typescript
import { PartyManager, KOHandler, PartyUtils } from 'miff-framework';

const party = new PartyManager(6);
const koHandler = new KOHandler();

// Configure revival handling
party.addRevivedListener((member) => {
  koHandler.revive(member.id.toString());
  console.log(`${member.name} revived!`);
});

// Create party with various member types
const members = [
  PartyUtils.createPartyMember(1, 'Tank', 150, 150),
  PartyUtils.createPartyMember(2, 'Healer', 100, 100),
  PartyUtils.createPartyMember(3, 'DPS', 120, 120),
  PartyUtils.createPartyMember(4, 'Support', 90, 90)
];

members.forEach(member => party.addMember(member));
```

## Examples

### Example 1: Basic Party Management

```typescript
import { PartyManager, PartyUtils } from 'miff-framework';

const party = new PartyManager(4);

// Create and add members
const warrior = PartyUtils.createPartyMember(1, 'Warrior', 120, 120);
const mage = PartyUtils.createPartyMember(2, 'Mage', 80, 60);

party.addMember(warrior);
party.addMember(mage);

console.log('Party size:', party.memberCount);
console.log('Active members:', party.activeMemberCount);

// Simulate damage
warrior.currentHP = 30; // Warrior takes damage
console.log('Warrior HP:', warrior.currentHP);

// Heal party
party.healAll();
console.log('Warrior HP after healing:', warrior.currentHP);
```

### Example 2: KO and Revival System

```typescript
import { PartyManager, KOHandler } from 'miff-framework';

const party = new PartyManager(4);
const koHandler = new KOHandler();

// Add revival listener
party.addRevivedListener((member) => {
  koHandler.revive(member.id.toString());
  console.log(`${member.name} has been revived!`);
});

// Create party
const hero = PartyUtils.createPartyMember(1, 'Hero', 100, 100);
const mage = PartyUtils.createPartyMember(2, 'Mage', 80, 80);

party.addMember(hero);
party.addMember(mage);

// Simulate KO
mage.currentHP = 0;
koHandler.markKO('2');
console.log('Mage KO status:', koHandler.isFainted('2'));

// Revive
mage.currentHP = mage.maxHP;
koHandler.revive('2');
console.log('Mage KO status after revival:', koHandler.isFainted('2'));
```

### Example 3: Party Status Analysis

```typescript
import { PartyManager, PartyUtils } from 'miff-framework';

const party = new PartyManager(6);

// Create diverse party
const members = [
  PartyUtils.createPartyMember(1, 'Tank', 150, 120),
  PartyUtils.createPartyMember(2, 'Healer', 100, 75),
  PartyUtils.createPartyMember(3, 'DPS', 120, 45), // Low HP
  PartyUtils.createPartyMember(4, 'Support', 90, 90)
];

members.forEach(member => party.addMember(member));

// Analyze party
const summary = party.getStatusSummary();
console.log('Party Summary:', summary);

const effectiveness = PartyUtils.calculateEffectiveness(party);
console.log('Combat Effectiveness:', effectiveness.toFixed(1) + '%');

const lowest = PartyUtils.findLowestHPMember(party);
console.log('Lowest HP Member:', lowest?.name, 'at', ((lowest?.currentHP || 0) / (lowest?.maxHP || 1) * 100).toFixed(1) + '%');

const critical = PartyUtils.getCriticalMembers(party);
console.log('Critical Members:', critical.map(m => m.name));
```

## Testing

```bash
# Run PartyPure tests
npm test -- --testPathPattern="PartyPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **HealthSystemPure**: Sync HP values with party members
- **EventSystemPure**: Trigger events on member KO/revival
- **CombatPure**: Track party member combat status
- **QuestSystemPure**: Update quest objectives based on party status

### Engine Bridges
- **Unity**: Party system integration
- **Godot**: Group management integration
- **Web**: Multiplayer party synchronization

## Performance

- **Time Complexity**: O(n) for party operations where n = party size
- **Space Complexity**: O(n) where n = number of party members
- **Optimization Tips**:
  - Cache frequently accessed member lists
  - Use event listeners for status changes
  - Batch operations when possible

## Troubleshooting

### Common Issues
1. **Member not found**: Check member ID type (string vs number)
2. **KO not registering**: Ensure member HP is set to 0 and KO handler is called
3. **Party full**: Check max party size and available slots
4. **Revival not working**: Verify both HP healing and KO handler revival

### Debug Tips
- Use `getStatusSummary()` for detailed party analysis
- Check `isKO` property on individual slots
- Monitor revival events with event listeners
- Verify member IDs are consistent across systems

## Contributing

### Adding Features
1. Follow established party management patterns
2. Add comprehensive tests for new functionality
3. Update this documentation
4. Ensure type safety with TypeScript

### Code Style
- Use TypeScript strict mode
- Follow ESLint configuration
- Maintain consistent naming (camelCase)
- Add JSDoc comments for all public APIs

## License

MIT

## Version History

- **v1.0.0**: Initial TypeScript implementation with core party management
- **v1.1.0**: Added KO handling and revival system
- **v1.2.0**: Enhanced status tracking and utility functions