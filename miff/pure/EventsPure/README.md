# EventsPure - Event Bus System

A lightweight, type-safe event bus system providing publish/subscribe functionality with string topic routing and disposable subscriptions for modular gameplay systems.

## Features

- **Type-Safe Events**: Full TypeScript support with proper type definitions
- **String Topic Routing**: Simple string-based event topics
- **Disposable Subscriptions**: Automatic cleanup with EventListener pattern
- **Performance Optimized**: Efficient handler management with Set-based storage
- **Error Handling**: Safe event handling with error isolation
- **Utility Functions**: Built-in utilities for common event patterns
- **Remix-Safe**: Clean separation of event producers and consumers

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { EventBus, EventListener } from 'miff-framework';

// Create event bus
const eventBus = new EventBus();

// Subscribe to events
const listener = eventBus.subscribe('player_action', (payload) => {
  console.log('Player action:', payload);
});

// Publish events
eventBus.publish('player_action', { type: 'jump', height: 2 });

// Clean up subscription
listener.dispose();
```

### Advanced Usage

```typescript
import { EventBus, EventUtils } from 'miff-framework';

const eventBus = new EventBus();

// One-time event listener
const onceListener = EventUtils.once(eventBus, 'game_over', (score) => {
  console.log('Final score:', score);
});

// Filtered event listener
const damageListener = EventUtils.filter(eventBus, 'combat', (payload) => payload.damage > 10, (payload) => {
  console.log('High damage taken:', payload.damage);
});

// Debounced event listener (only fires once per 500ms)
const updateListener = EventUtils.debounce(eventBus, 'position_update', 500, (position) => {
  console.log('Player position:', position);
});

// Publish events
eventBus.publish('game_over', 1250);
eventBus.publish('combat', { damage: 25, type: 'physical' });
eventBus.publish('position_update', { x: 100, y: 200 });
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
events> subscribe combat
events> subscribe quest
events> publish combat {"type": "attack", "damage": 25}
events> publish quest {"type": "complete", "questId": "village_help"}
events> list
events> demo
```

## API Reference

### Classes

#### EventBus
Main event bus class for managing subscriptions and publishing events.

**Constructor:**
- `constructor()` - Create new event bus instance

**Core Methods:**
- `publish(topic: string, payload?: any): void` - Publish event to topic
- `subscribe(topic: string, handler: (payload?: any) => void): IEventListener` - Subscribe to topic
- `getSubscriberCount(topic: string): number` - Get subscriber count for topic
- `getActiveTopics(): string[]` - Get all topics with subscribers
- `getTotalSubscriptions(): number` - Get total subscription count
- `clear(): void` - Clear all subscriptions

#### EventListener
Disposable wrapper for event subscriptions.

**Properties:**
- `topic: string` - The topic this listener is subscribed to
- `handler: (payload?: any) => void` - The event handler function
- `disposed: boolean` - Whether this listener has been disposed

**Methods:**
- `dispose(): void` - Dispose of this subscription
- `unsubscribe(): void` - Alias for dispose()

### Utility Functions

#### EventUtils
Static utility functions for common event patterns.

- `once(eventBus, topic, handler)` - Create one-time event listener
- `filter<T>(eventBus, topic, predicate, handler)` - Create filtered event listener
- `debounce(eventBus, topic, delayMs, handler)` - Create debounced event listener
- `throttle(eventBus, topic, intervalMs, handler)` - Create throttled event listener

### Interfaces

#### IEventListener
Event listener interface extending Disposable.

## Configuration

### Basic Configuration

```typescript
const eventBus = new EventBus();
```

### Advanced Configuration

```typescript
const eventBus = new EventBus();

// Event bus is stateless and doesn't require configuration
// All configuration is done through subscription and publishing patterns
```

## Examples

### Example 1: Combat System Events

```typescript
import { EventBus } from 'miff-framework';

const eventBus = new EventBus();

// Subscribe to combat events
eventBus.subscribe('combat_start', (data) => {
  console.log('Combat started:', data.enemies);
});

eventBus.subscribe('damage_dealt', (data) => {
  console.log(`Damage dealt: ${data.amount} to ${data.target}`);
});

eventBus.subscribe('combat_end', (data) => {
  console.log('Combat ended:', data.victory ? 'Victory!' : 'Defeat!');
});

// Simulate combat
eventBus.publish('combat_start', { enemies: ['goblin', 'orc'] });
eventBus.publish('damage_dealt', { amount: 25, target: 'goblin' });
eventBus.publish('damage_dealt', { amount: 30, target: 'orc' });
eventBus.publish('combat_end', { victory: true, xpGained: 150 });
```

### Example 2: Quest System Integration

```typescript
const questEvents = EventUtils.once(eventBus, 'quest_complete', (quest) => {
  console.log('Quest completed:', quest.name);
  // Unlock rewards, update UI, etc.
});

const progressEvents = eventBus.subscribe('quest_progress', (progress) => {
  console.log(`Quest progress: ${progress.current}/${progress.total}`);
  // Update progress bars, show hints, etc.
});

eventBus.publish('quest_progress', { questId: 'village_help', current: 3, total: 5 });
eventBus.publish('quest_complete', { questId: 'village_help', name: 'Help the Village' });
```

## Testing

```bash
# Run EventsPure tests
npm test -- --testPathPattern="EventsPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **NPCsPure**: NPC behavior events and interactions
- **QuestSystemPure**: Quest progress and completion events
- **CombatPure**: Combat state changes and damage events
- **AudioBridgePure**: Sound effect triggers via events

### Engine Bridges
- **Unity**: Event-driven component communication
- **Godot**: Signal system integration
- **Web**: DOM event bridge for web-based games

## Performance

- **Time Complexity**: O(1) for publish, O(n) for subscription management where n = handlers per topic
- **Space Complexity**: O(n) where n = total subscriptions
- **Optimization Tips**:
  - Use topic-specific event buses for better isolation
  - Clean up subscriptions promptly to avoid memory leaks
  - Consider using EventUtils.filter for conditional handling

## Troubleshooting

### Common Issues
1. **Events not firing**: Check topic string spelling and case sensitivity
2. **Memory leaks**: Ensure subscriptions are disposed when no longer needed
3. **Handler errors**: EventBus isolates errors but check console for details
4. **Performance issues**: Too many handlers per topic can slow down publishing

### Debug Tips
- Use `getActiveTopics()` and `getSubscriberCount()` for debugging
- Check `getTotalSubscriptions()` to monitor memory usage
- Enable error logging in production environments

## Contributing

### Adding Features
1. Follow established event naming conventions
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

- **v1.0.0**: Initial TypeScript implementation with core event bus functionality
- **v1.1.0**: Added EventUtils with common event patterns
- **v1.2.0**: Enhanced error handling and performance optimizations