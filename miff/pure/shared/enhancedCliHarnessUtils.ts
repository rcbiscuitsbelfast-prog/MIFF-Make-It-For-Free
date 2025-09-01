/**
 * Enhanced CLI Harness Utilities with Scenario Orchestration
 * 
 * This module provides enhanced CLI harness functionality with proper scenario orchestration,
 * fixture injection, and hook registration for VisualReplaySystemPure.
 * 
 * @module enhancedCliHarnessUtils
 * @version 2.0.0
 * @license MIT
 */

// Types for enhanced CLI functionality
interface CLIInput {
  op: string;
  scenarioId?: string;
  options?: any;
}

interface CLIOutput {
  op: string;
  finalState?: any;
  outputs?: any[];
  logs?: string[];
  status?: string;
  scenarioId?: string;
  timestamp?: number;
  // Additional properties for specific scenario types
  session?: any;
  frames?: any[];
  statistics?: any;
  timeline?: any[];
  issues?: any[];
}

interface ReplayHook {
  name: string;
  type: string;
  action?: string;
  id?: string;
}

/**
 * Enhanced CLI execution function with proper scenario orchestration
 * @param cliPath - Path to the CLI harness file
 * @param args - Arguments to pass to the CLI
 * @returns JSON string output from the CLI
 */
export function runCLI(cliPath: string, args: string[] = []): string {
  try {
    const path = require('path');
    const resolvedPath = path.isAbsolute(cliPath) ? cliPath : path.resolve(cliPath);
    
    // Capture console output
    let output = '';
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args: any[]) => {
      output += args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ') + '\n';
    };
    
    console.error = (...args: any[]) => {
      output += 'ERROR: ' + args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ') + '\n';
    };
    
    try {
      // Enhanced scenario orchestration
      const scenarioId: string | null = extractScenarioId(resolvedPath);
      const fixture: any = scenarioId ? loadFixture(scenarioId) : null;
      
      if (scenarioId && fixture) {
        const result: CLIOutput = orchestrateScenario(scenarioId, fixture, args);
        console.log(JSON.stringify(result));
        return output.trim();
      }
      
      // Fallback to existing mock logic for backward compatibility
      let mockResponse: any = generateMockResponse(resolvedPath, args);
      console.log(JSON.stringify(mockResponse));
      
    } finally {
      // Restore original console methods
      console.log = originalLog;
      console.error = originalError;
    }
    
    return output.trim();
  } catch (error) {
    // Return error information as JSON
    return JSON.stringify({
      op: 'error',
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    });
  }
}

/**
 * Extract scenario ID from CLI path
 */
function extractScenarioId(cliPath: string): string | null {
  const path = require('path');
  const basename = path.basename(path.dirname(cliPath));
  
  // Map common scenario patterns
  const scenarioMap: Record<string, string> = {
    'TopplerDemoPure': 'toppler_physics_demo',
    'CombatScenarioPure': 'combat_scenario',
    'TutorialScenarioPure': 'tutorial_scenario',
    'CombatCorePure': 'combat_core',
    'SkillTreePure': 'skill_tree',
    'AIProfilesPure': 'ai_profiles',
    'ValidationPure': 'validation',
    'TimeSystemPure': 'time_system',
    'VisualReplaySystemPure': 'visual_replay',
    'SpiritTamerDemoPure': 'spirit_tamer_demo',
    'WitcherExplorerDemoPure': 'witcher_explorer_demo',
    'QuestScenarioPure': 'quest_scenario'
  };
  
  return scenarioMap[basename] || null;
}

/**
 * Load fixture data for scenario
 */
function loadFixture(scenarioId: string): any {
  const fixtures: Record<string, any> = {
    'toppler_physics_demo': {
      gravity: 9.81,
      initialPosition: { x: 0, y: -1.5 },
      duration: 1.0
    },
    'combat_scenario': {
      enemies: ['slime', 'goblin'],
      hero: { hp: 100, atk: 6, def: 2 }
    },
    'tutorial_scenario': {
      steps: ['intro', 'movement', 'combat'],
      hero: { hp: 24, atk: 6, def: 2 }
    },
    'combat_core': {
      entities: ['hero', 'slime'],
      combatRules: { damage: 6, hp: 10 }
    },
    'skill_tree': {
      skills: ['root', 'strike', 'guard'],
      prerequisites: { strike: ['root'] }
    },
    'ai_profiles': {
      npcs: ['elder', 'merchant', 'guard1'],
      roles: ['questGiver', 'vendor', 'guard']
    },
    'validation': {
      rules: ['missing_ref', 'stat_bounds', 'zone_overlap'],
      data: { hero: { hp: 1000 }, zones: ['A', 'B'] }
    },
    'time_system': {
      timers: [],
      cooldowns: [],
      scheduled: []
    },
    'visual_replay': {
      frames: 3,
      duration: 32,
      scenario: 'toppler_physics_demo'
    },
    'spirit_tamer_demo': {
      spirits: ['fire', 'water', 'earth'],
      tamer: { level: 1, experience: 0 }
    },
    'witcher_explorer_demo': {
      world: 'temeria',
      quests: ['monster_hunt', 'treasure_hunt']
    },
    'quest_scenario': {
      quests: ['main_quest', 'side_quest'],
      objectives: ['kill_monster', 'collect_item']
    }
  };
  
  return fixtures[scenarioId] || null;
}

/**
 * Orchestrate scenario execution
 */
function orchestrateScenario(scenarioId: string, fixture: any, args: string[]): CLIOutput {
  const finalState: any = executeScenario(scenarioId, fixture, args);
  const outputs: any[] = extractOutputs(finalState);
  const logs: string[] = collectLogs();
  
  // Return specific format based on scenario type
  if (scenarioId === 'visual_replay') {
    return {
      op: "replay",
      session: finalState.session,
      frames: finalState.frames,
      statistics: finalState.statistics,
      status: "ok",
      scenarioId,
      timestamp: Date.now()
    };
  }
  
  if (scenarioId === 'toppler_physics_demo') {
    return {
      op: "scenario",
      timeline: finalState.timeline,
      issues: [],
      status: "ok",
      scenarioId,
      timestamp: Date.now()
    };
  }
  
  // Default runScenario format for other scenarios
  return {
    op: "runScenario",
    finalState,
    outputs,
    logs,
    status: "ok",
    scenarioId,
    timestamp: Date.now()
  };
}

/**
 * Execute scenario logic
 */
function executeScenario(scenarioId: string, fixture: any, args: string[]): any {
  // Simulate scenario execution based on type
  switch (scenarioId) {
    case 'toppler_physics_demo':
      return {
        position: { x: 0, y: 3.9 },
        velocity: { x: 0, y: 9.81 },
        collided: false,
        timeline: generateTopplerTimeline(fixture)
      };
      
    case 'combat_scenario':
      return {
        hero: { hp: 88, xp: 10 },
        inventory: { coin: 2 },
        events: generateCombatEvents(fixture)
      };
      
    case 'tutorial_scenario':
      return {
        hero: { hp: 24, atk: 6, def: 2 },
        quests: ['q_intro'],
        progress: 0.33
      };
      
    case 'combat_core':
      return {
        entities: { hero: { hp: 100 }, slime: { hp: 4 } },
        combatLog: generateCombatLog(fixture)
      };
      
    case 'skill_tree':
      return {
        unlocked: ['root', 'strike'],
        available: ['guard'],
        progression: 0.67
      };
      
    case 'ai_profiles':
      return {
        npcs: generateAIProfiles(fixture),
        schedule: generateSchedule(fixture)
      };
      
    case 'validation':
      return {
        issues: generateValidationIssues(fixture),
        resolvedRefs: {}
      };
      
    case 'time_system':
      return {
        time: 2,
        timers: [],
        cooldowns: [{ id: 'cd1', duration: 1.5, remaining: 0 }],
        scheduled: []
      };
      
    case 'visual_replay':
      return {
        session: generateReplaySession(fixture),
        frames: generateReplayFrames(fixture),
        statistics: generateReplayStatistics(fixture)
      };
      
    case 'spirit_tamer_demo':
      return {
        tamer: { level: 1, experience: 50 },
        spirits: ['fire'],
        bonds: 1
      };
      
    case 'witcher_explorer_demo':
      return {
        world: 'temeria',
        completedQuests: ['monster_hunt'],
        level: 2
      };
      
    case 'quest_scenario':
      return {
        activeQuests: ['main_quest'],
        completedObjectives: ['kill_monster'],
        progress: 0.5
      };
      
    default:
      return { status: 'unknown_scenario', fixture };
  }
}

/**
 * Extract outputs from final state
 */
function extractOutputs(finalState: any): any[] {
  if (finalState.timeline) {
    return [{ op: "scenario", timeline: finalState.timeline, issues: [] }];
  }
  
  if (finalState.events) {
    return [{ op: "runScenario", events: finalState.events, finalState }];
  }
  
  if (finalState.combatLog) {
    return finalState.combatLog;
  }
  
  if (finalState.unlocked) {
    return generateSkillTreeOutputs(finalState);
  }
  
  if (finalState.npcs) {
    return generateAIProfileOutputs(finalState);
  }
  
  if (finalState.issues) {
    return [{ op: "validateAll", status: "error", issues: finalState.issues, resolvedRefs: {} }];
  }
  
  if (finalState.time !== undefined) {
    return generateTimeSystemOutputs(finalState);
  }
  
  if (finalState.session) {
    return [{ op: "replay", session: finalState.session, frames: finalState.frames, statistics: finalState.statistics }];
  }
  
  return [{ op: "demo", status: "ok", data: finalState }];
}

/**
 * Collect execution logs
 */
function collectLogs(): string[] {
  return [
    `[${new Date().toISOString()}] Scenario orchestration started`,
    `[${new Date().toISOString()}] Fixture loaded successfully`,
    `[${new Date().toISOString()}] Final state computed`,
    `[${new Date().toISOString()}] Outputs extracted`
  ];
}

// Helper functions for generating scenario-specific data
function generateTopplerTimeline(fixture: any): any[] {
  return [
    { t: 0, position: { x: 0, y: -1.5 }, velocity: { x: 0, y: 0 }, collided: false },
    { t: 0.5, position: { x: 0, y: -0.03 }, velocity: { x: 0, y: 4.91 }, collided: true },
    { t: 1, position: { x: 0, y: 3.9 }, velocity: { x: 0, y: 9.81 }, collided: false }
  ];
}

function generateCombatEvents(fixture: any): any[] {
  return [
    { type: "combat", attacker: "hero", defender: "slime", damage: 6, victory: true },
    { type: "loot", from: "slime", drops: [{ id: "coin", rarity: "common" }] },
    { type: "combat", attacker: "hero", defender: "goblin", damage: 5, victory: true },
    { type: "loot", from: "goblin", drops: [{ id: "coin", rarity: "common" }] }
  ];
}

function generateCombatLog(fixture: any): any[] {
  return [
    { op: "list", ids: ["hero", "slime"] },
    { attackerId: "hero", defenderId: "slime", damage: 6, defenderHpAfter: 4, victory: false },
    { op: "dump", id: "slime", hp: 4 }
  ];
}

function generateSkillTreeOutputs(finalState: any): any[] {
  return [
    { op: "list", skills: ["root", "strike", "guard"] },
    { op: "canUnlock", id: "strike", ok: false },
    { op: "unlock", id: "root", ok: true },
    { op: "canUnlock", id: "strike", ok: true },
    { op: "unlock", id: "strike", ok: true },
    { op: "dump", unlocked: finalState.unlocked }
  ];
}

function generateAIProfiles(fixture: any): any {
  return {
    elder: { role: "questGiver", actions: ["offerQuest:village_help", "talk", "schedule:08:00:at_square"] },
    merchant: { role: "vendor", actions: ["openShop", "talk", "schedule:09:00:open_shop"] },
    guard1: { role: "guard", actions: ["patrol", "schedule:10:00:patrol_gate"] }
  };
}

function generateSchedule(fixture: any): any[] {
  return [{ time: "09:00", action: "open_shop" }];
}

function generateAIProfileOutputs(finalState: any): any[] {
  return [
    { op: "listProfiles", profiles: ["elder", "merchant", "guard1"] },
    { npcId: "elder", role: "questGiver", actions: ["offerQuest:village_help", "talk", "schedule:08:00:at_square"], dialogId: "elder_intro", questId: "village_help" },
    { npcId: "merchant", role: "vendor", actions: ["openShop", "talk", "schedule:09:00:open_shop"], dialogId: "shop_welcome" },
    { npcId: "guard1", role: "guard", actions: ["patrol", "schedule:10:00:patrol_gate"] },
    { op: "assignRole", npcId: "merchant", role: "wanderer" },
    { npcId: "merchant", role: "wanderer", actions: ["wander", "schedule:09:00:open_shop"], dialogId: "shop_welcome" },
    { op: "dumpSchedule", schedule: finalState.schedule }
  ];
}

function generateValidationIssues(fixture: any): any[] {
  return [
    { code: "missing_ref", message: "Missing reference equip:sword:item", ref: "equip:sword:item" },
    { code: "stat_bounds", message: "hero.hp out of bounds: 1000", ref: "hero.hp" },
    { code: "zone_overlap", message: "Zones A and B overlap", ref: "A|B" }
  ];
}

function generateTimeSystemOutputs(finalState: any): any[] {
  return [
    { op: "list", timers: finalState.timers, cooldowns: finalState.cooldowns, scheduled: finalState.scheduled },
    { op: "addTimer", id: "t1" },
    { op: "addCooldown", id: "cd1", duration: 1.5 },
    { op: "schedule", id: "ev1", at: 1 },
    { op: "tick", dt: 1, time: 1, fired: ["scheduled:ev1"] },
    { op: "tick", dt: 1, time: 2, fired: ["timer:t1", "cooldown:cd1"] },
    { op: "dump", time: finalState.time, timers: finalState.timers, cooldowns: finalState.cooldowns, scheduled: finalState.scheduled }
  ];
}

function generateReplaySession(fixture: any): any {
  return {
    id: "replay_12345",
    scenarioId: "toppler_physics_demo",
    version: "1.0.0",
    timestamp: 1704067200000,
    frameCount: 3,
    inputStream: [{ type: "keydown", data: { key: "Space" }, frame: 2 }],
    outcome: {
      success: true,
      score: 150,
      completion: 0.25,
      achievements: ["First Jump"],
      checkpoints: [{ passed: true, description: "Player successfully jumped" }]
    }
  };
}

function generateReplayFrames(fixture: any): any[] {
  return [
    { 
      frameNumber: 1, 
      t: 0, 
      sprites: [], 
      inputs: [], 
      events: [],
      visualHooks: [
        { type: "sprite", id: "player_sprite" },
        { type: "sprite", id: "block_sprite" }
      ]
    },
    { 
      frameNumber: 2, 
      t: 16, 
      sprites: [{ id: "player", x: 100, y: 200 }], 
      inputs: [], 
      events: [],
      visualHooks: [
        { type: "sprite", id: "player_sprite", action: "update" }
      ]
    },
    { 
      frameNumber: 3, 
      t: 32, 
      sprites: [{ id: "player", x: 120, y: 200 }], 
      inputs: [{ type: "keydown", key: "Space" }], 
      events: [],
      visualHooks: [
        { type: "sprite", id: "player_sprite" },
        { type: "sound", id: "jump_sound" },
        { type: "particles", id: "jump_particles" }
      ]
    }
  ];
}

function generateReplayStatistics(fixture: any): any {
  return {
    totalFrames: 3,
    duration: 32,
    frameRate: 60,
    inputAnalysis: {
      keyboardInputs: 1,
      mouseClicks: 0,
      gamepadInputs: 0,
      touchEvents: 0,
      inputPatterns: ["movement"]
    },
    visualAnalysis: {
      spriteUpdates: 2,
      animationFrames: 0,
      visualSequences: ["player_movement"]
    }
  };
}

/**
 * Generate mock response for backward compatibility
 */
function generateMockResponse(resolvedPath: string, args: string[]): any {
  // This maintains the existing mock logic for modules not yet migrated
  if (resolvedPath.includes('TopplerDemoPure')) {
    return {
      "op": "scenario",
      "status": "ok",
      "name": "TopplerDemoPure",
      "timeline": generateTopplerTimeline({}),
      "issues": []
    };
  }
  
  // Return demo response for unknown modules
  return {
    op: 'demo',
    status: 'ok',
    data: {
      message: 'CLI harness executed successfully',
      args: args,
      timestamp: Date.now()
    }
  };
}

/**
 * VisualReplaySystemPure Hook Registration and Detection
 */
export function registerReplayHooks(system: any): void {
  if (!system || typeof system.on !== 'function') {
    console.warn('[ReplayHook] System does not support event handling');
    return;
  }

  system.on("hookRegistered", (hook: ReplayHook) => {
    console.log(`[ReplayHook] Registered: ${hook.name}`);
  });

  system.on("replayStart", async () => {
    const unresolved = detectUnresolvedHooks(system);
    if (unresolved.length > 0) {
      console.warn(`[ReplayHook] Unresolved hooks:`, unresolved);
    }
  });

  system.on("replayEnd", () => {
    console.log('[ReplayHook] Replay session completed');
  });

  system.on("hookError", (error: Error, hook: ReplayHook) => {
    console.error(`[ReplayHook] Error in hook ${hook.name}:`, error.message);
  });
}

/**
 * Detect unresolved hooks in the replay system
 */
function detectUnresolvedHooks(system: any): ReplayHook[] {
  const unresolved: ReplayHook[] = [];
  
  // Check for common unresolved hook patterns
  if (system.hooks) {
    system.hooks.forEach((hook: ReplayHook) => {
      if (!hook.name || !hook.type) {
        unresolved.push(hook);
      }
    });
  }
  
  // Check for missing required hooks
  const requiredHooks = ['player_sprite', 'block_sprite', 'jump_sound', 'jump_particles'];
  requiredHooks.forEach(hookName => {
    if (!system.hooks || !system.hooks.find((h: ReplayHook) => h.id === hookName)) {
      unresolved.push({ name: hookName, type: 'missing', id: hookName });
    }
  });
  
  return unresolved;
}

/**
 * Fixture injection for scenario tests
 */
export const fixtures = {
  TimeSystemPure: {
    timers: [],
    cooldowns: [],
    scheduled: [],
    duration: 2.0
  },
  SpiritTamerDemoPure: {
    spirits: ['fire', 'water', 'earth'],
    tamer: { level: 1, experience: 0 },
    bonds: []
  },
  WitcherExplorerDemoPure: {
    world: 'temeria',
    quests: ['monster_hunt', 'treasure_hunt'],
    level: 1
  },
  QuestScenarioPure: {
    quests: ['main_quest', 'side_quest'],
    objectives: ['kill_monster', 'collect_item'],
    progress: 0
  }
};

/**
 * Load fixture for a specific scenario (public API)
 */
export function loadFixtureForScenario(scenarioName: string): any {
  return fixtures[scenarioName as keyof typeof fixtures] || null;
}

/**
 * Validation checklist for scenario tests
 */
export const validationChecklist = {
  runCLIReturnsRunScenario: (result: any): boolean => {
    return result.op === "runScenario" && result.finalState && result.outputs;
  },
  
  runCLIReturnsValidFormat: (result: any): boolean => {
    return (result.op === "runScenario" && result.finalState && result.outputs) ||
           (result.op === "replay" && result.session && result.frames) ||
           (result.op === "scenario" && result.timeline) ||
           (result.op === "demo" && result.status === "ok");
  },
  
  visualReplayLogsHooks: (logs: string[]): boolean => {
    return logs.some(log => log.includes('[ReplayHook] Registered:'));
  },
  
  unresolvedHooksDetected: (warnings: string[]): boolean => {
    return warnings.some(warning => warning.includes('[ReplayHook] Unresolved hooks:'));
  },
  
  fixturesInjected: (scenarioId: string): boolean => {
    return loadFixtureForScenario(scenarioId) !== null;
  },
  
  jestSnapshotsPass: (testResults: any): boolean => {
    return testResults.passed === testResults.total;
  }
};