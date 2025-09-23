# PerfPure - Performance Monitoring System

A comprehensive performance monitoring and profiling system for measuring execution time, analyzing bottlenecks, and optimizing modular gameplay systems. Supports high-resolution timing, benchmarking, and detailed performance analysis.

## Features

- **High-Resolution Timing**: Precise performance measurement using native performance APIs
- **Disposable Timers**: RAII-style timers that automatically log results on disposal
- **Performance Profiling**: Multi-timer profiling with statistical analysis
- **Benchmarking Tools**: Built-in benchmarking utilities for comparative analysis
- **Memory Management**: Efficient resource usage with proper cleanup
- **Type-Safe Operations**: Full TypeScript support with comprehensive interfaces
- **Cross-Platform**: Works in browsers and Node.js environments

## Installation

```bash
npm install miff-framework
```

## Usage

### Basic Usage

```typescript
import { PerfTimer } from 'miff-framework';

// Simple timing
using timer = new PerfTimer('My Operation');
// ... your code here
// Timer automatically logs when disposed

// Manual timing
const timer = new PerfTimer('Manual Operation');
timer.stop();
console.log(`Duration: ${timer.elapsedMs} ms`);
```

### Advanced Usage

```typescript
import { PerfTimer, HighResPerfTimer, PerfProfiler, PerfUtils } from 'miff-framework';

// High-resolution timing
const highResTimer = new HighResPerfTimer('Critical Operation');
try {
  // Your code here
} finally {
  highResTimer.dispose();
}

// Performance profiling
const profiler = new PerfProfiler();
const timer1 = profiler.start('Database Query');
const timer2 = profiler.start('Data Processing');

// ... operations ...

const result1 = profiler.stop('Database Query');
const result2 = profiler.stop('Data Processing');

console.log('Summary:', profiler.getSummary());

// Utility functions
const result = PerfUtils.measureSync('Array Sort', () => {
  const arr = [3, 1, 4, 1, 5];
  return arr.sort((a, b) => a - b);
});
```

### CLI Usage

```bash
# Start interactive CLI
node cliHarness.ts

# Example CLI session:
perf> timer "Array Operations"
perf> benchmark "Math Calculations" 1000
perf> profile "Game Loop"
perf> stop "Game Loop"
perf> demo
perf> test cpu
```

## API Reference

### Classes

#### PerfTimer
Disposable performance timer with automatic logging.

**Constructor:**
- `constructor(label, autoStart?)`

**Properties:**
- `elapsedMs: number` - Elapsed time in milliseconds
- `elapsedNs: number` - Elapsed time in nanoseconds
- `startTime: number` - Timer start timestamp
- `endTime?: number` - Timer end timestamp
- `isRunning: boolean` - Whether timer is currently running
- `isDisposed: boolean` - Whether timer has been disposed

**Methods:**
- `stop(): PerfResult` - Stop timer and return result
- `getCurrentResult(): PerfResult` - Get current result without stopping
- `getResult(): PerfResult` - Get result (must be stopped first)
- `reset(): void` - Reset and restart timer
- `dispose(): void` - Dispose timer and log result
- `toString(): string` - String representation

#### HighResPerfTimer
High-resolution timer using Performance API.

**Extends:** PerfTimer

**Additional Methods:**
- `getMeasures(): PerformanceMeasure[]` - Get performance measures

#### PerfProfiler
Multi-timer profiler with statistical analysis.

**Methods:**
- `start(label, highRes?): PerfTimer` - Start profiling session
- `stop(label): PerfResult | null` - Stop profiling session
- `getResults(): readonly PerfResult[]` - Get all results
- `getResultsForLabel(label): PerfResult[]` - Get results for label
- `getSummary(): PerfSummary` - Get statistical summary
- `clear(): void` - Clear all data
- `exportToJSON(): string` - Export results to JSON

### Interfaces

#### PerfResult
Performance measurement result.

**Properties:**
- `label: string` - Measurement identifier
- `durationMs: number` - Duration in milliseconds
- `durationNs: number` - Duration in nanoseconds
- `startTime: number` - Start timestamp
- `endTime: number` - End timestamp

#### PerfSummary
Performance statistics summary.

**Properties:**
- `totalMeasurements: number` - Total number of measurements
- `averageMs: number` - Average duration in milliseconds
- `minMs: number` - Minimum duration
- `maxMs: number` - Maximum duration
- `totalMs: number` - Total time across all measurements

### Utility Functions

#### PerfUtils
Static utility functions for common patterns.

- `measureSync<T>(label, fn): T` - Measure synchronous function
- `measureAsync<T>(label, fn): Promise<T>` - Measure asynchronous function
- `measureAndLog<T>(label, fn): T` - Measure and log result
- `benchmark(label, iterations, fn): PerfResult` - Run benchmark
- `measureMethod(originalMethod, context): Function` - Method decorator

## Configuration

### Basic Configuration

```typescript
import { PerfTimer } from 'miff-framework';

// Simple timer
const timer = new PerfTimer('My Operation');

// High-resolution timer
const highResTimer = new HighResPerfTimer('Critical Operation');
```

### Advanced Configuration

```typescript
import { PerfProfiler } from 'miff-framework';

const profiler = new PerfProfiler();

// Enable/disable profiling
profiler.enabled = true;

// Start multiple timers
const timer1 = profiler.start('Database Query');
const timer2 = profiler.start('Data Processing', true); // High resolution

// Stop and analyze
const result1 = profiler.stop('Database Query');
const summary = profiler.getSummary();
```

## Examples

### Example 1: Function Performance Measurement

```typescript
import { PerfUtils } from 'miff-framework';

function slowOperation(data: number[]): number {
  return data.reduce((sum, x) => {
    // Simulate complex calculation
    for (let i = 0; i < 1000; i++) {
      sum += Math.sin(x + i) * Math.cos(x - i);
    }
    return sum;
  }, 0);
}

const data = Array.from({ length: 100 }, () => Math.random() * 100);

const result = PerfUtils.measureSync('Slow Operation', () => {
  return slowOperation(data);
});

console.log('Result:', result);
```

### Example 2: Async Operation Profiling

```typescript
import { PerfUtils, PerfProfiler } from 'miff-framework';

const profiler = new PerfProfiler();

async function fetchData(url: string): Promise<any> {
  const fetchTimer = profiler.start('HTTP Request');
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } finally {
    profiler.stop('HTTP Request');
  }
}

async function processData(data: any): Promise<void> {
  const processTimer = profiler.start('Data Processing');
  try {
    // Simulate data processing
    await new Promise(resolve => setTimeout(resolve, 100));
  } finally {
    processTimer.stop();
  }
}

// Usage
const data = await PerfUtils.measureAsync('Complete Operation', async () => {
  const fetchedData = await fetchData('/api/data');
  await processData(fetchedData);
  return fetchedData;
});

console.log('Summary:', profiler.getSummary());
```

### Example 3: Benchmarking Algorithms

```typescript
import { PerfUtils } from 'miff-framework';

function bubbleSort(arr: number[]): number[] {
  const sorted = [...arr];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = 0; j < sorted.length - i - 1; j++) {
      if (sorted[j] > sorted[j + 1]) {
        [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
      }
    }
  }
  return sorted;
}

function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);

  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// Benchmark comparison
const testData = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));

const bubbleResult = PerfUtils.benchmark('Bubble Sort', 10, () => {
  bubbleSort([...testData]);
});

const quickResult = PerfUtils.benchmark('Quick Sort', 10, () => {
  quickSort([...testData]);
});

console.log('Bubble Sort:', bubbleResult.durationMs.toFixed(2), 'ms avg');
console.log('Quick Sort:', quickResult.durationMs.toFixed(2), 'ms avg');
```

### Example 4: Method Profiling Decorator

```typescript
import { PerfUtils } from 'miff-framework';

class GameEngine {
  @PerfUtils.measureMethod
  update(deltaTime: number): void {
    this.updatePhysics(deltaTime);
    this.updateAI(deltaTime);
    this.updateRendering(deltaTime);
  }

  @PerfUtils.measureMethod
  private updatePhysics(deltaTime: number): void {
    // Physics calculations
    for (let i = 0; i < 10000; i++) {
      // Simulate physics work
    }
  }

  @PerfUtils.measureMethod
  private updateAI(deltaTime: number): void {
    // AI calculations
    for (let i = 0; i < 5000; i++) {
      // Simulate AI work
    }
  }

  @PerfUtils.measureMethod
  private updateRendering(deltaTime: number): void {
    // Rendering calculations
    for (let i = 0; i < 20000; i++) {
      // Simulate rendering work
    }
  }
}

// Usage
const engine = new GameEngine();
engine.update(0.016); // Will log timing for each method
```

## Testing

```bash
# Run PerfPure tests
npm test -- --testPathPattern="PerfPure"

# Run CLI harness tests
node cliHarness.ts
```

## Integration

### With Other Modules
- **EventSystemPure**: Measure event processing performance
- **CombatPure**: Profile combat calculations
- **AIPure**: Benchmark AI decision-making
- **AssetLoaderPure**: Measure asset loading times

### Engine Bridges
- **Unity**: Integration with Unity Profiler
- **Godot**: Performance monitoring integration
- **Web**: Browser performance API integration

## Performance

- **Time Complexity**: O(1) for individual measurements
- **Space Complexity**: O(n) where n = number of active timers
- **Optimization Tips**:
  - Use HighResPerfTimer only when needed (higher overhead)
  - Clear profiler data periodically to avoid memory buildup
  - Use PerfUtils for simple one-off measurements
  - Disable profiling in production builds

## Troubleshooting

### Common Issues
1. **High overhead**: Use regular PerfTimer instead of HighResPerfTimer for non-critical measurements
2. **Memory leaks**: Always dispose timers properly or use using statements
3. **Inaccurate measurements**: Ensure warm-up time for JIT compilation
4. **Browser compatibility**: HighResPerfTimer requires Performance API support

### Debug Tips
- Use `toString()` method for quick timer inspection
- Check `isRunning` and `isDisposed` properties for timer state
- Use `getCurrentResult()` to inspect running timers
- Export results with `exportToJSON()` for analysis

## Contributing

### Adding Features
1. Follow established performance measurement patterns
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

- **v1.0.0**: Initial TypeScript implementation with core timing functionality
- **v1.1.0**: Added profiling and benchmarking utilities
- **v1.2.0**: Enhanced high-resolution timing and performance analysis