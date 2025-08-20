# 🎮 **MIFF Battle System - Complete Turn-Based Battle Framework**

A modular, remix-safe, turn-based battle system for K-pop spirit games. Built with pure C# logic, no Unity dependencies, ready for testing in console or headless environments.

## 🏗️ **System Architecture**

### **Core Components**
- **`BattleController`** - Main battle coordinator and state manager
- **`TurnManager`** - Handles turn order, action queuing, and AI decisions
- **`MoveResolver`** - Calculates damage, applies effects, and resolves targeting
- **`SpiritStats`** - Modular stats system with buffs/debuffs and status effects
- **`Move`** - Move definitions with targeting rules and remixable effects
- **`BattleSpirit`** - Spirit instances with battle state and AI behavior
- **`BattleContext`** - Battle information and utility methods

### **Supporting Classes**
- **`StatModifier`** - Temporary stat modifications (buffs/debuffs)
- **`StatusEffect`** - Status conditions with turn-based effects
- **`MoveEffect`** - Effects that can be applied by moves
- **`TurnAction`** - Individual actions within a turn

## 🚀 **Quick Start**

### **1. Create a Battle**
```csharp
// Create battle controller
var battleController = new BattleController();

// Create spirits
var playerSpirit = new BattleSpirit("fire_spirit", "Blaze");
var enemySpirit = new BattleSpirit("water_spirit", "Aqua");

// Add moves to spirits
playerSpirit.AddMove(new Move("Fire Blast", MoveType.Fire, 120, 85, 5));
enemySpirit.AddMove(new Move("Water Gun", MoveType.Water, 40, 100, 25));

// Start battle
var playerTeam = new List<BattleSpirit> { playerSpirit };
var enemyTeam = new List<BattleSpirit> { enemySpirit };
battleController.StartBattle(playerTeam, enemyTeam);
```

### **2. Run Battle Loop**
```csharp
while (!battleController.IsBattleOver())
{
    // Start turn
    battleController.StartTurn();
    
    // Set player actions
    battleController.SetPlayerAction(playerSpirit, fireBlast, enemySpirit);
    
    // Process actions
    while (!battleController.IsTurnComplete())
    {
        battleController.ProcessNextAction();
    }
    
    // End turn
    battleController.EndTurn();
}
```

### **3. Check Results**
```csharp
var winner = battleController.GetBattleWinner();
Console.WriteLine($"Battle ended! Winner: {winner}");
```

## 📊 **Spirit Stats System**

### **Base Stats**
- **HP** - Health Points
- **Speed** - Turn order and evasion
- **Attack** - Physical damage
- **Defense** - Physical resistance
- **Special Attack** - Special damage
- **Special Defense** - Special resistance
- **Accuracy** - Hit chance
- **Evasion** - Dodge chance

### **Stat Modifiers**
```csharp
// Create a stat boost
var attackBoost = new StatModifier(StatType.Attack, ModifierType.Multiplier, 0.5f, 3);
attackBoost.displayName = "Swords Dance";
attackBoost.description = "Sharply raises Attack";

// Apply to spirit
spirit.Stats.AddStatModifier(attackBoost);
```

### **Status Effects**
```csharp
// Create a burn effect
var burnEffect = new StatusEffect(StatusEffectType.Burn, 3, 1);
spirit.Stats.AddStatusEffect(burnEffect);
```

## ⚔️ **Move System**

### **Creating Moves**
```csharp
var fireBlast = new Move("Fire Blast", MoveType.Fire, 120, 85, 5)
{
    category = MoveCategory.Special,
    classification = MoveClassification.Damage,
    targetType = TargetType.SingleEnemy,
    spiritType = SpiritType.Fire
};

// Add effects
var burnEffect = new MoveEffect(MoveEffectType.Burn, 30); // 30% chance
fireBlast.AddEffect(burnEffect);
```

### **Move Categories**
- **Physical** - Uses Attack/Defense stats
- **Special** - Uses Special Attack/Special Defense stats
- **Status** - No damage, only effects

### **Targeting Types**
- **SingleEnemy** - One enemy target
- **AllEnemies** - All enemy targets
- **Self** - User only
- **SingleAlly** - One ally target
- **AllAllies** - All ally targets

## 🔄 **Turn Management**

### **Turn Order Types**
- **SpeedBased** - Fastest spirits go first
- **PlayerFirst** - Player spirits always go first
- **EnemyFirst** - Enemy spirits always go first
- **Random** - Random turn order
- **PriorityBased** - Based on move priority

### **AI Behavior**
```csharp
// Configure AI personality
spirit.isAI = true;
spirit.aggressionLevel = 0.8f;    // Aggressive
spirit.defensiveLevel = 0.2f;     // Not defensive
spirit.supportLevel = 0.1f;       // Minimal support

// AI will choose moves based on personality
var bestMove = spirit.GetBestMove(target, context);
```

## 🎯 **Damage Calculation**

### **Base Formula**
```
Damage = ((2 × Level / 5 + 2) × Power × Attack / Defense) / 50 + 2
```

### **Modifiers Applied**
- **Type Effectiveness** - Super effective (2x), Not very effective (0.5x)
- **STAB** - Same Type Attack Bonus (1.5x)
- **Weather Effects** - Sunny boosts Fire, Rain boosts Water
- **Field Effects** - Electric field boosts Electric moves
- **Critical Hits** - Random 1.5x damage
- **Damage Variation** - ±15% random variation

### **Example Calculation**
```csharp
// Fire move against Grass type
var damage = moveResolver.CalculatePotentialDamage(fireMove, fireSpirit, grassSpirit, context);
// Result: Base damage × 2.0 (super effective) × 1.5 (STAB) = 3x damage
```

## 🌟 **Remix & Extension System**

### **Custom Move Effects**
```csharp
public class CustomMoveEffect : MoveEffect
{
    public CustomMoveEffect() : base(MoveEffectType.Custom)
    {
        displayName = "Custom Effect";
        description = "My custom move effect";
    }
    
    public override void ApplyEffect(BattleSpirit user, BattleSpirit target, BattleContext context)
    {
        // Custom effect logic
        target.Stats.AddStatusEffect(new StatusEffect(StatusEffectType.Confusion, 3, 1));
    }
}
```

### **Custom Status Effects**
```csharp
public class CustomStatusEffect : StatusEffect
{
    public CustomStatusEffect() : base(StatusEffectType.Custom, 3, 1)
    {
        displayName = "Custom Status";
        description = "My custom status effect";
        hasTurnEffect = true;
    }
    
    public override int GetTurnDamage()
    {
        return 5; // Custom turn damage
    }
}
```

### **Event Hooks**
```csharp
// Subscribe to battle events
battleController.OnMoveUsed += (controller, move, user, target) =>
{
    Console.WriteLine($"{user.nickname} used {move.displayName} on {target.nickname}!");
};

// Subscribe to move resolution events
moveResolver.OnDamageCalculated += (resolver, move, user, target, damage) =>
{
    Console.WriteLine($"Dealt {damage} damage!");
};
```

## 🧪 **Testing & Debugging**

### **Console Testing**
```csharp
// Create test battle
var controller = new BattleController();
var player = new BattleSpirit("test_spirit", "Test");
var enemy = new BattleSpirit("enemy_spirit", "Enemy");

// Add test moves
player.AddMove(new Move("Test Move", MoveType.Normal, 50, 100, 10));

// Start battle
controller.StartBattle(new List<BattleSpirit> { player }, new List<BattleSpirit> { enemy });

// Run battle
while (!controller.IsBattleOver())
{
    controller.StartTurn();
    controller.SetPlayerAction(player, player.moves[0], enemy);
    
    while (!controller.IsTurnComplete())
    {
        controller.ProcessNextAction();
    }
    
    controller.EndTurn();
}

// Check results
Console.WriteLine(controller.GetBattleSummary());
```

### **Debug Information**
```csharp
// Get system summaries
Console.WriteLine(controller.GetBattleControllerSummary());
Console.WriteLine(controller.GetBattleStatus());
Console.WriteLine(controller.GetTurnStatus());

// Get spirit summaries
foreach (var spirit in controller.GetActiveSpirits())
{
    Console.WriteLine(spirit.GetSpiritSummary());
}
```

## 🔧 **Configuration Options**

### **Battle Settings**
```csharp
// Configure battle controller
battleController.turnDelay = 0.5f;           // Faster turns
battleController.enableAnimations = false;    // Disable animations
battleController.enableAI = true;             // Enable AI
battleController.aiDecisionDelay = 0.5f;     // Faster AI decisions
```

### **Move Resolver Settings**
```csharp
// Configure move resolver
moveResolver.enableCriticalHits = true;       // Enable critical hits
moveResolver.enableTypeEffectiveness = true;  // Enable type effectiveness
moveResolver.enableSTAB = true;               // Enable STAB bonus
moveResolver.damageVariation = 0.1f;         // Reduce damage variation
```

### **Turn Manager Settings**
```csharp
// Configure turn manager
turnManager.turnOrderType = TurnOrderType.SpeedBased;
turnManager.allowPriorityMoves = true;
turnManager.allowInterrupts = true;
turnManager.maxActionsPerTurn = 2;
```

## 📚 **Integration Examples**

### **With Evolution System**
```csharp
// Subscribe to evolution triggers
battleController.OnEvolutionTriggered += (controller, spirit) =>
{
    // Check evolution conditions
    if (spirit.Stats.GetStat(StatType.Speed) >= 100)
    {
        // Trigger evolution
        evolutionManager.TryEvolve(spirit);
    }
};
```

### **With Quest System**
```csharp
// Subscribe to battle events for quest tracking
battleController.OnBattleEnded += (controller) =>
{
    var winner = controller.GetBattleWinner();
    if (winner == BattleWinner.Player)
    {
        // Check quest completion
        questManager.CheckQuestCompletion("WinBattle");
    }
};
```

### **With Lore System**
```csharp
// Subscribe to move usage for lore unlocks
battleController.OnMoveUsed += (controller, move, user, target) =>
{
    if (move.isSignatureMove)
    {
        // Unlock lore entry
        loreDatabase.UnlockEntry("SignatureMoveUsed");
    }
};
```

## 🎨 **K-Pop Integration Features**

### **Artist & Song References**
```csharp
var signatureMove = new Move("Dynamite", MoveType.Fire, 100, 90, 5)
{
    artist = "BTS",
    song = "Dynamite",
    isSignatureMove = true,
    loreDescription = "A powerful fire move inspired by BTS's hit song"
};
```

### **Lore Bonuses**
- **Signature Move Bonus** - Extra effects when artist matches spirit
- **Legendary Move Effects** - Special effects for legendary moves
- **K-pop Synergy** - Bonuses for moves with artist/song references

## 🚧 **Future Extensions**

### **Planned Features**
- **Mega Evolution** - Temporary power boosts
- **Z-Moves** - Special powerful moves
- **Dynamax** - Size-changing mechanics
- **Terrain Effects** - Field-based bonuses
- **Weather Systems** - Dynamic weather effects

### **Remix Opportunities**
- **Custom Battle Rules** - Unique win conditions
- **Special Mechanics** - Spirit-specific abilities
- **Team Synergies** - Spirit combination bonuses
- **Battle Formats** - Tournament, survival, etc.

## 📖 **API Reference**

### **BattleController Methods**
- `StartBattle(playerTeam, enemyTeam, battleType)` - Start new battle
- `EndBattle()` - End current battle
- `StartTurn()` - Begin new turn
- `EndTurn()` - End current turn
- `SetPlayerAction(spirit, move, target)` - Set player action
- `ProcessNextAction()` - Process next action in queue

### **BattleSpirit Methods**
- `UseMove(move, target, context)` - Use a move
- `TakeDamage(damage, attacker)` - Take damage
- `Heal(amount)` - Heal HP
- `AddMove(move)` - Learn a new move
- `GetBestMove(target, context)` - Get AI move choice

### **Move Methods**
- `CanUse()` - Check if move can be used
- `Use()` - Consume PP
- `CheckHit(userAccuracy, targetEvasion)` - Check if move hits
- `GetTypeEffectiveness(target)` - Get type effectiveness

## 🤝 **Contributor Guidelines**

### **Code Style**
- Use clear, descriptive method names
- Include XML documentation for public methods
- Follow C# naming conventions
- Use events for loose coupling

### **Extension Points**
- Inherit from base classes for custom behavior
- Use events for custom logic hooks
- Override virtual methods for custom implementations
- Keep custom code in separate assemblies

### **Testing**
- Test all new features in console environment
- Verify event system integration
- Test edge cases and error conditions
- Ensure backward compatibility

---

**🎯 This battle system provides a solid foundation for K-pop spirit games while remaining completely modular and remix-safe. Contributors can extend every aspect without modifying core systems.**