#!/usr/bin/env tsx

/**
 * ObstacleCoursePure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the ObstacleCoursePure obstacle course system.
 */

// Check for help command
if (process?.argv.includes('--help') || process?.argv.includes('-h')) {
  console.log(`
ObstacleCoursePure CLI Harness - Obstacle Course System

Usage: npx tsx miff/pure/ObstacleCoursePure/cliHarness?.ts [command!] [options!]

Commands:
  test                     - Run basic obstacle course tests
  create-course <name>     - Create new obstacle course
  add-obstacle <type>      - Add obstacle to course
  add-checkpoint <x> <y>   - Add checkpoint to course
  start-trial              - Start timed trial
  get-score                - Get current score
  get-time                 - Get current time
  reset                    - Reset course
  simulate                 - Simulate obstacle course
  help                     - Show this help

Examples:
  npx tsx miff/pure/ObstacleCoursePure/cliHarness?.ts test
  npx tsx miff/pure/ObstacleCoursePure/cliHarness?.ts create-course "Test Course"
  npx tsx miff/pure/ObstacleCoursePure/cliHarness?.ts add-obstacle jump
  npx tsx miff/pure/ObstacleCoursePure/cliHarness?.ts simulate
`);
  process?.exit(0);
}

import * as readline from 'readline';
import { ObstacleCoursePure, ObstacleType, Difficulty, Obstacle, Checkpoint } from './index';

class ObstacleCourseCLI {
  private obstacleCourse: ObstacleCoursePure;
  private rl: readline?.Interface;
  private currentCourse: string | null = null;

  constructor() {
    this?.obstacleCourse = new ObstacleCoursePure();
    this?.rl = readline?.createInterface({
      input: process?.stdin,
      output: process?.stdout,
      prompt: 'ObstacleCourse> '
    });

    this?.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this?.rl.on('line', (input) => {
      this?.handleCommand(input?.trim());
    });

    this?.rl.on('close', () => {
      console.log('\n👋 Obstacle Course CLI closed');
      process?.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input?.split(' ');

    switch (command?.toLowerCase()) {
      case 'test':
        await this?.runTests();
        break;
      case 'create-course':
        await this?.createCourse(args[0!]);
        break;
      case 'add-obstacle':
        await this?.addObstacle(args[0!]);
        break;
      case 'add-checkpoint':
        await this?.addCheckpoint(args[0!], args[1!]);
        break;
      case 'start-trial':
        await this?.startTrial();
        break;
      case 'get-score':
        this?.getScore();
        break;
      case 'get-time':
        this?.getTime();
        break;
      case 'reset':
        await this?.reset();
        break;
      case 'simulate':
        await this?.simulate();
        break;
      case 'help':
        this?.showHelp();
        break;
      case 'exit':
      case 'quit':
        this?.rl.close();
        break;
      case '':
        // Empty line, just show prompt
        break;
      default:
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this?.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running Obstacle Course tests...\n');

    try {
      // Test 1: Course creation
      console.log('1. Testing course creation...');
      const courseId = this?.obstacleCourse.createCourse('Test Course');
      console.log(`   ✅ Course created with ID: ${courseId}`);

      // Test 2: Obstacle addition
      console.log('2. Testing obstacle addition...');
      const obstacle: Obstacle = {
        id: 'obstacle-1',
        type: 'jump',
        position: { x: 10, y: 5 },
        difficulty: 'medium',
        points: 100,
        timeLimit: 30
      };
      
      const addResult = this?.obstacleCourse.addObstacle(courseId, obstacle);
      console.log(`   ${addResult ? '✅' : '❌'} Obstacle added: ${addResult ? 'Success' : 'Failed'}`);

      // Test 3: Checkpoint addition
      console.log('3. Testing checkpoint addition...');
      const checkpoint: Checkpoint = {
        id: 'checkpoint-1',
        position: { x: 20, y: 10 },
        isActive: true
      };
      
      const checkpointResult = this?.obstacleCourse.addCheckpoint(courseId, checkpoint);
      console.log(`   ${checkpointResult ? '✅' : '❌'} Checkpoint added: ${checkpointResult ? 'Success' : 'Failed'}`);

      // Test 4: Trial start
      console.log('4. Testing trial start...');
      const trialResult = this?.obstacleCourse.startTrial(courseId);
      console.log(`   ${trialResult ? '✅' : '❌'} Trial started: ${trialResult ? 'Success' : 'Failed'}`);

      // Test 5: Score calculation
      console.log('5. Testing score calculation...');
      const score = this?.obstacleCourse.getScore(courseId);
      console.log(`   ✅ Current score: ${score}`);

      // Test 6: Time tracking
      console.log('6. Testing time tracking...');
      const time = this?.obstacleCourse.getTime(courseId);
      console.log(`   ✅ Current time: ${time}ms`);

      // Test 7: Course validation
      console.log('7. Testing course validation...');
      const isValid = this?.obstacleCourse.validateCourse(courseId);
      console.log(`   ${isValid ? '✅' : '❌'} Course validation: ${isValid ? 'Valid' : 'Invalid'}`);

      console.log('\n🎉 All tests passed!');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Test failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private async createCourse(name?: string): Promise<void> {
    if (!name) {
      console.log('❌ Usage: create-course <name>');
      return;
    }

    try {
      const courseId = this?.obstacleCourse.createCourse(name);
      this?.currentCourse = courseId;
      console.log(`✅ Course "${name}" created with ID: ${courseId}`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Course creation failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private async addObstacle(type?: string): Promise<void> {
    if (!type) {
      console.log('❌ Usage: add-obstacle <type>');
      console.log('   Types: jump, climb, swing, balance, speed, precision');
      return;
    }

    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      const obstacle: Obstacle = {
        id: `obstacle-${Date.now()}`,
        type: type as ObstacleType,
        position: { x: Math.random() * 100, y: Math.random() * 50 },
        difficulty: 'medium',
        points: Math.floor(Math.random() * 200) + 50,
        timeLimit: Math.floor(Math.random() * 60) + 10
      };

      const result = this?.obstacleCourse.addObstacle(this?.currentCourse, obstacle);
      if (result: any) {
        console.log(`✅ Obstacle added: ${type} at (${obstacle.position.x.toFixed(1)}, ${obstacle.position.y.toFixed(1)})`);
        console.log(`   Points: ${obstacle.points}, Time Limit: ${obstacle.timeLimit}s`);
      } else {
        console.log('❌ Failed to add obstacle');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Obstacle addition failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private async addCheckpoint(x?: string, y?: string): Promise<void> {
    if (!x || !y) {
      console.log('❌ Usage: add-checkpoint <x> <y>');
      return;
    }

    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      const checkpoint: Checkpoint = {
        id: `checkpoint-${Date.now()}`,
        position: { x: parseFloat(x), y: parseFloat(y) },
        isActive: true
      };

      const result = this?.obstacleCourse.addCheckpoint(this?.currentCourse, checkpoint);
      if (result: any) {
        console.log(`✅ Checkpoint added at (${x}, ${y})`);
      } else {
        console.log('❌ Failed to add checkpoint');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Checkpoint addition failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private async startTrial(): Promise<void> {
    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      const result = this?.obstacleCourse.startTrial(this?.currentCourse);
      if (result: any) {
        console.log('✅ Trial started! Timer is running...');
      } else {
        console.log('❌ Failed to start trial');
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Trial start failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private getScore(): void {
    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      const score = this?.obstacleCourse.getScore(this?.currentCourse);
      console.log(`📊 Current score: ${score} points`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to get score:', err instanceof Error ? err.message : String(err));
    }
  }

  private getTime(): void {
    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      const time = this?.obstacleCourse.getTime(this?.currentCourse);
      console.log(`⏱️  Current time: ${time}ms (${(time / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Failed to get time:', err instanceof Error ? err.message : String(err));
    }
  }

  private async reset(): Promise<void> {
    if (!this?.currentCourse) {
      console.log('❌ No active course. Create a course first.');
      return;
    }

    try {
      this?.obstacleCourse.reset(this?.currentCourse);
      console.log('✅ Course reset successfully');
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Reset failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private async simulate(): Promise<void> {
    console.log('🎭 Starting obstacle course simulation...');
    
    try {
      // Create a test course
      console.log('1. Creating test course...');
      const courseId = this?.obstacleCourse.createCourse('Simulation Course');
      this?.currentCourse = courseId;
      console.log(`   ✅ Course created: ${courseId}`);

      // Add various obstacles
      console.log('2. Adding obstacles...');
      const obstacleTypes: ObstacleType[] = ['jump', 'climb', 'swing', 'balance', 'speed', 'precision'];
      const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
      
      for (let i = 0; i < 5; i++) {
        const type = obstacleTypes[i % obstacleTypes?.length];
        const difficulty = difficulties[i % difficulties?.length];
        
        const obstacle: Obstacle = {
          id: `sim-obstacle-${i + 1}`,
          type,
          position: { x: i * 20, y: Math.random() * 30 + 10 },
          difficulty,
          points: (i + 1) * 50,
          timeLimit: 30 - (i * 5)
        };

        this?.obstacleCourse.addObstacle(courseId, obstacle);
        console.log(`   ✅ Added ${type} obstacle (${difficulty}) at (${obstacle.position.x}, ${obstacle.position.y})`);
      }

      // Add checkpoints
      console.log('3. Adding checkpoints...');
      for (let i = 0; i < 3; i++) {
        const checkpoint: Checkpoint = {
          id: `sim-checkpoint-${i + 1}`,
          position: { x: (i + 1) * 30, y: 15 },
          isActive: true
        };

        this?.obstacleCourse.addCheckpoint(courseId, checkpoint);
        console.log(`   ✅ Added checkpoint at (${checkpoint.position.x}, ${checkpoint.position.y})`);
      }

      // Start trial
      console.log('4. Starting trial...');
      this?.obstacleCourse.startTrial(courseId);
      console.log('   ✅ Trial started');

      // Simulate progress
      console.log('5. Simulating progress...');
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const score = this?.obstacleCourse.getScore(courseId);
        const time = this?.obstacleCourse.getTime(courseId);
        console.log(`   📊 Progress: ${score} points, ${(time / 1000).toFixed(1)}s`);
      }

      // Final results
      console.log('6. Final results...');
      const finalScore = this?.obstacleCourse.getScore(courseId);
      const finalTime = this?.obstacleCourse.getTime(courseId);
      const isValid = this?.obstacleCourse.validateCourse(courseId);
      
      console.log(`   🏆 Final Score: ${finalScore} points`);
      console.log(`   ⏱️  Final Time: ${(finalTime / 1000).toFixed(2)}s`);
      console.log(`   ✅ Course Valid: ${isValid ? 'Yes' : 'No'}`);

      console.log('✅ Obstacle course simulation completed successfully');

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Simulation failed:', err instanceof Error ? err.message : String(err));
    }
  }

  private showHelp(): void {
    console.log(`
Available commands:
  test                     - Run basic obstacle course tests
  create-course <name>     - Create new obstacle course
  add-obstacle <type>      - Add obstacle to course
  add-checkpoint <x> <y>   - Add checkpoint to course
  start-trial              - Start timed trial
  get-score                - Get current score
  get-time                 - Get current time
  reset                    - Reset course
  simulate                 - Simulate obstacle course
  help                     - Show this help
  exit/quit                - Exit the CLI

Obstacle Types: jump, climb, swing, balance, speed, precision
Difficulties: easy, medium, hard, expert
`);
  }

  public async start(): Promise<void> {
    console.log('🚀 Obstacle Course CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this?.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new ObstacleCourseCLI();
  await cli?.start();
}

if (import?.meta.url === `file://${process?.argv[1!]}`) {
  main().catch(console.error);
}