# ProjectileSystemPure

Advanced projectile simulation with physics integration, collision detection, and comprehensive analytics. Engine-agnostic and remix-safe with multiple projectile types and realistic physics.

## Features

### Core Simulation
- **Physics Integration**: Gravity, friction, mass-based calculations
- **Multiple Projectile Types**: Bullets, arrows, fireballs, rockets, beams
- **Time Management**: TTL (time-to-live) with automatic cleanup
- **Collision Detection**: Circle-based collision with arbitrary targets
- **Boundary Handling**: Bouncing with restitution or removal

### Advanced Physics
- **Per-Projectile Gravity**: Override default gravity for magical projectiles
- **Air Resistance**: Friction-based velocity dampening
- **Bouncing Physics**: Configurable bounces with restitution factors
- **Mass Effects**: Realistic kinetic energy calculations
- **Deterministic Simulation**: Rounded values for consistent results

### Analytics & Management
- **Real-time Analytics**: Velocity, energy, type distribution tracking
- **Performance Monitoring**: Active projectile counts and system health
- **Export Capabilities**: JSON, Manifest, Summary formats
- **Collision Integration**: Built-in collision checking with external targets

## Schema (v2.0+ compatible)

### ProjectileWorld
```typescript
{
  projectiles: Projectile[];
  defaultGravity?: Vec2;
  defaultFriction?: number;
  bounds?: { min: Vec2; max: Vec2 };
  timeStep?: number;
}
```

### Projectile
```typescript
{
  id: string;
  position: Vec2;
  velocity: Vec2;
  ttl: number;
  damage?: number;
  radius?: number;
  mass?: number;
  gravity?: Vec2;
  friction?: number;
  bounces?: number;
  restitution?: number;
  tags?: string[];
  ownerId?: string;
  type?: 'bullet' | 'arrow' | 'fireball' | 'rocket' | 'beam';
}
```

## CLI Usage

```bash
# Run demonstration
node cliHarness.ts

# Load projectiles and run commands
node cliHarness.ts projectiles.json commands.json

# Show help
node cliHarness.ts help
```

### Available Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `list` | List all projectiles and counts | - |
| `create` | Create a new projectile | `projectile: Projectile` |
| `remove` | Remove projectile by ID | `id: string` |
| `clear` | Remove all projectiles | - |
| `step` | Step simulation forward | `dt: number` |
| `dump` | Get detailed projectile info | `id: string` |
| `analytics` | Get simulation analytics | - |
| `export` | Export projectile data | `format: string` |
| `checkCollisions` | Check collisions with targets | `targets: Target[]` |
| `demo` | Run demonstration | - |
| `help` | Show help information | - |

### Export Formats

- **JSON**: Complete projectile world state
- **Manifest**: Schema-versioned export with metadata
- **Summary**: Analytics and system overview

## Integration Examples

### With CollisionSystemPure
```typescript
// Check projectile collisions with game objects
const targets = [
  { id: 'enemy1', position: { x: 5, y: 2 }, radius: 1 },
  { id: 'wall', position: { x: 10, y: 0 }, radius: 2 }
];
const collisionResult = projectileManager.checkCollisions(targets);

// Handle collisions
for (const collision of collisionResult.collisions) {
  // Remove projectile and damage target
  projectileManager.remove(collision.projectileId);
  damageTarget(collision.targetId, projectile.damage);
}
```

### With PhysicsSystemPure
```typescript
// Sync projectile physics with main physics system
const stepResult = projectileManager.step(0.016);
for (const projectile of stepResult.updated) {
  // Update physics bodies to match projectile positions
  physicsManager.updateBody(projectile.id, {
    position: projectile.position,
    velocity: projectile.velocity
  });
}
```

## Projectile Types

### Bullet
- High velocity, low mass
- Minimal gravity effect
- Short TTL for performance

### Arrow
- Medium velocity, medium mass
- Affected by gravity and friction
- Longer TTL for realistic flight

### Fireball
- Magical projectile with custom gravity
- Area damage with larger radius
- Visual effects integration

### Rocket
- High mass, explosive payload
- Bouncing capabilities
- Long TTL for guided systems

## Physics Characteristics

- **Gravity Integration**: F = ma applied each simulation step
- **Friction Dampening**: Exponential velocity decay
- **Collision Response**: Elastic collisions with configurable restitution
- **Boundary Handling**: Reflect or remove based on projectile properties
- **Energy Conservation**: Proper kinetic energy calculations

## Performance Optimization

- **Automatic Cleanup**: Expired and out-of-bounds projectiles removed
- **Efficient Collision**: Circle-based detection with early termination
- **Memory Management**: Map-based storage with garbage collection
- **Deterministic Output**: Rounded calculations for consistent results

## Remix Hooks
- **Spawn Integration**: External projectile creation from weapons/spells
- **Collision Callbacks**: Hook into collision events for damage/effects
- **Physics Composition**: Integrate with main physics simulation
- **Visual Effects**: Sync with rendering systems for trails/explosions
- **Audio Integration**: Trigger sounds on creation, collision, expiration

## Advanced Features

### Multi-Type Support
Different projectile types with unique behaviors, damage values, and physics properties for diverse gameplay mechanics.

### Owner Tracking
Track projectile ownership for damage attribution, friendly fire prevention, and gameplay statistics.

### Collision Integration
Built-in collision detection with external targets for seamless integration with game object systems.

### Bouncing Physics
Realistic bouncing with configurable restitution factors for grenades, magic orbs, and ricochet mechanics.