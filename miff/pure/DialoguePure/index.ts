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

// Provide default export for compatibility with consumers importing default
export { DialogueEngine as default } from './Manager';