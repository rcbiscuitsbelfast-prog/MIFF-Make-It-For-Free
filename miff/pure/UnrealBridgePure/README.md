# UnrealBridgePure - Unreal Engine Bridge System

## Overview

UnrealBridgePure is a comprehensive bridge system that enables seamless integration between the MIFF game framework and Unreal Engine. It provides a robust communication layer, asset management, scene building, and event synchronization capabilities for deploying MIFF games to Unreal Engine.

## Features

- **🔌 Core Bridge Management**: Robust connection handling between MIFF and Unreal Engine
- **🎨 Payload Adaptation**: Convert RenderPayloadPure to Unreal-compatible formats
- **🏗️ Scene Building**: Compose complex Unreal scenes from MIFF data
- **📦 Asset Management**: Load, cache, and optimize Unreal assets
- **🔄 Event Synchronization**: Sync MIFF events with Unreal's event system
- **🧪 Testing Harness**: Complete CLI testing environment for Unreal Editor
- **⚡ Performance Monitoring**: Real-time performance metrics and optimization
- **🛡️ Type Safety**: Full TypeScript support with comprehensive interfaces

## Architecture

```
UnrealBridgePure/
├── index.ts                    # Main exports and types
├── Manager.ts                  # Core bridge logic (UnrealBridgeManager)
├── UnrealPayloadAdapterPure.ts # RenderPayloadPure to Unreal converter
├── UnrealSceneBuilderPure.ts   # Scene composition from MIFF data
├── UnrealAssetManagerPure.ts   # Asset loading, caching, optimization
├── UnrealEventSyncPure.ts      # MIFF to Unreal event synchronization
├── UnrealEditorHarnessPure.ts  # CLI harness for Unreal Editor testing
├── cli/
│   └── unreal-cli.ts           # Command-line interface
└── tests/
    ├── golden_UnrealBridgePure.test.ts    # Core module tests
    └── unrealEditorHarness.test.ts         # Harness tests
```

## Installation

The module is part of the MIFF framework and is automatically available. No additional installation is required.

## Quick Start

### Basic Bridge Setup

```typescript
import {
  UnrealBridgeManager,
  UnrealBridgeConfiguration,
  UnrealBridgeType,
  UnrealCommunicationProtocol
} from '../UnrealBridgePure';

const config: UnrealBridgeConfiguration = {
  bridgeType: UnrealBridgeType.BLUEPRINT,
  communicationProtocol: UnrealCommunicationProtocol.MESSAGE_PASSING,
  unrealVersion: '5.1',
  targetPlatform: 'windows',
  enableDebugLogging: true,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  maxMessageSize: 1024 * 1024,
  timeout: 5000,
  retryAttempts: 3,
  connectionPoolSize: 5,
  serializationFormat: 'json',
  compression: 'none',
  encryption: false,
  heartbeatInterval: 1000,
  reconnectInterval: 5000,
  bufferSize: 1024,
  queueSize: 100,
  batchSize: 10,
  threadPoolSize: 4,
  customSettings: {}
};

const bridge = new UnrealBridgeManager(config);
```

### Connecting to Unreal Engine

```typescript
// Connect to Unreal Editor
const connection = bridge.connect('editor_connection', UnrealCommunicationProtocol.MESSAGE_PASSING);
console.log('Connected:', connection.status);

// Send a message to Unreal
const message = {
  id: 'test_message',
  type: 'command' as const,
  source: 'miff_bridge',
  destination: 'unreal_editor',
  timestamp: Date.now(),
  payload: { action: 'create_actor', data: { name: 'TestActor' } },
  priority: 5,
  ttl: 5000,
  retries: 0,
  encrypted: false,
  compressed: false,
  metadata: {}
};

bridge.sendMessage(message);
```

### Using the Payload Adapter

```typescript
import { UnrealPayloadAdapterPure } from '../UnrealBridgePure/UnrealPayloadAdapterPure';

const adapter = new UnrealPayloadAdapterPure(bridge);

// Convert MIFF render payload to Unreal format
const conversionResult = await adapter.convertRenderPayload('payload_id');
if (conversionResult.success) {
  console.log(`Converted ${conversionResult.convertedAssets.length} assets`);
  console.log(`Created ${conversionResult.convertedActors.length} actors`);
}
```

### Building Scenes

```typescript
import { UnrealSceneBuilderPure } from '../UnrealBridgePure/UnrealSceneBuilderPure';

const sceneBuilder = new UnrealSceneBuilderPure(bridge);

// Build Unreal scene from MIFF data
const sceneResult = await sceneBuilder.buildUnrealScene('payload_id', 'scene_config');
if (sceneResult.success) {
  console.log(`Scene built: ${sceneResult.sceneId}`);
  console.log(`World created: ${sceneResult.worldId}`);
}
```

### Managing Assets

```typescript
import { UnrealAssetManagerPure } from '../UnrealBridgePure/UnrealAssetManagerPure';

const assetManager = new UnrealAssetManagerPure(bridge);

// Load an asset
const loadRequest = {
  id: 'load_request_1',
  assetId: 'test_mesh',
  priority: 1,
  dependencies: [],
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
  loadStrategy: 'eager' as const,
  streamingMode: 'none' as const,
  qualityLevel: 'high' as const,
  platform: 'windows',
  metadata: { test: true }
};

const loadResult = await assetManager.loadAsset(loadRequest);
if (loadResult.success) {
  console.log(`Asset loaded: ${loadResult.asset?.name}`);
}
```

### Event Synchronization

```typescript
import { UnrealEventSyncPure } from '../UnrealBridgePure/UnrealEventSyncPure';

const eventSync = new UnrealEventSyncPure(bridge);

// Sync MIFF event to Unreal
const testEvent = {
  id: 'combat_event',
  name: 'player_attack',
  source: 'combat_system',
  data: { damage: 25, target: 'enemy' },
  timestamp: Date.now(),
  eventType: 'actor_damage',
  category: 'combat',
  severity: 'medium',
  metadata: { test: true }
};

const synced = await eventSync.syncEvent(testEvent);
if (synced) {
  console.log('Event synchronized successfully');
}
```

### Using the Editor Harness

```typescript
import { UnrealEditorHarnessPure, UnrealEditorConfiguration } from '../UnrealBridgePure/UnrealEditorHarnessPure';

const editorConfig: UnrealEditorConfiguration = {
  projectPath: '/Game/MIFFProject',
  enginePath: '/Engine/UnrealEngine',
  buildConfiguration: 'development',
  targetPlatform: 'windows',
  enableLiveCoding: true,
  enableHotReload: true,
  enableBlueprintCompilation: true,
  enableAssetCooking: true,
  enablePakFileGeneration: true,
  enableShaderCompilation: true,
  enableLightingBuild: true,
  enableReflectionCapture: true,
  enableDistanceField: true,
  enableVirtualTexturing: true,
  enableNanite: true,
  enableLumen: true,
  enableRayTracing: true,
  enablePathTracing: true,
  enableDebugDraw: true,
  enableProfiling: true,
  enableMemoryTracking: true,
  enableNetworkSimulation: true,
  enableAIValidation: true,
  enablePhysicsValidation: true,
  enableRenderingValidation: true,
  enableAudioValidation: true,
  enableInputValidation: true,
  enableAssetValidation: true,
  enableEventValidation: true,
  enableSceneValidation: true,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  customSettings: {}
};

const harness = new UnrealEditorHarnessPure(
  bridgeManager,
  payloadAdapter,
  sceneBuilder,
  assetManager,
  eventSync,
  renderPayloadManager,
  sceneBuilderManager,
  editorConfig
);

// Connect to Unreal Editor
await harness.connect();

// Run tests
const testResults = await harness.runTests('all');
console.log(`Tests completed: ${testResults.filter(r => r.success).length}/${testResults.length}`);

// Run demos
const demoResult = await harness.runDemo('combat');
console.log(`Demo completed: ${demoResult.success}`);

// Disconnect
await harness.disconnect();
```

## CLI Usage

The module includes a comprehensive CLI harness for testing and integration:

### Basic Commands

```bash
# Connect to Unreal Editor
tsx unreal-cli.ts connect combat

# Run all tests
tsx unreal-cli.ts test all

# Run combat demo
tsx unreal-cli.ts demo combat

# Get status
tsx unreal-cli.ts status

# Export report
tsx unreal-cli.ts export scene markdown scene-report.md
```

### Available Operations

- `connect` - Connect to Unreal Editor
- `disconnect` - Disconnect from Unreal Editor
- `test` - Run tests (bridge, payload, scene, assets, events, integration, performance)
- `demo` - Run demos (combat, items, ai, scene, full, default)
- `status` - Get current status
- `config` - Manage configuration
- `export` - Export data (json, csv, markdown, html)
- `import` - Import data
- `simulate` - Run simulation
- `build` - Build Unreal project
- `validate` - Validate setup

### Example Usage

```bash
# Run full test suite
tsx unreal-cli.ts test all

# Run combat demo with custom config
tsx unreal-cli.ts demo combat '{"enableDebugLogging": true}' custom-config.json

# Export performance report
tsx unreal-cli.ts export performance markdown perf-report.md

# Validate Unreal setup
tsx unreal-cli.ts validate scene
```

## Testing

The module includes comprehensive test coverage:

```bash
# Run all tests
npm test -- unreal-cli.ts test all

# Run specific test suite
npm test -- unreal-cli.ts test bridge

# Run with coverage
npm run test:coverage -- unreal-cli.ts test all
```

### Test Suites

- **bridge**: Bridge manager and connection tests
- **payload**: Payload adapter conversion tests
- **scene**: Scene building and composition tests
- **assets**: Asset loading and management tests
- **events**: Event synchronization tests
- **integration**: Full system integration tests
- **performance**: Performance monitoring tests

## Integration with MIFF Modules

### CombatPure Integration

```typescript
// Sync combat events to Unreal
const combatEvent = {
  type: 'combat_attack',
  data: { attacker: 'player', target: 'enemy', damage: 25 },
  source: 'combat_system'
};

await eventSync.syncEvent(combatEvent);

// Convert combat assets
const combatPayload = renderPayloadManager.getPayload('combat_scene');
await payloadAdapter.convertRenderPayload(combatPayload.id);
```

### ItemsPure Integration

```typescript
// Sync item events to Unreal
const itemEvent = {
  type: 'item_use',
  data: { playerId: 'player1', itemId: 'health_potion' },
  source: 'item_system'
};

await eventSync.syncEvent(itemEvent);

// Load item assets
await assetManager.loadAsset({
  assetId: 'health_potion_mesh',
  priority: 2
});
```

### AIPure Integration

```typescript
// Sync AI decisions to Unreal
const aiEvent = {
  type: 'ai_decision',
  data: { agentId: 'ai_agent_1', decision: 'attack', confidence: 0.85 },
  source: 'ai_system'
};

await eventSync.syncEvent(aiEvent);

// Build AI navigation
await sceneBuilder.buildUnrealScene('ai_navigation_payload');
```

## Configuration

### Bridge Configuration

```typescript
const config: UnrealBridgeConfiguration = {
  bridgeType: UnrealBridgeType.BLUEPRINT,           // or CPP, EDITOR, RUNTIME
  communicationProtocol: 'message_passing',         // or shared_memory, network_sockets, file_system, database
  unrealVersion: '5.1',
  targetPlatform: 'windows',                        // or linux, mac, android, ios
  enableDebugLogging: true,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  maxMessageSize: 1024 * 1024,                      // 1MB
  timeout: 5000,                                    // 5 seconds
  retryAttempts: 3,
  connectionPoolSize: 5,
  serializationFormat: 'json',                      // or binary, xml
  compression: 'none',                              // or zlib, oodle
  encryption: false,
  heartbeatInterval: 1000,                          // 1 second
  reconnectInterval: 5000,                          // 5 seconds
  bufferSize: 1024,
  queueSize: 100,
  batchSize: 10,
  threadPoolSize: 4,
  customSettings: {
    enableAdvancedFeatures: true,
    optimizationLevel: 'high'
  }
};
```

### Editor Configuration

```typescript
const editorConfig: UnrealEditorConfiguration = {
  projectPath: '/Game/MIFFProject',
  enginePath: '/Engine/UnrealEngine',
  buildConfiguration: 'development',                // or debug, shipping
  targetPlatform: 'windows',
  enableLiveCoding: true,
  enableHotReload: true,
  enableBlueprintCompilation: true,
  enableAssetCooking: true,
  enablePakFileGeneration: true,
  enableShaderCompilation: true,
  enableLightingBuild: true,
  enableReflectionCapture: true,
  enableDistanceField: true,
  enableVirtualTexturing: true,
  enableNanite: true,
  enableLumen: true,
  enableRayTracing: true,
  enablePathTracing: true,
  enableDebugDraw: true,
  enableProfiling: true,
  enableMemoryTracking: true,
  enableNetworkSimulation: true,
  enableAIValidation: true,
  enablePhysicsValidation: true,
  enableRenderingValidation: true,
  enableAudioValidation: true,
  enableInputValidation: true,
  enableAssetValidation: true,
  enableEventValidation: true,
  enableSceneValidation: true,
  enablePerformanceMonitoring: true,
  enableErrorReporting: true,
  customSettings: {
    autoSaveInterval: 300,                          // 5 minutes
    maxUndoSteps: 100
  }
};
```

## Performance Monitoring

The bridge provides comprehensive performance monitoring:

```typescript
const metrics = bridge.getPerformanceMetrics();
console.log(`Frame Rate: ${metrics.frameRate}`);
console.log(`Memory Usage: ${metrics.memoryUsage}MB`);
console.log(`CPU Usage: ${metrics.cpuUsage}%`);

const stats = bridge.getStatistics();
console.log(`Messages: ${stats.totalMessages}`);
console.log(`Error Rate: ${(stats.errorRate * 100).toFixed(2)}%`);
console.log(`Active Connections: ${stats.activeConnections}`);
```

## Error Handling

The bridge includes robust error handling:

```typescript
try {
  const result = await payloadAdapter.convertRenderPayload('invalid_payload');
  if (!result.success) {
    console.error('Conversion failed:', result.errors);
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

## Best Practices

1. **Connection Management**: Always properly connect and disconnect
2. **Error Handling**: Check results and handle errors gracefully
3. **Performance Monitoring**: Monitor metrics regularly
4. **Resource Cleanup**: Dispose of assets when no longer needed
5. **Configuration**: Use appropriate settings for your target platform
6. **Testing**: Run comprehensive tests before deployment

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check Unreal Editor is running and accessible
2. **Asset Loading Failed**: Verify asset paths and dependencies
3. **Event Sync Issues**: Check event format and destination
4. **Performance Issues**: Monitor metrics and adjust batch sizes
5. **Memory Leaks**: Ensure proper cleanup of resources

### Debug Mode

Enable debug logging for detailed diagnostics:

```typescript
const config = {
  ...defaultConfig,
  enableDebugLogging: true,
  enablePerformanceMonitoring: true
};

const bridge = new UnrealBridgeManager(config);
```

## Contributing

When contributing to UnrealBridgePure:

1. Follow TypeScript best practices
2. Add comprehensive tests for new features
3. Update documentation
4. Ensure compatibility with existing MIFF modules
5. Test with multiple Unreal Engine versions

## License

This module is part of the MIFF framework and follows the same license terms.

## Support

For support and questions:

1. Check the test files for usage examples
2. Review the CLI harness for integration patterns
3. Monitor performance metrics for optimization opportunities
4. Use debug logging for troubleshooting