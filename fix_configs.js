import fs from 'fs';

let content = fs.readFileSync('miff/pure/UnrealBridgePure/tests/golden_UnrealBridgePure.test.ts', 'utf8');

const baseConfig = `      enableDebugLogging: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableLiveReload: true,
      enableHotReload: true,
      enableBlueprintCompilation: true,
      enableAssetCooking: true,
      enableAssetBundles: true,
      enableStreamingAssets: true,
      enableAssetValidation: true,
      enableAssetOptimization: true,
      enableAssetCompression: true,
      enableAssetEncryption: false,
      enableEventBatching: true,
      enableEventCompression: true,
      enableEventEncryption: false,
      enableSceneValidation: true,
      enableSceneOptimization: true,
      enableSceneCompression: true,
      enableSceneEncryption: false,
      priorityQueues: ['high', 'medium', 'low', 'background'],
      maxBufferSize: 1000,
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
      tickGroup: 'TG_PostPhysics',
      replicationMode: 'none',
      collisionChannels: [],
      customSettings: {}`;

// Replace all incomplete configs
const patterns = [
  /const config: UnrealBridgeConfiguration = \{[^}]*bridgeType: UnrealBridgeType\.BLUEPRINT,[^}]*communicationProtocol: UnrealCommunicationProtocol\.MESSAGE_PASSING,[^}]*unrealVersion: '5\.1',[^}]*targetPlatform: 'windows',[^}]*\};/g,
  /const config: UnrealBridgeConfiguration = \{[^}]*bridgeType: UnrealBridgeType\.BLUEPRINT,[^}]*communicationProtocol: UnrealCommunicationProtocol\.MESSAGE_PASSING,[^}]*unrealVersion: '5\.1',[^}]*\};/g
];

for (const pattern of patterns) {
  content = content.replace(pattern, `    const config: UnrealBridgeConfiguration = {
      bridgeType: UnrealBridgeType.BLUEPRINT,
      communicationProtocol: UnrealCommunicationProtocol.MESSAGE_PASSING,
      unrealVersion: '5.1',
      targetPlatform: 'windows',
${baseConfig}
    };`);
}

fs.writeFileSync('miff/pure/UnrealBridgePure/tests/golden_UnrealBridgePure.test.ts', content);
console.log('Fixed configurations');
