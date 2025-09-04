# NetworkBridgePure Onboarding Pack

## 🌐 Module Overview
NetworkBridgePure provides network communication and multiplayer functionality with rollback netcode, peer-to-peer connections, and deterministic synchronization. Built for real-time multiplayer games with engine-agnostic implementation.

## 🚀 CLI Usage

### Basic Commands
```bash
# Initialize network configuration
npx ts-node cli/commands/network.ts init --players 4 --tick-rate 60

# Test network connectivity
npx ts-node cli/commands/network.ts test --host localhost:8080

# Start hosting a game session
npx ts-node cli/commands/network.ts host --port 8080 --max-players 4
```

### Orchestration Commands
```bash
# Initialize network bridge
npx ts-node cli/commands/network.ts init --config network-config.json

# Teardown network session
npx ts-node cli/commands/network.ts teardown --save-session

# Replay network session
npx ts-node cli/commands/network.ts replay --fixture fixtures/network-session.json --quiet

# Export network logs
npx ts-node cli/commands/network.ts export --format logs --output network-logs.json
```

## 📁 Sample Fixtures

### Network Configuration
```json
{
  "maxPlayers": 4,
  "tickRate": 60,
  "rollbackFrames": 7,
  "inputDelay": 2,
  "connectionTimeout": 5000,
  "syncInterval": 16,
  "enableP2P": true,
  "enableRelay": false,
  "compression": true,
  "encryption": false
}
```

### Network Session Example
```json
{
  "sessionId": "multiplayer-test-001",
  "hostId": "host-player-1",
  "players": [
    {
      "id": "player-1",
      "name": "Host",
      "isHost": true,
      "latency": 0,
      "inputDelay": 2
    },
    {
      "id": "player-2", 
      "name": "Guest",
      "isHost": false,
      "latency": 50,
      "inputDelay": 5
    }
  ],
  "gameState": {
    "frame": 0,
    "confirmed_frame": 0,
    "entities": [],
    "inputs": {}
  },
  "networkMetrics": {
    "packetsPerSecond": 60,
    "averageLatency": 25,
    "packetLoss": 0.001,
    "rollbacksPerSecond": 0.5
  }
}
```

### Input Synchronization Example
```json
{
  "frame": 120,
  "inputs": {
    "player-1": {
      "move": {"x": 1, "y": 0},
      "actions": {"jump": true, "attack": false},
      "timestamp": 2000
    },
    "player-2": {
      "move": {"x": -1, "y": 0},
      "actions": {"jump": false, "attack": true},
      "timestamp": 2016
    }
  },
  "confirmed": true,
  "rollback_needed": false
}
```

## 🧪 Golden Test Walkthrough

```bash
# Run NetworkBridgePure golden tests
npm test -- --testNamePattern="NetworkBridgePure"

# Test local networking (loopback)
npx ts-node cli/commands/network.ts test --local

# Test peer connection simulation
npx ts-node cli/commands/network.ts simulate --players 2 --duration 10000

# Test rollback netcode
npx ts-node cli/commands/network.ts test-rollback --frames 7 --input-delay 3
```

## 🔄 Replay/Export Examples

### Recording Network Sessions
```bash
# Record multiplayer session
npx ts-node cli/commands/network.ts record \
  --players 2 \
  --duration 30000 \
  --output network-session.json

# Record with latency simulation
npx ts-node cli/commands/network.ts record \
  --players 4 \
  --simulate-latency 100 \
  --packet-loss 0.01 \
  --output laggy-session.json
```

### Replaying Network Sessions
```bash
# Deterministic network replay
npx ts-node cli/commands/network.ts replay \
  --fixture network-session.json \
  --deterministic \
  --quiet

# Replay with metrics collection
npx ts-node cli/commands/network.ts replay \
  --fixture laggy-session.json \
  --collect-metrics \
  --output-metrics network-metrics.json
```

### Export Network Data
```bash
# Export session logs
npx ts-node cli/commands/network.ts export \
  --session network-session.json \
  --format logs \
  --output session-logs.txt

# Export performance report
npx ts-node cli/commands/network.ts export \
  --session laggy-session.json \
  --format performance-report \
  --output network-performance.html

# Export input history
npx ts-node cli/commands/network.ts export \
  --session network-session.json \
  --format input-history \
  --output inputs.json
```

## 🎯 Deterministic Globals

NetworkBridgePure ensures deterministic behavior through:
- Fixed tick rates and frame timing
- Consistent input ordering and processing
- Deterministic rollback and prediction algorithms
- Reproducible latency simulation
- Stable peer connection establishment order

## 🔗 Orchestration Patterns

### Network Lifecycle
1. **Initialization** - Set up network configuration and create bridge
2. **Discovery** - Find and connect to other players
3. **Synchronization** - Establish synchronized game state
4. **Runtime** - Handle input submission and state updates
5. **Rollback** - Manage prediction errors and state correction
6. **Cleanup** - Gracefully disconnect and save session data
7. **Teardown** - Release network resources

### Integration Points
- Game state synchronization with core MIFF systems
- Input handling via InputSystemPure
- Replay recording through VisualReplaySystemPure
- Audio synchronization with AudioPure
- Save/load integration for multiplayer progress

## 📋 Quick Validation Checklist
- [ ] Network configuration is valid for target player count
- [ ] Rollback netcode handles prediction errors correctly
- [ ] Input synchronization maintains game determinism
- [ ] Latency compensation works within acceptable ranges
- [ ] Peer connections are stable and secure
- [ ] Session data can be replayed deterministically