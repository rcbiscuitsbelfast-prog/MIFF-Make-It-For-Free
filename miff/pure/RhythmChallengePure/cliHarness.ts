#!/usr/bin/env tsx
/**
 * CLI Harness for RhythmChallengePure
 * Handles rhythm game mechanics and note sequences
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { RhythmChallengePure, RhythmNote, RhythmSequence } from './index';

const { mode, params } = parseKeyValueArgs(process?.argv);

// In Node CI environments, ensure loadSequence is safe (no audio backends required)
const isCI = process?.env.CI === 'true' || (params && (params as any).ci === true);

const system = new RhythmChallengePure();

try {
  switch (mode) {
    case 'rhythmChallenge': {
      const { song, bpm, notes, difficulty } = params;
      
      // Create rhythm sequence
      const sequence: RhythmSequence = {
        id: song || 'temple_hymn',
        name: song || 'Temple Hymn',
        bpm: bpm || 120,
        noteCount: notes || 50,
        difficulty: difficulty || 'hard',
        duration: ((notes || 50) * 60) / (bpm || 120), // Calculate duration
        pattern: []
      };
      
      // Generate note pattern
      for (let i = 0; i < (notes || 50); i++) {
        const note: RhythmNote = {
          id: `note_${i}`,
          timing: (i * 60) / (bpm || 120),
          lane: Math.floor(Math.random() * 4),
          type: ['normal', 'hold', 'special'][Math.floor(Math.random() * 3)] as any,
          hit: false
        };
        sequence?.pattern?.push(note);
      }
      
      system?.loadSequence(sequence);
      
      // Simulate playthrough
      const result = system?.play({
        perfectHits: Math.floor((notes || 50) * 0.7),
        goodHits: Math.floor((notes || 50) * 0.2),
        missedHits: Math.floor((notes || 50) * 0.1)
      });
      
      handleSuccess({
        sequence,
        result,
        score: result?.score,
        accuracy: result?.accuracy,
        grade: result?.grade
      }, 'rhythmChallenge');
      break;
    }

    case 'startChallenge': {
      const { sequenceId } = params;
      system?.startChallenge(sequenceId || 'default');
      
      handleSuccess({
        sequenceId,
        started: true,
        status: 'Challenge started'
      }, 'startChallenge');
      break;
    }

    case 'hitNote': {
      const { noteId, timing, accuracy } = params;
      const result = system?.hitNote(noteId, timing || 0, accuracy || 0.95);
      
      handleSuccess({
        noteId,
        hit: result?.hit,
        score: result?.score,
        combo: result?.combo
      }, 'hitNote');
      break;
    }

    case 'getScore': {
      const score = system?.getCurrentScore();
      handleSuccess({
        score,
        combo: system?.getCurrentCombo(),
        accuracy: system?.getAccuracy()
      }, 'getScore');
      break;
    }

    case 'listSequences': {
      const sequences = system?.getAvailableSequences();
      handleSuccess({
        sequences,
        count: sequences?.length
      }, 'listSequences');
      break;
    }

    default:
      // Default: show status
      handleSuccess({
        availableSequences: system?.getAvailableSequences().length,
        highScore: system?.getHighScore(),
        status: 'Ready'
      }, mode || 'status');
      break;
  }
} catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
  handleError(error);
}
