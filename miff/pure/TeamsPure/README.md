# TeamsPure Module

## Overview

**TeamsPure** is a comprehensive team management system for the MIFF framework, designed to handle complex team compositions, validation rules, synergy calculations, and flexible team configurations. It supports multiplayer teams, party management, and advanced team composition mechanics.

## Features

### 🏆 Team Management
- **Active Team & Reserves**: Separate management of active team members and reserve spirits
- **Flexible Team Sizes**: Configurable team sizes from 1 to 10 members
- **Position-based Slots**: Specialized slots for different team positions (Front, Middle, Back, Support)
- **Team Templates**: Pre-configured team setups for different strategies

### 🔍 Validation System
- **Rule-based Validation**: Comprehensive team composition rules
- **Type Diversity**: Ensure balanced type coverage across the team
- **Level Balance**: Prevent teams with extreme level differences
- **Synergy Requirements**: Minimum synergy thresholds for team effectiveness
- **Custom Rule Sets**: Create specialized rules for different game modes

### ⚡ Synergy Calculations
- **Type Synergy**: Calculate effectiveness based on type combinations
- **Sync Level Integration**: Factor in spirit sync levels for team synergy
- **Level Synergy**: Balance considerations for team composition
- **Diversity Scoring**: Measure team diversity and balance

### 📊 Statistics & Analytics
- **Team Statistics**: Comprehensive stats tracking (HP, Attack, Defense, Speed totals)
- **Average Calculations**: Level, sync, and diversity averages
- **Power Ratings**: Calculate team power ratings based on composition
- **Synergy Analysis**: Detailed breakdown of team synergy factors

### 💾 Data Management
- **Import/Export**: JSON-based team serialization
- **Team Templates**: Save and load team configurations
- **Metadata Support**: Extensible team metadata system
- **Validation History**: Track team validation results over time

## Installation

```bash
npm install @miff/teams-pure
```

## Usage

### Basic Team Creation

```typescript
import { TeamManager, TeamRules, TeamUtils } from '@miff/teams-pure';

// Create a team manager
const manager = TeamManager.create();

// Create a balanced team
const team = manager.createTeam('My Team', 6);

// Add spirits to the team
const spirit = TeamUtils.createDefaultSpiritInstance();
spirit.name = 'Pikachu';
spirit.type = 'electric';
spirit.level = 25;

manager.addSpiritToTeam(team.teamId, spirit);
```

### Advanced Team Configuration

```typescript
import { TeamRules, Team } from '@miff/teams-pure';

// Create custom team rules
const rules = TeamRules.create(
  6,  // maxTeamSize
  true,  // requireTypeDiversity
  true,  // enableSyncSynergy
  false, // allowDuplicates
  true,  // requireBalance
  25,    // minAverageLevel
  20,    // maxLevelDifference
  ['fire', 'water', 'grass'], // requiredTypes
  [],    // forbiddenTypes
  0.7,   // minDiversityScore
  50     // minSyncSynergy
);

// Create team with custom rules
const team = Team.create('Competitive Team', 'High-level competitive team', 6, rules);
```

### Team Validation

```typescript
import { ValidationResult } from '@miff/teams-pure';

// Validate team composition
const validation = manager.validateTeam(team.teamId);

if (validation.isValid) {
  console.log('✅ Team is valid!');
  console.log('Synergy Score:', team.calculateSynergy());
  console.log('Diversity Score:', team.getDiversityScore());
} else {
  console.log('❌ Team validation failed:');
  validation.errors.forEach(error => console.log(`  • ${error}`));
  validation.warnings.forEach(warning => console.log(`  • ${warning}`));
}
```

### Team Statistics

```typescript
const stats = manager.getTeamStatistics(team.teamId);

console.log('Team Statistics:');
console.log(`Total Spirits: ${stats.totalSpirits}`);
console.log(`Active Spirits: ${stats.activeSpirits}`);
console.log(`Average Level: ${stats.averageLevel.toFixed(1)}`);
console.log(`Synergy: ${stats.synergy.toFixed(1)}%`);
console.log(`Total HP: ${stats.totalHp}`);
console.log(`Total Attack: ${stats.totalAttack}`);
```

### Export and Import

```typescript
// Export team to JSON
const exportData = manager.exportTeam(team.teamId);
console.log('Exported Team:', JSON.stringify(exportData, null, 2));

// Import team from JSON
const importResult = manager.importTeam(team.teamId, exportData);
if (importResult === TeamOperationResult.SUCCESS) {
  console.log('✅ Team imported successfully');
}
```

## API Reference

### Classes

#### TeamManager
Main interface for team operations.

**Methods:**
- `createTeam(teamName: string, maxSize?: number): ITeam`
- `deleteTeam(teamId: string): boolean`
- `getTeam(teamId: string): ITeam | null`
- `getAllTeams(): ITeam[]`
- `addSpiritToTeam(teamId: string, spirit: ISpiritInstance): TeamOperationResult`
- `removeSpiritFromTeam(teamId: string, spiritId: string): TeamOperationResult`
- `validateTeam(teamId: string): IValidationResult`
- `getTeamStatistics(teamId: string): Record<string, number>`
- `exportTeam(teamId: string): Record<string, any>`
- `importTeam(teamId: string, data: Record<string, any>): TeamOperationResult`

#### Team
Represents a single team with spirits and configuration.

**Methods:**
- `addSpirit(spirit: ISpiritInstance): TeamOperationResult`
- `removeSpirit(spiritId: string): TeamOperationResult`
- `swapSpirits(indexA: number, indexB: number): TeamOperationResult`
- `validate(): IValidationResult`
- `calculateSynergy(syncMap?: Map<string, number>): number`
- `getDiversityScore(): number`
- `getTotalStats(): Record<string, number>`
- `getAverageLevel(): number`
- `exportTeam(): Record<string, any>`
- `importTeam(data: Record<string, any>): void`

#### TeamRules
Defines validation rules and constraints for teams.

**Methods:**
- `validateTeam(team: ITeam, spiritSync?: Map<string, number>): IValidationResult`
- `getRuleDescription(): string`
- `clone(): TeamRules`

### Enums

#### TeamOperationResult
- `SUCCESS`: Operation completed successfully
- `FAILURE`: Operation failed
- `INVALID_INPUT`: Invalid input provided
- `TEAM_FULL`: Team is at maximum capacity
- `SPIRIT_NOT_FOUND`: Spirit not found in team
- `DUPLICATE_SPIRIT`: Spirit already exists in team
- `INVALID_TEAM_SIZE`: Team size violates rules

#### ValidationStatus
- `OK`: Validation passed
- `TOO_MANY_MEMBERS`: Team has too many members
- `DUPLICATE_SPECIES`: Duplicate species in team
- `INVALID_SYNERGY`: Team synergy too low
- `MISSING_REQUIREMENTS`: Missing required elements
- `INCOMPATIBLE_MEMBERS`: Incompatible team members

#### TeamPosition
- `FRONT`: Front-line position
- `MIDDLE`: Middle position
- `BACK`: Back-line position
- `SUPPORT`: Support position
- `RESERVE`: Reserve position

## Configuration

### Team Rules Configuration

```typescript
const rules = TeamRules.create({
  maxTeamSize: 6,
  requireTypeDiversity: true,
  enableSyncSynergy: true,
  allowDuplicates: false,
  requireBalance: true,
  minAverageLevel: 25,
  maxLevelDifference: 20,
  requiredTypes: ['fire', 'water', 'grass'],
  forbiddenTypes: ['dark', 'ghost'],
  minDiversityScore: 0.7,
  minSyncSynergy: 50
});
```

### Team Templates

```typescript
const template = {
  templateId: 'balanced_starter',
  name: 'Balanced Starter Team',
  description: 'A well-rounded team for new players',
  maxSize: 6,
  requiredPositions: [TeamPosition.FRONT, TeamPosition.MIDDLE, TeamPosition.BACK, TeamPosition.SUPPORT],
  recommendedTypes: ['fire', 'water', 'grass', 'electric'],
  requiredSpirits: [],
  bonuses: ['balanced_stats'],
  restrictions: [],
  isDefault: false
};
```

## Testing

```bash
# Run unit tests
npm test teams-pure

# Run with coverage
npm run test:coverage teams-pure

# Run integration tests
npm run test:integration teams-pure
```

## Examples

### Creating a Competitive Team

```typescript
import { TeamManager, TeamRules, TeamUtils } from '@miff/teams-pure';

const manager = TeamManager.create();
const team = manager.createTeam('Competitive Team', 6);

// Set competitive rules
team.rules = TeamRules.competitive();

// Add high-level spirits
const spirits = [
  { name: 'Dragonite', type: 'dragon', level: 55 },
  { name: 'Gyarados', type: 'water', level: 52 },
  { name: 'Snorlax', type: 'normal', level: 50 },
  // ... add more spirits
];

spirits.forEach(spiritData => {
  const spirit = TeamUtils.createDefaultSpiritInstance();
  Object.assign(spirit, spiritData);
  manager.addSpiritToTeam(team.teamId, spirit);
});

// Validate team
const validation = manager.validateTeam(team.teamId);
if (validation.isValid) {
  console.log('✅ Competitive team ready!');
  console.log(`Team Power: ${TeamUtils.calculateTeamPowerRating(team)}`);
}
```

### Team Synergy Analysis

```typescript
const synergy = TeamUtils.getTeamSynergyAnalysis(team, syncMap);

console.log('Team Synergy Analysis:');
console.log(`Overall Synergy: ${synergy.overallSynergy.toFixed(1)}%`);
console.log(`Diversity Score: ${(synergy.diversityScore * 100).toFixed(1)}%`);
console.log(`Type Breakdown:`, synergy.typeBreakdown);
console.log(`Recommendations:`, synergy.recommendations);
```

## Migration from C#

If migrating from the C# version:

1. **Update Spirit Interface**: Ensure your spirits implement `ISpiritInstance`
2. **Rule Conversion**: Convert C# team rules to `TeamRules` configuration
3. **Data Migration**: Use export/import for existing team data
4. **Validation Updates**: Update validation logic to use new system

## Integration

### With CombatPure
```typescript
import { CombatEngine } from '@miff/combat-pure';

const team = manager.getTeam(teamId);
const activeSpirits = team.spirits;

// Create combat engine with team
const engine = new CombatEngine();
team.spirits.forEach(spirit => {
  engine.addCombatant(spirit);
});
```

### With SyncPure
```typescript
import { SyncManager } from '@miff/sync-pure';

const syncManager = new SyncManager();
const syncMap = new Map<string, number>();

team.spirits.forEach(spirit => {
  const syncLevel = syncManager.getSyncLevel(spirit.instanceId);
  syncMap.set(spirit.instanceId, syncLevel);
});

// Use sync data for team calculations
const synergy = team.calculateSynergy(syncMap);
```

## Performance

- **Memory Efficient**: Optimized data structures for large teams
- **Fast Validation**: O(1) validation for most common operations
- **Scalable Design**: Supports teams up to 10 members efficiently
- **Lazy Calculations**: Statistics calculated only when needed

## Troubleshooting

### Common Issues

1. **Team validation fails**
   - Check team size limits
   - Verify type diversity requirements
   - Ensure sync levels meet minimums

2. **Poor team synergy**
   - Add more type diversity
   - Balance spirit levels
   - Increase sync levels with spirits

3. **Import/Export issues**
   - Verify JSON format
   - Check spirit interface compatibility
   - Ensure all required fields are present

### Debug Mode

```typescript
// Enable debug logging
process.env.DEBUG = 'teams-pure:*';

// Get detailed validation info
const validation = team.validate();
console.log('Validation Details:', validation.toJSON());
```

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility when possible

## License

MIT License - see LICENSE file for details.

## Version History

- **v1.0.0**: Initial release with core team management features
- **v1.1.0**: Added team templates and advanced validation
- **v1.2.0**: Performance optimizations and CLI tools
- **v1.3.0**: Enhanced synergy calculations and statistics

---

**TeamsPure** - Flexible, powerful team management for the modern game developer.