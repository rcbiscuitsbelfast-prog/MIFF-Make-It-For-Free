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

  // Add timeout to prevent CI hangs
  const timeout = setTimeout(() => {
    console.error('ERROR: VisualReplaySystemPure timeout after 25 seconds - preventing CI hang');
    process.exit(1);
  }, 25000);

  try {
    console.error('DEBUG: Starting VisualReplaySystemPure CLI harness');
    const input = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
    console.error('DEBUG: Input file parsed successfully');
    
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: expected JSON object');
    }
    
    if (!input.scenarioId || !input.config) {
      throw new Error('Invalid input: missing required fields "scenarioId" and "config"');
    }
    
    const { scenarioId, config, metadata = {}, frames = [], inputEvents = [], outcome = {} } = input;
    console.error(`DEBUG: Processing scenario ${scenarioId} with ${frames.length} frames, ${inputEvents.length} input events`);
    
    // Create replay session
    console.error('DEBUG: Creating replay session');
    const session = createReplaySession(scenarioId, config, metadata);
    console.error(`DEBUG: Session created with ID: ${session.id}`);
    
    // Record frames if provided
    console.error('DEBUG: Recording frames');
    const recordedFrames = [];
    for (let i = 0; i < frames.length; i++) {
      const frameData = frames[i];
      console.error(`DEBUG: Recording frame ${i + 1}/${frames.length} (frameNumber: ${frameData.frameNumber})`);
      
      const frame = recordFrame(
        session,
        frameData.frameNumber,
        frameData.gameState,
        frameData.inputState,
        frameData.visualHooks,
        frameData.metadata
      );
      recordedFrames.push(frame);
      console.error(`DEBUG: Frame ${frameData.frameNumber} recorded with ${frameData.visualHooks.length} visual hooks`);
    }
    
    // Record input events if provided
    console.error('DEBUG: Recording input events');
    for (let i = 0; i < inputEvents.length; i++) {
      const eventData = inputEvents[i];
      console.error(`DEBUG: Recording input event ${i + 1}/${inputEvents.length} (type: ${eventData.type})`);
      
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
    console.error('DEBUG: Generating replay result');
    const replayResult = generateReplayResult(session, recordedFrames);
    console.error('DEBUG: Replay result generated successfully');
    
    // Clear timeout since we completed successfully
    clearTimeout(timeout);
    
    // Output JSON result
    console.log(JSON.stringify(replayResult, null, 2));
    console.error('DEBUG: JSON output completed');
    
    // Export in requested format if specified
    if (input.exportFormat) {
      console.error(`DEBUG: Exporting in format: ${input.exportFormat}`);
      const exported = exportReplayData(replayResult, input.exportFormat);
      if (input.exportFormat === 'csv' || input.exportFormat === 'summary') {
        console.error('\n' + exported);
      }
      console.error('DEBUG: Export completed');
    }
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('ERROR: VisualReplaySystemPure failed:', error);
    console.error('ERROR: Stack trace:', (error as Error).stack);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('FATAL: Unhandled promise rejection in VisualReplaySystemPure:', error);
  console.error('FATAL: Stack trace:', (error as Error).stack);
  process.exit(1);
});