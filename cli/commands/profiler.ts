#!/usr/bin/env node

/**
 * profiler.ts - CLI commands for ProfilerPure module
 * 
 * Provides commands for performance profiling and debugging.
 */

import { Command } from 'commander';
import { createProfiler, ProfilerConfig } from '../../miff/pure/ProfilerPure/ProfilerPure';

const program = new Command();

program
  .name('profiler')
  .description('Performance profiling and debugging commands for MIFF games')
  .version('1.0.0');

program
  .command('start')
  .description('Start performance profiling')
  .option('-f, --frames <number>', 'Maximum frames to capture', '100')
  .option('-r, --sample-rate <number>', 'Sample rate in Hz', '60')
  .option('-c, --categories <list>', 'Comma-separated list of categories to profile')
  .option('-o, --output <format>', 'Output format (json, csv, console)', 'console')
  .action(async (options) => {
    console.log('📊 Starting performance profiler...');

    const config: ProfilerConfig = {
      enabled: true,
      maxFrames: parseInt(options.frames),
      sampleRate: parseInt(options.sampleRate),
      categories: options.categories ? options.categories.split(',') : ['default'],
      autoStart: true,
      outputFormat: options.output as 'json' | 'csv' | 'console'
    };

    const profiler = createProfiler(config);

    // Add observer for real-time output
    profiler.addObserver({
      id: 'cli_observer',
      onFrameEnd: (frame) => {
        console.log(`Frame ${frame.frameNumber}: ${frame.duration.toFixed(2)}ms`);
      },
      onSampleEnd: (sample) => {
        if (sample.duration && sample.duration > 10) { // Only log slow samples
          console.log(`  ${sample.name}: ${sample.duration.toFixed(2)}ms`);
        }
      }
    });

    console.log('✅ Profiler started');
    console.log(`Configuration: ${JSON.stringify(config, null, 2)}`);

    // Simulate some profiling activity
    await simulateProfiling(profiler);

    // Generate and display report
    console.log('\n📋 Generating profiler report...');
    const report = profiler.exportReport(options.output);
    console.log(report);
  });

program
  .command('simulate')
  .description('Simulate performance profiling scenario')
  .option('-d, --duration <seconds>', 'Simulation duration in seconds', '5')
  .option('-f, --frames <number>', 'Frames per second', '60')
  .option('-o, --output <format>', 'Output format (json, csv, console)', 'console')
  .action(async (options) => {
    const duration = parseInt(options.duration);
    const fps = parseInt(options.frames);
    const frameTime = 1000 / fps;
    
    console.log(`🎮 Simulating ${duration}s of profiling at ${fps} FPS...`);

    const config: ProfilerConfig = {
      enabled: true,
      maxFrames: duration * fps,
      sampleRate: fps,
      categories: ['rendering', 'physics', 'ai', 'audio', 'network'],
      autoStart: true,
      outputFormat: options.output as 'json' | 'csv' | 'console'
    };

    const profiler = createProfiler(config);

    // Simulate game loop
    const startTime = Date.now();
    let frameCount = 0;

    while (Date.now() - startTime < duration * 1000) {
      profiler.startFrame(frameCount);

      // Simulate rendering
      const renderSample = profiler.beginSample('Render', 'rendering');
      await simulateWork(5 + Math.random() * 10); // 5-15ms
      profiler.endSample(renderSample);

      // Simulate physics
      const physicsSample = profiler.beginSample('Physics', 'physics');
      await simulateWork(2 + Math.random() * 8); // 2-10ms
      profiler.endSample(physicsSample);

      // Simulate AI
      const aiSample = profiler.beginSample('AI Update', 'ai');
      await simulateWork(1 + Math.random() * 5); // 1-6ms
      profiler.endSample(aiSample);

      // Record metrics
      profiler.recordMetric('Memory Usage', 100 + Math.random() * 50, 'MB', 'system');
      profiler.recordMetric('Active Entities', 50 + Math.floor(Math.random() * 100), 'count', 'game');

      profiler.endFrame();
      frameCount++;

      // Maintain target frame rate
      const elapsed = Date.now() - startTime;
      const targetTime = frameCount * frameTime;
      if (elapsed < targetTime) {
        await new Promise(resolve => setTimeout(resolve, targetTime - elapsed));
      }
    }

    console.log(`✅ Simulation completed: ${frameCount} frames in ${duration}s`);

    // Generate report
    console.log('\n📋 Performance Report:');
    const report = profiler.exportReport(options.output);
    console.log(report);
  });

program
  .command('analyze')
  .description('Analyze performance data from file')
  .argument('<file>', 'Performance data file (JSON)')
  .option('-o, --output <format>', 'Output format (json, csv, console)', 'console')
  .action(async (file, options) => {
    console.log(`📊 Analyzing performance data from ${file}...`);

    try {
      const fs = require('fs');
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));

      // Create profiler and load data
      const config: ProfilerConfig = {
        enabled: false,
        maxFrames: 1000,
        sampleRate: 60,
        categories: [],
        autoStart: false,
        outputFormat: options.output as 'json' | 'csv' | 'console'
      };

      const profiler = createProfiler(config);
      
      // In a real implementation, you would load the data into the profiler
      // For now, we'll just analyze the JSON directly
      
      console.log('📋 Analysis Results:');
      console.log(`Total Frames: ${data.frames?.length || 0}`);
      
      if (data.frames && data.frames.length > 0) {
        const frameTimes = data.frames.map((f: any) => f.duration);
        const avgFrameTime = frameTimes.reduce((a: number, b: number) => a + b, 0) / frameTimes.length;
        const minFrameTime = Math.min(...frameTimes);
        const maxFrameTime = Math.max(...frameTimes);
        
        console.log(`Average Frame Time: ${avgFrameTime.toFixed(2)}ms`);
        console.log(`Min Frame Time: ${minFrameTime.toFixed(2)}ms`);
        console.log(`Max Frame Time: ${maxFrameTime.toFixed(2)}ms`);
        
        if (avgFrameTime > 16.67) {
          console.log('⚠️  Performance Warning: Average frame time exceeds 60 FPS target');
        }
        if (maxFrameTime > 33.33) {
          console.log('⚠️  Performance Warning: Frame time spikes detected');
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to analyze performance data:', error instanceof Error ? error.message : String(error));
    }
  });

program
  .command('benchmark')
  .description('Run performance benchmarks')
  .option('-i, --iterations <number>', 'Number of iterations', '100')
  .option('-w, --warmup <number>', 'Warmup iterations', '10')
  .option('-o, --output <format>', 'Output format (json, csv, console)', 'console')
  .action(async (options) => {
    const iterations = parseInt(options.iterations);
    const warmup = parseInt(options.warmup);
    
    console.log(`🏃 Running performance benchmark (${warmup} warmup + ${iterations} iterations)...`);

    const config: ProfilerConfig = {
      enabled: true,
      maxFrames: iterations + warmup,
      sampleRate: 60,
      categories: ['benchmark'],
      autoStart: true,
      outputFormat: options.output as 'json' | 'csv' | 'console'
    };

    const profiler = createProfiler(config);

    // Warmup phase
    console.log('🔥 Warmup phase...');
    for (let i = 0; i < warmup; i++) {
      profiler.startFrame(i);
      
      const sample = profiler.beginSample('Benchmark Operation', 'benchmark');
      await simulateWork(1 + Math.random() * 5);
      profiler.endSample(sample);
      
      profiler.endFrame();
    }

    // Benchmark phase
    console.log('⚡ Benchmark phase...');
    const benchmarkStart = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      profiler.startFrame(warmup + i);
      
      const sample = profiler.beginSample('Benchmark Operation', 'benchmark');
      await simulateWork(1 + Math.random() * 5);
      profiler.endSample(sample);
      
      profiler.endFrame();
    }
    
    const benchmarkEnd = performance.now();
    const totalTime = benchmarkEnd - benchmarkStart;

    console.log(`✅ Benchmark completed in ${totalTime.toFixed(2)}ms`);
    console.log(`Average time per iteration: ${(totalTime / iterations).toFixed(2)}ms`);

    // Generate report
    console.log('\n📋 Benchmark Report:');
    const report = profiler.exportReport(options.output);
    console.log(report);
  });

// Helper functions
async function simulateProfiling(profiler: any): Promise<void> {
  console.log('🎮 Simulating game loop...');
  
  for (let frame = 0; frame < 60; frame++) {
    profiler.startFrame(frame);

    // Simulate different types of work
    const renderSample = profiler.beginSample('Render', 'rendering');
    await simulateWork(8 + Math.random() * 12); // 8-20ms
    profiler.endSample(renderSample);

    const physicsSample = profiler.beginSample('Physics', 'physics');
    await simulateWork(3 + Math.random() * 7); // 3-10ms
    profiler.endSample(physicsSample);

    const aiSample = profiler.beginSample('AI', 'ai');
    await simulateWork(2 + Math.random() * 4); // 2-6ms
    profiler.endSample(aiSample);

    // Record some metrics
    profiler.recordMetric('Memory', 150 + Math.random() * 50, 'MB', 'system');
    profiler.recordMetric('Entities', 100 + Math.floor(Math.random() * 200), 'count', 'game');

    profiler.endFrame();

    // Simulate frame rate
    await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
  }
}

async function simulateWork(duration: number): Promise<void> {
  const start = performance.now();
  while (performance.now() - start < duration) {
    // Busy wait to simulate work
    Math.random() * Math.random();
  }
}

export default program;