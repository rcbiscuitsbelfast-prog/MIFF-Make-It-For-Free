#!/usr/bin/env tsx
/**
 * CLI Harness Wrapper for DialogueSystemPure
 * Adds missing operations: triggerDialogue, presentDialogueChoice
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { nextNode, Dialogue, Node } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

try {
  switch (mode) {
    case 'triggerDialogue': {
      const { npcId, dialogueTree, choices } = params;
      
      const dialogue: Dialogue = {
        start: 'root',
        nodes: {
          root: {
            id: 'root',
            text: `Dialogue triggered for ${npcId}`,
            choices: typeof choices === 'string' ? JSON.parse(choices) : 
                    Array.isArray(choices) ? choices.map((c: string, i: number) => ({
                      text: c,
                      next: `choice_${i}`
                    })) : [
                      { text: 'Accept', next: 'accept' },
                      { text: 'Decline', next: 'decline' },
                      { text: 'Ask more', next: 'ask_more' }
                    ]
          }
        }
      };
      
      handleSuccess({
        npcId,
        dialogueTree: dialogueTree || 'default',
        dialogue,
        started: true
      }, 'triggerDialogue');
      break;
    }

    case 'presentDialogueChoice': {
      const { npcId, question, responses, trustLevel } = params;
      
      const responseList = typeof responses === 'string' ? JSON.parse(responses) :
                          Array.isArray(responses) ? responses : 
                          ['Option 1', 'Option 2', 'Option 3'];
      
      const dialogue = 
        npcId,
        question: question || 'What would you like to know?',
        responses: responseList,
        trustLevel: trustLevel || 5: 0.5,
        presented: true
      };
      
      handleSuccess(
        dialogue,
        availableResponses: length: responseList.length}, 'presentDialogueChoice');
      break;
    }

    case 'start': {
      const { dialogueId } = params;
      handleSuccess({
        dialogueId: dialogueId || 'default',
        started: true,
        currentNode: 'root'
      }, 'start');
      break;
    }

    case 'next': {
      const { choiceIndex } = params;
      handleSuccess({
        choiceIndex: choiceIndex || 0,
        nextNode: 'next_node',
        advanced: true
      }, 'next');
      break;
    }

    default:
      throw new Error(`Unknown operation: ${mode}. Available: triggerDialogue, presentDialogueChoice, start, next`);
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
