# LogPure

A comprehensive **logging and debugging system** for battle events, CLI playback, and golden validation. Supports structured log entries, battle replay, and deterministic validation of battle outcomes.

## ✨ Features

- **Structured Logging**: Immutable log entries with timestamps, categories, and metadata
- **Battle Event Tracking**: Specialized logging for battle phases, actions, and effects
- **Multiple Output Formats**: JSON, CSV, and console output with filtering
- **Log Validation**: Integrity checking and validation of log entries
- **Performance Monitoring**: Built-in performance logging and statistics
- **CLI Interface**: Interactive command-line testing and log management
- **Import/Export**: Save and load battle logs for analysis and replay

## 📦 Installation

```bash
npm install miff-logpure
```

## 🚀 Quick Start

```typescript
import {
  BattleLogger,
  BattleLogEntry,
  BattleResult,
  BattleEffect,
  LogUtils,
  LogCategory,
  LogLevel,
  BattlePhase
} from 'miff-logpure';

// Create logger
const logger = new BattleLogger();

// Log battle events
logger.logPhaseChange(BattlePhase.PRE_TURN);

const action = {
  actorId: 1,
  targetId: 2,
  moveId: 'fire_blast',
  debugNotes: 'Type advantage detected'
};

const result = BattleResult.withDamage(45);
logger.logAction(action, result);

const effect = BattleEffect.create('burn', 'Applied burn effect', 1, 2);
logger.logEffect(effect);

// Get statistics
const stats = logger.getStatistics();
console.log(`Logged ${stats.totalEntries} entries in ${stats.timeSpan}ms`);

// Export log
const jsonLog = logger.exportToJSON();
console.log('Battle log:', jsonLog);
```

## 📚 Core Concepts

### Log Categories

- **BATTLE**: Battle events, actions, and phase changes
- **SYSTEM**: System messages and initialization
- **AI**: AI decision making and evaluation
- **PERFORMANCE**: Performance metrics and timing
- **NETWORK**: Network events and communication
- **VALIDATION**: Validation results and integrity checks

### Log Levels

- **DEBUG**: Detailed debugging information
- **INFO**: General information messages
- **WARN**: Warning conditions
- **ERROR**: Error conditions
- **CRITICAL**: Critical system failures

### Battle Phases

- **PRE_TURN**: Preparation phase before turn starts
- **SELECT_ACTION**: AI decision making phase
- **RESOLVE_ACTION**: Action execution phase
- **TURN_END**: Cleanup phase after turn ends
- **BATTLE_END**: Battle completion phase

## 🔧 Basic Usage

### Creating Log Entries

```typescript
// System log entry
logger.logSystem('Battle system initialized', LogCategory.SYSTEM, LogLevel.INFO);

// Phase change
logger.logPhaseChange(BattlePhase.SELECT_ACTION);

// Battle action
const battleAction = {
  actorId: 1,
  targetId: 2,
  moveId: 'fire_blast',
  debugNotes: 'Type advantage: fire > water'
};

const actionResult = BattleResult.success(45, 'burned');
logger.logAction(battleAction, actionResult);

// Battle effect
const effect = BattleEffect.create(
  'burn',
  'Applied burn effect for 3 turns',
  1, // source actor
  2  // target actor
);
logger.logEffect(effect);

// Custom log entry
const customEntry = new BattleLogEntry(
  1,                    // actor ID
  'custom_event',       // action type
  2,                    // target ID
  'Custom result',      // result
  LogCategory.SYSTEM,   // category
  LogLevel.INFO,        // level
  'Custom debug info'   // debug notes
);
logger.entries.push(customEntry);
```

### Querying and Filtering Logs

```typescript
// Get all entries
const allEntries = logger.getAllEntries();

// Filter by category
const battleEntries = logger.getFilteredEntries({ category: LogCategory.BATTLE });

// Filter by level
const errorEntries = logger.getFilteredEntries({ level: LogLevel.ERROR });

// Filter by actor
const playerEntries = logger.getFilteredEntries({ actorId: 1 });

// Complex filter
const complexFilter: ILogFilter = {
  category: LogCategory.BATTLE,
  level: LogLevel.INFO,
  actorId: 1,
  startTime: Date.now() - 3600000, // Last hour
  limit: 100
};

const filteredEntries = logger.getFilteredEntries(complexFilter);

// Get entries by turn
const turn3Entries = logger.getEntriesByTurn(3);

// Get statistics
const stats = logger.getStatistics();
console.log(`Battle lasted ${stats.timeSpan}ms with ${stats.totalEntries} events`);
```

### Log Validation

```typescript
// Validate individual entry
const entry = logger.getAllEntries()[0];
const errors = LogUtils.validateLogEntry(entry);
if (errors.length > 0) {
  console.log('Entry validation errors:', errors);
}

// Validate entire log
const logHash = LogUtils.calculateLogHash(logger);
console.log('Log integrity hash:', logHash);

// Check log consistency
const isConsistent = LogUtils.validateLogConsistency(logger);
console.log('Log is consistent:', isConsistent);
```

## ⚡ Advanced Usage

### Performance Logging

```typescript
const startTime = performance.now();

// Your operation here
const result = someComplexOperation();

// Log performance
const duration = performance.now() - startTime;
LogUtils.createPerformanceEntry('complex_operation', duration, 0, {
  inputSize: 1000,
  outputSize: 500
});

// Automatic performance logging
const perfEntry = LogUtils.createPerformanceEntry(
  'database_query',
  150,
  1,
  { query: 'SELECT * FROM spirits', rows: 42 }
);
logger.entries.push(perfEntry);
```

### Validation Logging

```typescript
// Log validation results
const validationPassed = validateBattleState(battleState);

const validationEntry = LogUtils.createValidationEntry(
  'battle_state',
  validationPassed,
  validationPassed ? 'All checks passed' : 'Invalid battle state detected',
  0,
  { checks: ['hp_range', 'status_effects', 'turn_order'] }
);

logger.entries.push(validationEntry);
```

### Log Export and Import

```typescript
// Export to different formats
const jsonExport = logger.exportToJSON();
const csvExport = logger.exportToCSV();

// Save to file
fs.writeFileSync('battle_log.json', jsonExport);
fs.writeFileSync('battle_log.csv', csvExport);

// Import from file
const importedJson = fs.readFileSync('battle_log.json', 'utf8');
const importedLogger = BattleLogger.importFromJSON(importedJson);

// Merge multiple logs
const loggers = [logger1, logger2, logger3];
const mergedLogger = LogUtils.mergeLoggers(loggers);
```

### Custom Log Analysis

```typescript
// Analyze battle patterns
function analyzeBattlePatterns(logger: BattleLogger) {
  const entries = logger.getAllEntries();
  const battleEntries = entries.filter(e => e.category === LogCategory.BATTLE);

  const patterns = {
    mostUsedMove: '',
    averageDamage: 0,
    totalTurns: Math.max(...entries.map(e => e.turnNumber || 0)),
    actionFrequency: new Map<string, number>()
  };

  let totalDamage = 0;
  let damageCount = 0;

  battleEntries.forEach(entry => {
    // Count move usage
    patterns.actionFrequency.set(
      entry.actionType,
      (patterns.actionFrequency.get(entry.actionType) || 0) + 1
    );

    // Calculate damage stats
    if (entry.damageDealt) {
      totalDamage += entry.damageDealt;
      damageCount++;
    }
  });

  patterns.averageDamage = damageCount > 0 ? totalDamage / damageCount : 0;
  patterns.mostUsedMove = Array.from(patterns.actionFrequency.entries())
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

  return patterns;
}

// Use the analysis
const patterns = analyzeBattlePatterns(logger);
console.log('Battle Analysis:', patterns);
```

## 🛠️ CLI Usage

Run the interactive CLI for testing and log management:

```bash
# Run CLI
npx miff-logpure-cli

# Or run directly with tsx
npx tsx miff/pure/LogPure/cliHarness.ts
```

### CLI Commands

- `log [message]` - Add custom log entry
- `phase [phase]` - Log phase change
- `action [actor] [target] [move]` - Log battle action
- `effect [id] [desc] [source] [target]` - Log battle effect
- `show [filter]` - Show log entries (all, battle, system, errors, etc.)
- `stats` - Show log statistics
- `filter [category] [level]` - Set persistent filter
- `export [format] [filename]` - Export log (json, csv, console)
- `import [filename]` - Import log from JSON file
- `playback` - Toggle playback mode
- `clear` - Clear all logs
- `validate` - Validate log integrity
- `help` - Show help information

## 📊 API Reference

### Classes

#### `BattleLogger`
Core logging system with filtering and statistics.

**Methods:**
- `logPhaseChange(phase)` - Log battle phase transition
- `logAction(action, result)` - Log battle action
- `logEffect(effect)` - Log battle effect
- `logSystem(message, category?, level?)` - Log system message
- `logDebug(message, category?, actorId?, targetId?)` - Log debug message
- `logWarning(message, category?, actorId?, targetId?)` - Log warning
- `logError(message, category?, actorId?, targetId?)` - Log error
- `getAllEntries()` - Get all log entries
- `getFilteredEntries(filter)` - Get filtered entries
- `getEntriesByTurn(turnNumber)` - Get entries for specific turn
- `getStatistics()` - Get log statistics
- `clear()` - Clear all entries
- `exportToJSON()` - Export to JSON
- `exportToCSV()` - Export to CSV

#### `BattleLogEntry`
Immutable log entry with validation and formatting.

**Properties:**
- `timestampUtc: number` - Entry timestamp
- `actorId: number` - Actor performing action
- `actionType: string` - Type of action
- `targetId: number` - Target of action
- `result: string` - Action result
- `debugNotes?: string` - Debug information
- `phase?: string` - Battle phase
- `damageDealt?: number` - Damage dealt
- `statusApplied?: string` - Status effects
- `turnNumber?: number` - Turn number
- `category: LogCategory` - Log category
- `level: LogLevel` - Log level
- `metadata?: Record<string, any>` - Additional data

**Static Methods:**
- `createPhaseEntry(phase, turnNumber)` - Create phase entry
- `createActionEntry(action, result, turnNumber)` - Create action entry
- `createEffectEntry(effect, turnNumber)` - Create effect entry
- `createSystemEntry(message, category?, level?)` - Create system entry
- `fromJSON(data)` - Create from JSON

#### `BattleResult`
Battle action result container.

**Static Methods:**
- `success(damage?, statusApplied?)` - Create success result
- `failure()` - Create failure result
- `withDamage(damage)` - Create result with damage
- `withStatus(status)` - Create result with status

#### `BattleEffect`
Battle effect descriptor.

**Static Methods:**
- `create(effectId, description?, sourceActorId?, targetActorId?, metadata?)` - Create effect

### Enums

#### `LogCategory`
- `BATTLE` - Battle events
- `SYSTEM` - System messages
- `AI` - AI decisions
- `PERFORMANCE` - Performance metrics
- `NETWORK` - Network events
- `VALIDATION` - Validation results

#### `LogLevel`
- `DEBUG` - Debug information
- `INFO` - General information
- `WARN` - Warning conditions
- `ERROR` - Error conditions
- `CRITICAL` - Critical failures

#### `BattlePhase`
- `PRE_TURN` - Pre-turn preparation
- `SELECT_ACTION` - Action selection
- `RESOLVE_ACTION` - Action resolution
- `TURN_END` - Turn cleanup
- `BATTLE_END` - Battle completion

#### `LogOutputFormat`
- `JSON` - JSON format
- `CSV` - CSV format
- `CONSOLE` - Console format
- `TABLE` - Table format

### Utility Functions

#### `LogUtils.formatEntryForConsole(entry)`
Formats log entry for console display.

#### `LogUtils.getLevelIcon(level)`
Gets icon for log level.

#### `LogUtils.getCategoryIcon(category)`
Gets icon for log category.

#### `LogUtils.createFilter`
Pre-configured filter creators:
- `byCategory(category)`
- `byLevel(level)`
- `byActor(actorId)`
- `byTurn(turnNumber)`
- `byPhase(phase)`
- `byTimeRange(start, end)`
- `lastNEntries(count)`
- `errorsOnly()`
- `warningsAndAbove()`
- `battleEventsOnly()`
- `recentActivity(minutes)`

#### `LogUtils.validateLogEntry(entry)`
Validates log entry structure.

#### `LogUtils.mergeLoggers(loggers)`
Merges multiple loggers.

#### `LogUtils.createPerformanceEntry(operation, duration, actorId?, metadata?)`
Creates performance log entry.

#### `LogUtils.createValidationEntry(type, success, message, actorId?, metadata?)`
Creates validation log entry.

#### `LogUtils.calculateLogHash(logger)`
Calculates log integrity hash.

## ⚙️ Configuration

### Logger Configuration

```typescript
// Create logger with custom capacity
const logger = new BattleLogger(5000); // Max 5000 entries

// Create logger with default capacity
const defaultLogger = new BattleLogger();
```

### Log Entry Configuration

```typescript
// Create detailed log entry
const entry = new BattleLogEntry(
  1,                           // actor ID
  'fire_blast',               // action type
  2,                          // target ID
  'hit',                      // result
  LogCategory.BATTLE,         // category
  LogLevel.INFO,              // level
  'Type advantage applied',   // debug notes
  BattlePhase.RESOLVE_ACTION, // phase
  45,                         // damage dealt
  'burned',                   // status applied
  3,                          // turn number
  { effectiveness: 2.0 }      // metadata
);
```

### Filter Configuration

```typescript
// Simple filter
const simpleFilter: ILogFilter = {
  category: LogCategory.BATTLE,
  level: LogLevel.INFO
};

// Complex filter
const complexFilter: ILogFilter = {
  category: LogCategory.BATTLE,
  actorId: 1,
  startTime: Date.now() - 3600000, // Last hour
  endTime: Date.now(),
  limit: 100,
  offset: 0
};
```

## 🧪 Testing

```typescript
import { BattleLogger, BattleLogEntry, LogUtils, LogCategory, LogLevel } from 'miff-logpure';

// Create test logger
const logger = new BattleLogger();

// Add test entries
logger.logSystem('Test started', LogCategory.SYSTEM, LogLevel.INFO);
logger.logPhaseChange(BattlePhase.PRE_TURN);

// Test filtering
const systemEntries = logger.getFilteredEntries({
  category: LogCategory.SYSTEM
});

console.log(`Found ${systemEntries.length} system entries`);

// Test statistics
const stats = logger.getStatistics();
console.log(`Total entries: ${stats.totalEntries}`);

// Test validation
const entries = logger.getAllEntries();
entries.forEach(entry => {
  const errors = LogUtils.validateLogEntry(entry);
  if (errors.length > 0) {
    console.log('Validation errors:', errors);
  }
});

// Test export
const jsonLog = logger.exportToJSON();
const csvLog = logger.exportToCSV();
```

## 🔍 Integration Examples

### Battle System Integration

```typescript
// In battle system
class BattleSystem {
  private logger: BattleLogger;

  constructor() {
    this.logger = new BattleLogger();
  }

  startBattle(): void {
    this.logger.logPhaseChange(BattlePhase.PRE_TURN);
    this.logger.logSystem('Battle started', LogCategory.BATTLE, LogLevel.INFO);
  }

  executeTurn(spiritId: number, moveId: string, targetId: number): void {
    this.logger.logPhaseChange(BattlePhase.SELECT_ACTION);

    const action = { actorId: spiritId, moveId, targetId };
    const result = this.calculateResult(spiritId, moveId, targetId);

    this.logger.logAction(action, result);
  }

  applyEffect(effectId: string, sourceId: number, targetId: number): void {
    const effect = BattleEffect.create(effectId, undefined, sourceId, targetId);
    this.logger.logEffect(effect);
  }

  endBattle(winner?: number): void {
    this.logger.logPhaseChange(BattlePhase.BATTLE_END);
    this.logger.logSystem(
      winner ? `Battle ended - Spirit ${winner} wins` : 'Battle ended in draw',
      LogCategory.BATTLE,
      LogLevel.INFO
    );
  }

  getBattleLog(): string {
    return this.logger.exportToJSON();
  }
}
```

### Performance Monitoring Integration

```typescript
// In performance monitoring
class PerformanceMonitor {
  private logger: BattleLogger;

  constructor(logger: BattleLogger) {
    this.logger = logger;
  }

  measureOperation<T>(
    operation: () => T,
    operationName: string,
    actorId: number = 0,
    metadata?: Record<string, any>
  ): T {
    const startTime = performance.now();
    const result = operation();
    const duration = performance.now() - startTime;

    LogUtils.createPerformanceEntry(
      operationName,
      duration,
      actorId,
      metadata
    );

    return result;
  }

  logValidation(
    validationType: string,
    success: boolean,
    message: string,
    metadata?: Record<string, any>
  ): void {
    LogUtils.createValidationEntry(
      validationType,
      success,
      message,
      0,
      metadata
    );
  }
}
```

### Debugging Integration

```typescript
// In debugging system
class DebugSystem {
  private logger: BattleLogger;

  constructor(logger: BattleLogger) {
    this.logger = logger;
  }

  logDecision(
    actorId: number,
    decisionType: string,
    options: string[],
    chosenOption: string,
    reasoning: string
  ): void {
    const entry = new BattleLogEntry(
      actorId,
      `decision_${decisionType}`,
      0,
      chosenOption,
      LogCategory.AI,
      LogLevel.DEBUG,
      reasoning,
      undefined,
      undefined,
      undefined,
      undefined,
      { options, chosenOption }
    );

    this.logger.entries.push(entry);
  }

  logState(
    stateType: string,
    stateData: any,
    actorId: number = 0
  ): void {
    const entry = new BattleLogEntry(
      actorId,
      `state_${stateType}`,
      0,
      'recorded',
      LogCategory.SYSTEM,
      LogLevel.DEBUG,
      JSON.stringify(stateData),
      undefined,
      undefined,
      undefined,
      undefined,
      stateData
    );

    this.logger.entries.push(entry);
  }
}
```

## 📈 Performance

- **Memory Efficient**: Configurable log capacity with automatic trimming
- **Fast Filtering**: O(n) filtering with early termination
- **Minimal Overhead**: Lightweight logging with optional metadata
- **Scalable**: Handles thousands of log entries efficiently
- **Immutable Entries**: Thread-safe log entry structure

## 🔒 Security

- **Input Validation**: All log entries validated before storage
- **Safe Export**: Protected against log injection attacks
- **Integrity Checking**: Hash-based validation of log consistency
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🤝 Contributing

Contributions are welcome! Please see the main MIFF repository for guidelines.

## 📝 License

MIT License - see LICENSE file for details.

## 🔄 Migration from C#

LogPure is a TypeScript conversion of the original C# implementation. Key differences:

- **Type Safety**: Enhanced with TypeScript interfaces and validation
- **Immutability**: Log entries are immutable for thread safety
- **CLI Tools**: Added interactive testing interface
- **Documentation**: Comprehensive examples and API documentation
- **Export Formats**: Multiple export formats (JSON, CSV, Console)
- **Performance**: Optimized filtering and memory management

The core logging functionality remains identical to ensure compatibility with existing C# implementations.