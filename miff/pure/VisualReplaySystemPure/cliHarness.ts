#!/usr/bin/env ts-node

import { 
  createReplaySession, 
  recordFrame, 
  recordInputEvent, 
  updateReplayOutcome, 
  addCheckpoint, 
  generateReplayResult, 
  exportReplayData 
} from './index';
import * as fs from 'fs';

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Usage: ts-node cliHarness.ts <input-file>');
    process.exit(1);
  }

  try {
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.scenarioId || !input.config) {
      throw new Error('Invalid input: missing required fields "scenarioId" and "config"');
    }
    
    const { scenarioId, config, metadata = {}, frames = [], inputEvents = [], outcome = {} } = input;
    
    // Create replay session
    const session = createReplaySession(scenarioId, config, metadata);
    
    // Record frames if provided
    const recordedFrames = [];
    for (const frameData of frames) {
      const frame = recordFrame(
        session,
        frameData.frameNumber,
        frameData.gameState,
        frameData.inputState,
        frameData.visualHooks,
        frameData.metadata
      );
      recordedFrames.push(frame);
    }
    
    // Record input events if provided
    for (const eventData of inputEvents) {
      recordInputEvent(
        session,
        eventData.frameNumber,
        eventData.type,
        eventData.data
      );
    }
    
    // Update outcome if provided
    if (Object.keys(outcome).length > 0) {
      updateReplayOutcome(session, outcome);
    }
    
    // Add checkpoints if provided
    if (input.checkpoints) {
      for (const checkpointData of input.checkpoints) {
        addCheckpoint(
          session,
          checkpointData.frameNumber,
          checkpointData.description,
          checkpointData.passed,
          checkpointData.metrics
        );
      }
    }
    
    // Generate replay result
    const replayResult = generateReplayResult(session, recordedFrames);
    
    // Output JSON result
    console.log(JSON.stringify(replayResult, null, 2));
    
    // Export in requested format if specified
    if (input.exportFormat) {
      const exported = exportReplayData(replayResult, input.exportFormat);
      if (input.exportFormat === 'csv' || input.exportFormat === 'summary') {
        console.error('\n' + exported);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});