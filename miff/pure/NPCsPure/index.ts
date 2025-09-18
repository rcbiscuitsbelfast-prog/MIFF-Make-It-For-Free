/**
 * NPCsPure Module
 * 
 * Comprehensive NPC management system including behavior simulation,
 * quest integration, faction management, and location tracking.
 * 
 * @module NPCsPure
 * @version 1.0.0
 * @license MIT
 */

export { 
  NPCsManager,
  type NPC,
  type NPBehavior,
  type NPCLocation,
  type MovementPattern,
  type DailySchedule,
  type DialogueNode,
  type DialogueCondition,
  type DialogueAction,
  type NPCOperation,
  type NPCFilter,
  type NPCSimulation,
  type NPCInteraction,
  type NPCOutput
} from './Manager';

export { EntityID, StatBlock } from '../SharedSchemaPure/Manager';