# Federation Hooks for Persistent Scenario Replay

## 🔗 Overview

Federation hooks enable persistent scenario replay across multiple MIFF modules, allowing complex multi-system scenarios to be recorded, replayed, and orchestrated deterministically. This system supports Phase 18's goal of orchestration expansion and multi-agent coordination.

## 🎯 Federation Architecture

### Core Principles
- **Module Independence**: Each module maintains its own state and lifecycle
- **Event-Driven Coordination**: Modules communicate through standardized events
- **Deterministic Replay**: All federation operations are reproducible
- **Graceful Degradation**: Missing modules don't break the federation

### Federation Event Types
```typescript
interface FederationEvent {
  id: string;
  timestamp: number;
  sourceModule: string;
  targetModule?: string; // undefined = broadcast
  eventType: 'state_change' | 'request' | 'response' | 'notification';
  payload: any;
  metadata: {
    sessionId: string;
    frame: number;
    priority: number;
  };
}
```

## 🔧 Implementation Patterns

### 1. State Synchronization Hook
```typescript
// Example: DialoguePure → QuestSystemPure integration
const federationHook = {
  name: 'dialogue_quest_sync',
  source: 'DialoguePure',
  targets: ['QuestSystemPure', 'NPCsPure'],
  events: {
    'dialogue_completed': {
      handler: (event) => {
        // Update quest progress based on dialogue outcome
        const questUpdate = {
          questId: event.payload.questId,
          progress: event.payload.choices,
          flags: event.payload.finalFlags
        };
        return {
          target: 'QuestSystemPure',
          action: 'updateProgress',
          data: questUpdate
        };
      }
    }
  }
};
```

### 2. Cross-Module Orchestration
```typescript
// Example: Combat scenario with multiple systems
const combatOrchestrationHook = {
  name: 'combat_orchestration',
  participants: [
    'CombatPure',
    'HealthSystemPure', 
    'AudioPure',
    'VisualReplaySystemPure'
  ],
  lifecycle: {
    'combat_start': [
      {target: 'AudioPure', action: 'playMusic', data: {track: 'battle-theme'}},
      {target: 'VisualReplaySystemPure', action: 'startRecording', data: {scenario: 'combat'}}
    ],
    'damage_dealt': [
      {target: 'HealthSystemPure', action: 'applyDamage'},
      {target: 'AudioPure', action: 'playSFX', data: {sound: 'hit'}}
    ],
    'combat_end': [
      {target: 'AudioPure', action: 'fadeOutMusic', data: {duration: 2000}},
      {target: 'VisualReplaySystemPure', action: 'stopRecording'}
    ]
  }
};
```

### 3. Persistent Replay Chain
```typescript
// Example: Multi-module scenario replay
const persistentReplayHook = {
  name: 'grove_exploration_chain',
  modules: ['DialoguePure', 'QuestSystemPure', 'InventoryPure', 'AudioPure'],
  replaySequence: [
    {
      module: 'DialoguePure',
      fixture: 'fixtures/grove-npc-conversation.json',
      expectedDuration: 30000,
      outputs: ['questFlags', 'reputationChanges']
    },
    {
      module: 'QuestSystemPure', 
      fixture: 'fixtures/grove-quest-start.json',
      inputs: ['questFlags'],
      expectedDuration: 5000,
      outputs: ['questState', 'inventoryRewards']
    },
    {
      module: 'InventoryPure',
      fixture: 'fixtures/grove-item-pickup.json',
      inputs: ['inventoryRewards'],
      expectedDuration: 2000,
      outputs: ['finalInventory']
    },
    {
      module: 'AudioPure',
      fixture: 'fixtures/grove-audio-cues.json',
      parallel: true, // Runs alongside other modules
      expectedDuration: 37000
    }
  ],
  validation: {
    totalDuration: 37000,
    requiredOutputs: ['finalInventory', 'questState'],
    deterministic: true
  }
};
```

## 📦 Federation Hook Registry

### Phase 17 Module Hooks

#### ModdingPure Federation Hooks
```typescript
const moddingFederationHooks = {
  'plugin_loaded': {
    targets: ['AssetValidatorPure', 'RemixAuditPure'],
    action: 'validatePlugin',
    persistent: true
  },
  'asset_bundled': {
    targets: ['RenderPayloadPure', 'AudioPure'],
    action: 'refreshAssets',
    persistent: false
  }
};
```

#### DialoguePure Federation Hooks
```typescript
const dialogueFederationHooks = {
  'conversation_started': {
    targets: ['AudioPure', 'VisualReplaySystemPure'],
    action: 'beginDialogueSession',
    persistent: true
  },
  'choice_made': {
    targets: ['QuestSystemPure', 'NPCsPure'],
    action: 'updateRelationship',
    persistent: true
  },
  'dialogue_completed': {
    targets: ['SaveLoadPure'],
    action: 'saveDialogueState',
    persistent: true
  }
};
```

#### VisualReplaySystemPure Federation Hooks
```typescript
const replayFederationHooks = {
  'recording_started': {
    targets: ['AudioPure', 'InputSystemPure', 'RenderPayloadPure'],
    action: 'enableReplayCapture',
    persistent: false
  },
  'frame_captured': {
    targets: ['PerformancePure'],
    action: 'collectMetrics',
    persistent: false
  },
  'replay_completed': {
    targets: ['SaveLoadPure', 'AssetValidatorPure'],
    action: 'validateReplayIntegrity',
    persistent: true
  }
};
```

## 🔄 Persistent Replay Scenarios

### Scenario 1: Complete Grove Exploration
```json
{
  "scenarioId": "grove_complete_exploration",
  "description": "Full Witcher Grove exploration with dialogue, quests, and combat",
  "federationChain": [
    {
      "phase": "arrival",
      "modules": ["DialoguePure", "AudioPure"],
      "duration": 15000,
      "checkpoints": ["npc_greeted", "background_music_started"]
    },
    {
      "phase": "quest_discovery", 
      "modules": ["DialoguePure", "QuestSystemPure", "InventoryPure"],
      "duration": 25000,
      "checkpoints": ["quest_accepted", "item_received"]
    },
    {
      "phase": "exploration",
      "modules": ["NavigationSystemPure", "VisualReplaySystemPure", "AudioPure"],
      "duration": 45000,
      "checkpoints": ["area_discovered", "ambient_triggered"]
    },
    {
      "phase": "completion",
      "modules": ["QuestSystemPure", "SaveLoadPure", "DialoguePure"],
      "duration": 20000,
      "checkpoints": ["quest_completed", "state_saved"]
    }
  ],
  "totalDuration": 105000,
  "deterministicSeed": 42,
  "validationPoints": 12
}
```

### Scenario 2: Multi-Player Combat Session
```json
{
  "scenarioId": "multiplayer_combat_session",
  "description": "Networked combat with audio, visual replay, and modding support",
  "federationChain": [
    {
      "phase": "network_setup",
      "modules": ["NetworkBridgePure", "ModdingPure"],
      "duration": 10000,
      "checkpoints": ["players_connected", "mods_loaded"]
    },
    {
      "phase": "combat_start",
      "modules": ["CombatPure", "AudioPure", "VisualReplaySystemPure"],
      "duration": 60000,
      "checkpoints": ["combat_initiated", "recording_started"]
    },
    {
      "phase": "combat_resolution",
      "modules": ["HealthSystemPure", "NetworkBridgePure", "SaveLoadPure"],
      "duration": 15000,
      "checkpoints": ["combat_ended", "results_synchronized"]
    }
  ],
  "totalDuration": 85000,
  "networkPlayers": 4,
  "deterministicSeed": 123,
  "validationPoints": 8
}
```

## 🛠️ Implementation Guide

### 1. Adding Federation Hooks to Existing Modules

```typescript
// In any Pure module's main file
export interface ModuleFederationHooks {
  onFederationEvent?: (event: FederationEvent) => FederationResponse;
  onFederationInit?: (config: FederationConfig) => void;
  onFederationTeardown?: () => FederationState;
}

// Example implementation in DialoguePure
export const dialogueFederationHooks: ModuleFederationHooks = {
  onFederationEvent: (event) => {
    switch (event.eventType) {
      case 'state_change':
        if (event.payload.type === 'quest_started') {
          // Update dialogue flags based on quest state
          return {
            success: true,
            updates: {flags: event.payload.questFlags}
          };
        }
        break;
    }
    return {success: false, reason: 'Unhandled event'};
  }
};
```

### 2. Creating Federation CLI Commands

```bash
# Add to each module's CLI harness
npx ts-node cli/commands/[module].ts federate \
  --scenario grove_exploration \
  --modules DialoguePure,QuestSystemPure,AudioPure \
  --output federation-session.json

# Replay federated scenario
npx ts-node cli/commands/federation.ts replay \
  --fixture federation-session.json \
  --validate-hooks \
  --quiet
```

## 📋 Phase 18 Integration Checklist

- [ ] Add federation hooks to all Phase 17 modules
- [ ] Create federation CLI command structure
- [ ] Implement persistent replay chain validation
- [ ] Add cross-module orchestration tests
- [ ] Document federation patterns for contributors
- [ ] Create sample federation scenarios
- [ ] Test multi-module deterministic replay
- [ ] Validate federation hook performance impact

## 🎯 Benefits for Phase 18

1. **Orchestration Expansion**: Seamless coordination between modules
2. **Persistent Replay**: Complex scenarios can be saved and replayed exactly
3. **Multi-Agent Support**: AI agents can orchestrate multiple modules simultaneously
4. **Contributor Onboarding**: Clear patterns for adding federation support
5. **Testing Infrastructure**: Comprehensive validation of multi-module interactions
6. **Remix Safety**: Federation maintains modular boundaries and remix compliance