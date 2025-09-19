# RNGPure - Deterministic Random Number Generation

A pure TypeScript implementation of deterministic, seedable random number generation for modular gameplay systems.

## Features

- **Deterministic**: Same seed always produces the same sequence
- **Seedable**: Reset with any seed for reproducible results
- **Pure**: No external dependencies or side effects
- **Thread-safe**: Designed for single-threaded use
- **Extensible**: Hook points for custom distributions

## Usage

### Basic Usage

```typescript
import { RNGProvider, createRNGProvider } from './index';

// Create a new RNG provider
const rng = new RNGProvider(12345);

// Generate random numbers
const randomInt = rng.nextInt(1, 10);        // Random integer between 1 and 9
const randomFloat = rng.nextFloat(0, 1);     // Random float between 0 and 1
const randomBool = rng.nextBool(0.7);        // 70% chance of true

// Reset with new seed
rng.reset(42);
```

### Utility Functions

```typescript
import { RNGUtils } from './index';

// Shuffle an array
const shuffled = RNGUtils.shuffle([1, 2, 3, 4, 5], rng);

// Pick random element
const randomElement = RNGUtils.pickRandom(['a', 'b', 'c'], rng);

// Generate random string
const randomString = RNGUtils.randomString(8, rng);
```

### CLI Usage

```bash
# Run with commands file
node cliHarness.ts commands.json

# Run with default command
node cliHarness.ts
```

## API Reference

### IRNGProvider Interface

- `nextInt(min: number, max: number): number` - Random integer in [min, max)
- `nextFloat(min: number, max: number): number` - Random float in [min, max)
- `nextBool(probability?: number): boolean` - Random boolean with probability
- `getSeed(): number` - Get current seed
- `reset(seed: number): void` - Reset with new seed

### RNGProvider Class

Implements `IRNGProvider` with additional features:

- `constructor(seed: number)` - Create with initial seed
- `onBeforeNext(): void` - Protected hook for custom behavior

### RNGUtils

Static utility functions:

- `shuffle<T>(array: T[], rng: IRNGProvider): T[]` - Shuffle array
- `pickRandom<T>(array: T[], rng: IRNGProvider): T | undefined` - Pick random element
- `randomString(length: number, rng: IRNGProvider, charset?: string): string` - Generate random string

## Testing

The module includes comprehensive golden tests that verify deterministic behavior:

```bash
npm test -- --testNamePattern="golden RNG flow"
```

## Migration from C#

This TypeScript implementation is a direct port of the C# version with:

- Same API surface
- Same deterministic behavior
- Same seed handling
- Additional utility functions

## License

MIT