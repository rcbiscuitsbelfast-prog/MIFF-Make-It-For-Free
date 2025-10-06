export {
  DialogueParser,
  DialogueEngine,
  type DialogueTree,
  type DialogueNode,
  type DialogueChoice,
  type DialogueCondition,
  type DialogueAction,
  type DialogueContext,
  type DialogueResult,
  createDialogueEngine
} from './Manager';

// Default export for compatibility
export { DialogueEngine as default } from './Manager';