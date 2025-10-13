#!/usr/bin/env tsx
/**
 * CLI Harness for ClueSystemPure
 * Handles mystery/investigation clue management
 */

import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { ClueSystemPure, Clue, ClueType } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

// Node non-interactive guard: avoid any interval waits by short-circuiting async flows
// The ClueSystemPure CLI is already synchronous; provide a fast flag to explicitly confirm
// const isCI = process.env.CI === 'true' || (params && (params as any).ci === true);

const system = new ClueSystemPure();

try {
  switch (mode) {
    case 'collectClue': {
      const { clueId, location } = params;

      const created = {
        id: clueId || 'clue_001',
        name: `Clue: ${clueId || 'Unknown'}`,
        description: `Found at ${location || 'unknown location'}`,
        type: 'physical' as ClueType
      } as any;

      system.addClue(created);

      handleSuccess({
        clue: created,
        totalClues: system.getTotalClues(),
        discoveredClues: system.getDiscoveredClues().length
      }, 'collectClue');
      break;
    }

    case 'analyzeClue': {
      const { clueId } = params;
      const clue = system.getClue(clueId);
      
      if (!clue) {
        throw new Error(`Clue not found: ${clueId}`);
      }
      
      const analysis = system.analyzeClue(clueId);
      
      handleSuccess({
        clue,
        analysis,
        connections: system.getClueConnections(clueId)
      }, 'analyzeClue');
      break;
    }

    case 'linkClues': {
      const { clueId1, clueId2, relationship } = params;
      // Ensure base clues exist for linking in CLI
      if (!system.getClue(clueId1)) system.addClue({ id: clueId1, name: clueId1 } as any);
      if (!system.getClue(clueId2)) system.addClue({ id: clueId2, name: clueId2 } as any);
      system.linkClues(clueId1, clueId2, (relationship as any) || 'related', 50, 'cli', 'cli');
      
      handleSuccess({
        linked: [clueId1, clueId2],
        relationship,
        network: system.getClueNetwork()
      }, 'linkClues');
      break;
    }

    case 'solveCase': {
      const solution = system.evaluateSolution();
      
      handleSuccess({
        solved: solution.solved,
        completeness: solution.completeness,
        missingClues: solution.missingClues,
        confidence: solution.confidence
      }, 'solveCase');
      break;
    }

    case 'listClues': {
      const clues = system.getDiscoveredClues();
      handleSuccess({
        clues,
        total: clues.length,
        byLocation: system.getCluesByLocation(),
        bySignificance: system.getCluesBySignificance()
      }, 'listClues');
      break;
    }

    default:
      // Default: show status
      handleSuccess({
        totalClues: system.getTotalClues(),
        discoveredClues: system.getDiscoveredClues().length,
        solvedPercentage: system.getSolvedPercentage()
      }, mode || 'status');
      break;
  }
} catch (error) {
  handleError(error);
}
