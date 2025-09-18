# SessionManifestPure

A comprehensive session management system for MIFF multiplayer games. Handles session lifecycle, player registration, and manifest validation with full CLI support.

## Features

- **Session Lifecycle Management**: Create, manage, and cleanup game sessions
- **Player Operations**: Add, remove, and update player status in sessions
- **Session Validation**: Comprehensive manifest validation with error reporting
- **Statistics & Analytics**: Track session metrics and player activity
- **Activity Simulation**: Simulate player activities for testing
- **Multi-Format Export**: Export session data in JSON, CSV, Markdown, HTML, YAML, XML formats
- **Configurable Limits**: Set maximum players, timeouts, and other constraints

## Usage

### Basic API

```typescript
import { SessionManifestManager } from './Manager';
import { SessionPlayerRef } from './index';

const manager = new SessionManifestManager({
  maxPlayers: 8,
  sessionTimeout: 60, // minutes
  allowSpectators: true
});

// Create a session
const result = manager.createSession('my-session', 'toppler', [
  { playerId: 'player1', avatar: 'presets/avatars/barbarian.json', style: '2d-side' }
], 12345);

// Add a player
manager.addPlayer('my-session', {
  playerId: 'player2',
  avatar: 'presets/avatars/mage.json',
  style: '2d-side',
  team: 'blue'
});

// Get session statistics
const stats = manager.getStats();
console.log(`Active sessions: ${stats.activeSessions}/${stats.totalSessions}`);
```

### CLI Usage

```bash
# List all sessions
npx tsx cliHarness.ts list

# Create a new session
npx tsx cliHarness.ts create my-session toppler 12345

# Get session details
npx tsx cliHarness.ts get my-session

# Add a player to session
npx tsx cliHarness.ts addPlayer my-session player2 presets/avatars/mage.json 2d-side blue

# Update player status
npx tsx cliHarness.ts updateStatus my-session player1 inactive

# Remove player from session
npx tsx cliHarness.ts removePlayer my-session player2

# Get session statistics
npx tsx cliHarness.ts stats

# Simulate session activity
npx tsx cliHarness.ts simulate my-session 60

# Export session data
npx tsx cliHarness.ts export my-session yaml
npx tsx cliHarness.ts export my-session manifest
npx tsx cliHarness.ts export my-session summary

# Validate session manifest
npx tsx cliHarness.ts validate fixtures/validate_session.json

# Clean up expired sessions
npx tsx cliHarness.ts cleanup

# Delete a session
npx tsx cliHarness.ts delete my-session
```

## Data Structures

### SessionManifest
```typescript
interface SessionManifest {
  id: string;                    // Unique session identifier
  zone: string;                  // Game zone (toppler, witcher_grove, etc.)
  players: SessionPlayerRef[];   // List of players in session
  seed?: number;                 // Random seed for deterministic gameplay
  createdAt?: string;            // ISO timestamp of creation
}
```

### SessionPlayerRef
```typescript
interface SessionPlayerRef {
  playerId: string;              // Unique player identifier
  avatar: string;                // Path to avatar manifest
  style: '3d' | '2d-side' | 'overlay';  // Rendering style
  team?: string;                 // Team assignment (optional)
  status?: 'active' | 'inactive' | 'disconnected';  // Player status
}
```

### SessionConfig
```typescript
interface SessionConfig {
  maxPlayers?: number;           // Maximum players per session (default: 8)
  autoStart?: boolean;           // Auto-start when conditions met (default: false)
  sessionTimeout?: number;       // Session timeout in minutes (default: 60)
  allowSpectators?: boolean;     // Allow spectator mode (default: true)
}
```

## Export Formats

### Standard Formats
- **JSON**: Complete session data with metadata
- **CSV**: Tabular format for player data
- **Markdown**: Human-readable documentation format
- **HTML**: Web-ready presentation format
- **YAML**: Configuration-friendly format
- **XML**: Structured markup format

### Session-Specific Formats
- **manifest**: Full session manifest with schema and metadata
- **summary**: Condensed session overview with key metrics

## CLI Operations

| Operation | Description | Arguments |
|-----------|-------------|-----------|
| `create` | Create new session | sessionId, zone, [seed] |
| `get` | Get session details | sessionId |
| `list` | List sessions with optional filtering | [zone], [status] |
| `addPlayer` | Add player to session | sessionId, playerId, avatar, style, [team] |
| `removePlayer` | Remove player from session | sessionId, playerId |
| `updateStatus` | Update player status | sessionId, playerId, status |
| `delete` | Delete session | sessionId |
| `cleanup` | Clean up expired sessions | - |
| `stats` | Get session statistics | - |
| `simulate` | Simulate session activity | sessionId, [duration] |
| `export` | Export session data | sessionId, [format] |
| `validate` | Validate session manifest | jsonFile |

## Testing

```bash
# Run unit tests
npm test

# Run golden tests
npm run test:golden

# Test CLI harness
npx tsx cliHarness.ts stats
npx tsx cliHarness.ts list
```

## Fixtures

- `fixtures/sample_sessions.json`: Sample operations for testing
- `fixtures/validate_session.json`: Valid session manifest for validation testing

## Integration

SessionManifestPure integrates seamlessly with other MIFF systems:

- **AvatarSystemPure**: References avatar manifests for player representation
- **ZoneServerPure**: Provides session data for multiplayer coordination
- **NetworkBridgePure**: Handles session synchronization across clients
- **WebSocketBridgePure**: Real-time session state updates

## Remix Hooks

This module supports the following remix hooks for customization:

- `session.create`: Called when a new session is created
- `session.player.add`: Called when a player joins a session
- `session.player.remove`: Called when a player leaves a session
- `session.cleanup`: Called during session cleanup operations
- `session.validate`: Called during manifest validation

## Error Handling

The module provides comprehensive error handling with detailed error messages:

- Session not found errors
- Player already in session errors
- Maximum players exceeded errors
- Invalid manifest validation errors
- Missing required field errors

All operations return structured responses with `ok` status and detailed error arrays when applicable.

## Performance

- **Memory Efficient**: Uses Maps for O(1) session lookups
- **Configurable Timeouts**: Automatic cleanup of expired sessions
- **Batch Operations**: Efficient handling of multiple operations
- **Deterministic**: Consistent behavior with seed-based randomization

## License

MIT License - Part of the MIFF (Make It For Free) framework.