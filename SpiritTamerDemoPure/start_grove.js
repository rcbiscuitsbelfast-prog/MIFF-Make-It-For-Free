#!/usr/bin/env node

/**
 * Spirit Tamer: Trial of the Grove - RPG Session Simulator
 * Purpose: Simulate a complete RPG session in the console
 * Version: 1.0.0
 * Author: MIFF Framework
 * License: MIT
 * RemixSafe: true
 */

// Configuration
const SCENARIO_CONFIG = {
  name: "Spirit Tamer: Trial of the Grove",
  version: "1.0.0",
  playerName: "Adventurer",
  sessionId: `session_${Date.now()}`,
  logLevel: "info"
};

// NPC Registry
const NPC_REGISTRY = {
  grove_guardian: {
    id: "grove_guardian",
    name: "Grove Guardian",
    title: "Ancient Protector of the Sacred Grove",
    location: "grove_entrance",
    personality: "wise_ancient",
    dialogueTree: "grove_guardian",
    questGiver: ["grove_initiation"]
  },
  spirit_guide: {
    id: "spirit_guide",
    name: "Spirit Guide",
    title: "Mentor of Spirit Whispering",
    location: "whispering_hollow",
    personality: "patient_mentor",
    dialogueTree: "spirit_guide",
    questGiver: ["spirit_whisperer"]
  },
  ancient_spirit: {
    id: "ancient_spirit",
    name: "Ancient Spirit",
    title: "Teacher of the Grove",
    location: "grove_center",
    personality: "mysterious_helpful",
    dialogueTree: "ancient_spirit",
    questGiver: []
  },
  shadow_guardian: {
    id: "shadow_guardian",
    name: "Shadow Guardian",
    title: "Challenger of Courage",
    location: "shadowed_vale",
    personality: "stern_fair",
    dialogueTree: "shadow_guardian",
    questGiver: ["trial_of_courage"]
  },
  shadow_creature: {
    id: "shadow_creature",
    name: "Shadow Creature",
    title: "Fear Incarnate",
    location: "shadowed_vale_deep",
    personality: "fearful_aggressive",
    dialogueTree: "shadow_creature",
    questGiver: []
  },
  ancient_beacon: {
    id: "ancient_beacon",
    name: "Ancient Beacon",
    title: "Light Restoration Artifact",
    location: "shadowed_vale",
    personality: "ancient_powerful",
    dialogueTree: "ancient_beacon",
    questGiver: []
  }
};

// Quest Registry
const QUEST_REGISTRY = {
  grove_initiation: {
    id: "grove_initiation",
    title: "Grove Initiation",
    description: "Prove your worth to enter the sacred Fae Grove",
    difficulty: "easy",
    estimatedTime: "15-20 minutes",
    steps: [
      {
        id: "approach_grove",
        description: "Approach the ancient oak at the grove entrance",
        location: "grove_entrance",
        npc: "grove_guardian",
        triggers: ["location_entered", "npc_interaction"]
      },
      {
        id: "solve_riddle",
        description: "Solve the ancient riddle to prove your worth",
        location: "grove_entrance",
        npc: "grove_guardian",
        triggers: ["riddle_solved"],
        prerequisites: ["approach_grove"]
      },
      {
        id: "gain_access",
        description: "Receive the grove token and enter the sacred grove",
        location: "grove_entrance",
        npc: "grove_guardian",
        triggers: ["grove_access_granted"],
        prerequisites: ["solve_riddle"]
      }
    ],
    rewards: {
      xp: 150,
      items: ["grove_token", "wisdom_crystal"],
      flags: ["grove_initiate", "grove_access_granted", "riddle_master"]
    }
  },
  spirit_whisperer: {
    id: "spirit_whisperer",
    title: "Spirit Whisperer",
    description: "Learn the ancient art of spirit whispering",
    difficulty: "medium",
    estimatedTime: "45-60 minutes",
    prerequisites: ["grove_initiation"],
    steps: [
      {
        id: "find_spirit_guide",
        description: "Find the Spirit Guide in the Whispering Hollow",
        location: "whispering_hollow",
        npc: "spirit_guide",
        triggers: ["location_entered", "npc_interaction"]
      },
      {
        id: "learn_whispering",
        description: "Learn the ancient art of spirit whispering",
        location: "whispering_hollow",
        npc: "spirit_guide",
        triggers: ["skill_learned"],
        prerequisites: ["find_spirit_guide"]
      },
      {
        id: "practice_whispering",
        description: "Practice spirit whispering with ancient spirits",
        location: "grove_center",
        npc: "ancient_spirit",
        triggers: ["whispering_mastered"],
        prerequisites: ["learn_whispering"]
      }
    ],
    rewards: {
      xp: 300,
      items: ["spirit_essence", "whisper_scroll", "spirit_whisperer_badge"],
      flags: ["spirit_whisperer", "whisper_master", "whisper_practiced"]
    }
  },
  trial_of_courage: {
    id: "trial_of_courage",
    title: "Trial of Courage",
    description: "Face your fears and restore light to the Shadowed Vale",
    difficulty: "hard",
    estimatedTime: "60-90 minutes",
    prerequisites: ["spirit_whisperer"],
    steps: [
      {
        id: "enter_vale",
        description: "Enter the Shadowed Vale to face your fears",
        location: "shadowed_vale",
        npc: "shadow_guardian",
        triggers: ["vale_entered"]
      },
      {
        id: "face_shadows",
        description: "Face the shadow creatures that test your courage",
        location: "shadowed_vale_deep",
        npc: "shadow_creature",
        triggers: ["shadows_faced"],
        prerequisites: ["enter_vale"]
      },
      {
        id: "light_beacon",
        description: "Light the ancient beacon to restore light to the vale",
        location: "shadowed_vale",
        npc: "ancient_beacon",
        triggers: ["light_restored"],
        prerequisites: ["face_shadows"]
      }
    ],
    rewards: {
      xp: 450,
      items: ["courage_medallion", "shadow_essence", "beacon_crystal"],
      flags: ["courage_trial_complete", "vale_entered", "shadows_faced", "light_restored"]
    }
  }
};

// Location Registry
const LOCATION_REGISTRY = {
  grove_entrance: {
    id: "grove_entrance",
    name: "Grove Entrance",
    type: "transition",
    zone: "grove_outer",
    description: "Ancient oak guardian and riddle challenge",
    npcs: ["grove_guardian"],
    quests: ["grove_initiation"],
    connections: ["grove_center"]
  },
  grove_center: {
    id: "grove_center",
    name: "Grove Center",
    type: "hub",
    zone: "grove_inner",
    description: "Central hub with ancient spirits",
    npcs: ["ancient_spirit"],
    quests: [],
    connections: ["grove_entrance", "whispering_hollow", "shadowed_vale"]
  },
  whispering_hollow: {
    id: "whispering_hollow",
    name: "Whispering Hollow",
    type: "quest_location",
    zone: "grove_inner",
    description: "Spirit guide training area",
    npcs: ["spirit_guide"],
    quests: ["spirit_whisperer"],
    connections: ["grove_center"]
  },
  shadowed_vale: {
    id: "shadowed_vale",
    name: "Shadowed Vale",
    type: "challenge_location",
    zone: "shadowed_valley",
    description: "Courage testing grounds",
    npcs: ["shadow_guardian", "ancient_beacon"],
    quests: ["trial_of_courage"],
    connections: ["grove_center", "shadowed_vale_deep"]
  },
  shadowed_vale_deep: {
    id: "shadowed_vale_deep",
    name: "Deep Shadows",
    type: "combat_location",
    zone: "deep_shadows",
    description: "Shadow creature combat area",
    npcs: ["shadow_creature"],
    quests: [],
    connections: ["shadowed_vale"]
  }
};

// Session State
class GroveSession {
  constructor() {
    this.sessionId = SCENARIO_CONFIG.sessionId;
    this.playerName = SCENARIO_CONFIG.playerName;
    this.currentLocation = "grove_entrance";
    this.activeQuests = new Set();
    this.completedQuests = new Set();
    this.earnedFlags = new Set();
    this.earnedItems = new Set();
    this.totalXP = 0;
    this.sessionStartTime = Date.now();
    this.logs = [];
  }

  // Logging methods
  log(message, type = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    this.logs.push(logEntry);
    
    const emoji = this.getEmojiForType(type);
    console.log(`${emoji} ${message}`);
  }

  getEmojiForType(type) {
    const emojiMap = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "❌",
      quest: "🎯",
      npc: "👥",
      location: "🗺️",
      combat: "⚔️",
      reward: "🎁",
      magic: "✨",
      grove: "🌿",
      spirit: "👻",
      shadow: "🌑",
      light: "💡"
    };
    return emojiMap[type] || "ℹ️";
  }

  // Session management
  startSession() {
    this.log("🌿 Welcome to the Fae Grove, brave adventurer!", "grove");
    this.log(`🎮 Starting ${SCENARIO_CONFIG.name} v${SCENARIO_CONFIG.version}`, "info");
    this.log(`👤 Player: ${this.playerName}`, "info");
    this.log(`🆔 Session ID: ${this.sessionId}`, "info");
    this.log("🚀 Session initialized and ready to begin!", "success");
    this.log("", "info");
  }

  endSession() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const durationMinutes = Math.round(sessionDuration / 60000);
    
    this.log("", "info");
    this.log("🏆 Scenario Complete!", "success");
    this.log(`⏱️  Total Session Time: ${durationMinutes} minutes`, "info");
    this.log(`🎯 Quests Completed: ${this.completedQuests.size}/3`, "success");
    this.log(`🏷️  Flags Earned: ${this.earnedFlags.size}`, "info");
    this.log(`🎁 Items Collected: ${this.earnedItems.size}`, "info");
    this.log(`⭐ Total XP Earned: ${this.totalXP}`, "reward");
    this.log("", "info");
    this.log("🎉 Congratulations! You have mastered the Fae Grove!", "success");
    this.log("🔄 Ready for remix challenges and multi-agent playtesting!", "info");
  }

  // Location management
  enterLocation(locationId) {
    const location = LOCATION_REGISTRY[locationId];
    if (!location) {
      this.log(`❌ Unknown location: ${locationId}`, "error");
      return false;
    }

    this.currentLocation = locationId;
    this.log(`🗺️  Entering: ${location.name}`, "location");
    this.log(`📍 Description: ${location.description}`, "info");
    
    if (location.npcs.length > 0) {
      this.log(`👥 NPCs present: ${location.npcs.map(id => NPC_REGISTRY[id].name).join(", ")}`, "npc");
    }
    
    if (location.quests.length > 0) {
      this.log(`🎯 Available quests: ${location.quests.map(id => QUEST_REGISTRY[id].title).join(", ")}`, "quest");
    }

    return true;
  }

  // NPC interaction
  interactWithNPC(npcId) {
    const npc = NPC_REGISTRY[npcId];
    if (!npc) {
      this.log(`❌ Unknown NPC: ${npcId}`, "error");
      return false;
    }

    const location = LOCATION_REGISTRY[this.currentLocation];
    if (!location.npcs.includes(npcId)) {
      this.log(`❌ ${npc.name} is not present in ${location.name}`, "error");
      return false;
    }

    this.log(`👥 Interacting with: ${npc.name}`, "npc");
    this.log(`🏷️  Title: ${npc.title}`, "info");
    this.log(`💬 Personality: ${npc.personality}`, "info");

    if (npc.questGiver.length > 0) {
      this.log(`🎯 Quest Giver for: ${npc.questGiver.map(id => QUEST_REGISTRY[id].title).join(", ")}`, "quest");
    }

    return true;
  }

  // Quest management
  startQuest(questId) {
    const quest = QUEST_REGISTRY[questId];
    if (!quest) {
      this.log(`❌ Unknown quest: ${questId}`, "error");
      return false;
    }

    if (this.completedQuests.has(questId)) {
      this.log(`⚠️  Quest already completed: ${quest.title}`, "warning");
      return false;
    }

    if (this.activeQuests.has(questId)) {
      this.log(`⚠️  Quest already active: ${quest.title}`, "warning");
      return false;
    }

    // Check prerequisites
    if (quest.prerequisites && quest.prerequisites.length > 0) {
      for (const prereq of quest.prerequisites) {
        if (!this.completedQuests.has(prereq)) {
          this.log(`❌ Prerequisites not met for: ${quest.title}`, "error");
          this.log(`🔒 Required: ${prereq}`, "info");
          return false;
        }
      }
    }

    this.activeQuests.add(questId);
    this.log(`🎯 Starting Quest: ${quest.title}`, "quest");
    this.log(`📝 Description: ${quest.description}`, "info");
    this.log(`⚡ Difficulty: ${quest.difficulty}`, "info");
    this.log(`⏱️  Estimated Time: ${quest.estimatedTime}`, "info");
    this.log(`📋 Steps: ${quest.steps.length}`, "info");

    return true;
  }

  completeQuestStep(questId, stepId) {
    const quest = QUEST_REGISTRY[questId];
    if (!quest) {
      this.log(`❌ Unknown quest: ${questId}`, "error");
      return false;
    }

    const step = quest.steps.find(s => s.id === stepId);
    if (!step) {
      this.log(`❌ Unknown step: ${stepId}`, "error");
      return false;
    }

    this.log(`✅ Completed Step: ${step.description}`, "success");
    this.log(`📍 Location: ${LOCATION_REGISTRY[step.location].name}`, "location");
    
    if (step.npc) {
      this.log(`👥 NPC: ${NPC_REGISTRY[step.npc].name}`, "npc");
    }

    return true;
  }

  completeQuest(questId) {
    const quest = QUEST_REGISTRY[questId];
    if (!quest) {
      this.log(`❌ Unknown quest: ${questId}`, "error");
      return false;
    }

    if (!this.activeQuests.has(questId)) {
      this.log(`❌ Quest not active: ${quest.title}`, "error");
      return false;
    }

    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);

    // Apply rewards
    this.totalXP += quest.rewards.xp;
    quest.rewards.items.forEach(item => this.earnedItems.add(item));
    quest.rewards.flags.forEach(flag => this.earnedFlags.add(flag));

    this.log(`🏆 Quest Completed: ${quest.title}`, "success");
    this.log(`⭐ XP Earned: +${quest.rewards.xp}`, "reward");
    this.log(`🎁 Items: ${quest.rewards.items.join(", ")}`, "reward");
    this.log(`🏷️  Flags: ${quest.rewards.flags.join(", ")}`, "reward");
    this.log(`📊 Total XP: ${this.totalXP}`, "info");

    return true;
  }

  // Combat simulation
  simulateCombat(enemyId) {
    const enemy = NPC_REGISTRY[enemyId];
    if (!enemy) {
      this.log(`❌ Unknown enemy: ${enemyId}`, "error");
      return false;
    }

    this.log(`⚔️  Engaging in combat with: ${enemy.name}`, "combat");
    this.log(`🌑 Location: ${LOCATION_REGISTRY[this.currentLocation].name}`, "location");
    
    // Simulate combat rounds
    for (let round = 1; round <= 3; round++) {
      this.log(`🔄 Round ${round}: Exchanging blows...`, "combat");
    }
    
    this.log(`💪 Victory achieved through courage and determination!`, "success");
    this.log(`✨ Shadow creature defeated!`, "spirit");
    
    return true;
  }

  // Magic and special abilities
  castSpell(spellName, target) {
    this.log(`✨ Casting: ${spellName}`, "magic");
    this.log(`🎯 Target: ${target}`, "info");
    this.log(`🌟 Spell effect: Mystical energy flows through the grove`, "magic");
    
    return true;
  }

  // Session progression simulation
  simulateSession() {
    this.startSession();
    
    // Quest 1: Grove Initiation
    this.log("", "info");
    this.log("🌳 === QUEST 1: GROVE INITIATION ===", "quest");
    this.enterLocation("grove_entrance");
    this.interactWithNPC("grove_guardian");
    this.startQuest("grove_initiation");
    
    this.completeQuestStep("grove_initiation", "approach_grove");
    this.completeQuestStep("grove_initiation", "solve_riddle");
    this.completeQuestStep("grove_initiation", "gain_access");
    this.completeQuest("grove_initiation");
    
    // Quest 2: Spirit Whisperer
    this.log("", "info");
    this.log("🗣️  === QUEST 2: SPIRIT WHISPERER ===", "quest");
    this.enterLocation("whispering_hollow");
    this.interactWithNPC("spirit_guide");
    this.startQuest("spirit_whisperer");
    
    this.completeQuestStep("spirit_whisperer", "find_spirit_guide");
    this.completeQuestStep("spirit_whisperer", "learn_whispering");
    this.enterLocation("grove_center");
    this.interactWithNPC("ancient_spirit");
    this.completeQuestStep("spirit_whisperer", "practice_whispering");
    this.completeQuest("spirit_whisperer");
    
    // Quest 3: Trial of Courage
    this.log("", "info");
    this.log("💪 === QUEST 3: TRIAL OF COURAGE ===", "quest");
    this.enterLocation("shadowed_vale");
    this.interactWithNPC("shadow_guardian");
    this.startQuest("trial_of_courage");
    
    this.completeQuestStep("trial_of_courage", "enter_vale");
    this.enterLocation("shadowed_vale_deep");
    this.interactWithNPC("shadow_creature");
    this.simulateCombat("shadow_creature");
    this.completeQuestStep("trial_of_courage", "face_shadows");
    
    this.enterLocation("shadowed_vale");
    this.interactWithNPC("ancient_beacon");
    this.castSpell("Light Restoration", "ancient_beacon");
    this.completeQuestStep("trial_of_courage", "light_beacon");
    this.completeQuest("trial_of_courage");
    
    this.endSession();
  }
}

// Main execution
function main() {
  try {
    const session = new GroveSession();
    session.simulateSession();
  } catch (error) {
    console.error("❌ Error during session simulation:", error.message);
    process.exit(1);
  }
}

// Export for modular use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GroveSession,
    SCENARIO_CONFIG,
    NPC_REGISTRY,
    QUEST_REGISTRY,
    LOCATION_REGISTRY
  };
}

// Run if called directly
if (require.main === module) {
  main();
}