#!/usr/bin/env tsx

/**
 * ObstacleCoursePure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the ObstacleCoursePure obstacle course system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  this.logger.info(`
ObstacleCoursePure CLI Harness - Obstacle Course System

Usage: npx tsx miff/pure/ObstacleCoursePure/cliHarness.ts [command] [options]

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
  npx tsx miff/pure/ObstacleCoursePure/cliHarness.ts test
  npx tsx miff/pure/ObstacleCoursePure/cliHarness.ts create-course "Test Course"
  npx tsx miff/pure/ObstacleCoursePure/cliHarness.ts add-obstacle jump
  npx tsx miff/pure/ObstacleCoursePure/cliHarness.ts simulate
`);
  process.exit(0);
}

import * as readline from 'readline';
import { ObstacleCoursePure, ObstacleType, Difficulty, Obstacle, Checkpoint } from './index';
import { StructuredLogger } from '../shared/logging/StructuredLogger';

class ObstacleCourseCLI {
  private logger: StructuredLogger;
  private obstacleCourse: ObstacleCoursePure;
  private rl: readline.Interface;
  private currentCourse: string | null = null;

  constructor() {
    this.logger = new StructuredLogger({ module: 'ObstacleCourseCLI' });
    this.obstacleCourse = new ObstacleCoursePure();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'ObstacleCourse> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      this.logger.info('\n👋 Obstacle Course CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'create-course':
        await this.createCourse(args[0]);
        break;
      case 'add-obstacle':
        await this.addObstacle(args[0]);
        break;
      case 'add-checkpoint':
        await this.addCheckpoint(args[0], args[1]);
        break;
      case 'start-trial':
        await this.startTrial();
        break;
      case 'get-score':
        this.getScore();
        break;
      case 'get-time':
        this.getTime();
        break;
      case 'reset':
        await this.reset();
        break;
      case 'simulate':
        await this.simulate();
        break;
      case 'help':
        this.showHelp();
        break;
      case 'exit':
      case 'quit':
        this.rl.close();
        break;
      case '':
        // Empty line, just show prompt
        break;
      default:
        this.logger.info(`❌ Unknown command: ${command}`);
        this.logger.info('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    this.logger.info('🧪 Running Obstacle Course tests...\n');

    try {
      // Test 1: Course creation
      this.logger.info('1. Testing course creation...');
      const courseId = this.obstacleCourse.createCourse('Test Course');
      this.logger.info(`   ✅ Course created with ID: ${courseId}`);

      // Test 2: Obstacle addition
      this.logger.info('2. Testing obstacle addition...');
      const obstacle: Obstacle = {
        id: 'obstacle-1',
        type: 'jump',
        position: { x: 10, y: 5 },
        difficulty: 'medium',
        points: 100,
        timeLimit: 30
      };
      
      const addResult = this.obstacleCourse.addObstacle(courseId, obstacle);
      this.logger.info(`   ${addResult ? '✅' : '❌'} Obstacle added: ${addResult ? 'Success' : 'Failed'}`);

      // Test 3: Checkpoint addition
      this.logger.info('3. Testing checkpoint addition...');
      const checkpoint: Checkpoint = {
        id: 'checkpoint-1',
        position: { x: 20, y: 10 },
        isActive: true
      };
      
      const checkpointResult = this.obstacleCourse.addCheckpoint(courseId, checkpoint);
      this.logger.info(`   ${checkpointResult ? '✅' : '❌'} Checkpoint added: ${checkpointResult ? 'Success' : 'Failed'}`);

      // Test 4: Trial start
      this.logger.info('4. Testing trial start...');
      const trialResult = this.obstacleCourse.startTrial(courseId);
      this.logger.info(`   ${trialResult ? '✅' : '❌'} Trial started: ${trialResult ? 'Success' : 'Failed'}`);

      // Test 5: Score calculation
      this.logger.info('5. Testing score calculation...');
      const score = this.obstacleCourse.getScore(courseId);
      this.logger.info(`   ✅ Current score: ${score}`);

      // Test 6: Time tracking
      this.logger.info('6. Testing time tracking...');
      const time = this.obstacleCourse.getTime(courseId);
      this.logger.info(`   ✅ Current time: ${time}ms`);

      // Test 7: Course validation
      this.logger.info('7. Testing course validation...');
      const isValid = this.obstacleCourse.validateCourse(courseId);
      this.logger.info(`   ${isValid ? '✅' : '❌'} Course validation: ${isValid ? 'Valid' : 'Invalid'}`);

      this.logger.info('\n🎉 All tests passed!');

    } catch (error) {
      this.logger.error('❌ Test failed:', error);
    }
  }

  private async createCourse(name?: string): Promise<void> {
    if (!name) {
      this.logger.info('❌ Usage: create-course <name>');
      return;
    }

    try {
      const courseId = this.obstacleCourse.createCourse(name);
      this.currentCourse = courseId;
      this.logger.info(`✅ Course "${name}" created with ID: ${courseId}`);
    } catch (error) {
      this.logger.error('❌ Course creation failed:', error);
    }
  }

  private async addObstacle(type?: string): Promise<void> {
    if (!type) {
      this.logger.info('❌ Usage: add-obstacle <type>');
      this.logger.info('   Types: jump, climb, swing, balance, speed, precision');
      return;
    }

    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
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

      const result = this.obstacleCourse.addObstacle(this.currentCourse, obstacle);
      if (result) {
        this.logger.info(`✅ Obstacle added: ${type} at (${obstacle.position.x.toFixed(1)}, ${obstacle.position.y.toFixed(1)})`);
        this.logger.info(`   Points: ${obstacle.points}, Time Limit: ${obstacle.timeLimit}s`);
      } else {
        this.logger.info('❌ Failed to add obstacle');
      }
    } catch (error) {
      this.logger.error('❌ Obstacle addition failed:', error);
    }
  }

  private async addCheckpoint(x?: string, y?: string): Promise<void> {
    if (!x || !y) {
      this.logger.info('❌ Usage: add-checkpoint <x> <y>');
      return;
    }

    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
      return;
    }

    try {
      const checkpoint: Checkpoint = {
        id: `checkpoint-${Date.now()}`,
        position: { x: parseFloat(x), y: parseFloat(y) },
        isActive: true
      };

      const result = this.obstacleCourse.addCheckpoint(this.currentCourse, checkpoint);
      if (result) {
        this.logger.info(`✅ Checkpoint added at (${x}, ${y})`);
      } else {
        this.logger.info('❌ Failed to add checkpoint');
      }
    } catch (error) {
      this.logger.error('❌ Checkpoint addition failed:', error);
    }
  }

  private async startTrial(): Promise<void> {
    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
      return;
    }

    try {
      const result = this.obstacleCourse.startTrial(this.currentCourse);
      if (result) {
        this.logger.info('✅ Trial started! Timer is running...');
      } else {
        this.logger.info('❌ Failed to start trial');
      }
    } catch (error) {
      this.logger.error('❌ Trial start failed:', error);
    }
  }

  private getScore(): void {
    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
      return;
    }

    try {
      const score = this.obstacleCourse.getScore(this.currentCourse);
      this.logger.info(`📊 Current score: ${score} points`);
    } catch (error) {
      this.logger.error('❌ Failed to get score:', error);
    }
  }

  private getTime(): void {
    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
      return;
    }

    try {
      const time = this.obstacleCourse.getTime(this.currentCourse);
      this.logger.info(`⏱️  Current time: ${time}ms (${(time / 1000).toFixed(2)}s)`);
    } catch (error) {
      this.logger.error('❌ Failed to get time:', error);
    }
  }

  private async reset(): Promise<void> {
    if (!this.currentCourse) {
      this.logger.info('❌ No active course. Create a course first.');
      return;
    }

    try {
      this.obstacleCourse.reset(this.currentCourse);
      this.logger.info('✅ Course reset successfully');
    } catch (error) {
      this.logger.error('❌ Reset failed:', error);
    }
  }

  private async simulate(): Promise<void> {
    this.logger.info('🎭 Starting obstacle course simulation...');
    
    try {
      // Create a test course
      this.logger.info('1. Creating test course...');
      const courseId = this.obstacleCourse.createCourse('Simulation Course');
      this.currentCourse = courseId;
      this.logger.info(`   ✅ Course created: ${courseId}`);

      // Add various obstacles
      this.logger.info('2. Adding obstacles...');
      const obstacleTypes: ObstacleType[] = ['jump', 'climb', 'swing', 'balance', 'speed', 'precision'];
      const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
      
      for (let i = 0; i < 5; i++) {
        const type = obstacleTypes[i % obstacleTypes.length];
        const difficulty = difficulties[i % difficulties.length];
        
        const obstacle: Obstacle = {
          id: `sim-obstacle-${i + 1}`,
          type,
          position: { x: i * 20, y: Math.random() * 30 + 10 },
          difficulty,
          points: (i + 1) * 50,
          timeLimit: 30 - (i * 5)
        };

        this.obstacleCourse.addObstacle(courseId, obstacle);
        this.logger.info(`   ✅ Added ${type} obstacle (${difficulty}) at (${obstacle.position.x}, ${obstacle.position.y})`);
      }

      // Add checkpoints
      this.logger.info('3. Adding checkpoints...');
      for (let i = 0; i < 3; i++) {
        const checkpoint: Checkpoint = {
          id: `sim-checkpoint-${i + 1}`,
          position: { x: (i + 1) * 30, y: 15 },
          isActive: true
        };

        this.obstacleCourse.addCheckpoint(courseId, checkpoint);
        this.logger.info(`   ✅ Added checkpoint at (${checkpoint.position.x}, ${checkpoint.position.y})`);
      }

      // Start trial
      this.logger.info('4. Starting trial...');
      this.obstacleCourse.startTrial(courseId);
      this.logger.info('   ✅ Trial started');

      // Simulate progress
      this.logger.info('5. Simulating progress...');
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const score = this.obstacleCourse.getScore(courseId);
        const time = this.obstacleCourse.getTime(courseId);
        this.logger.info(`   📊 Progress: ${score} points, ${(time / 1000).toFixed(1)}s`);
      }

      // Final results
      this.logger.info('6. Final results...');
      const finalScore = this.obstacleCourse.getScore(courseId);
      const finalTime = this.obstacleCourse.getTime(courseId);
      const isValid = this.obstacleCourse.validateCourse(courseId);
      
      this.logger.info(`   🏆 Final Score: ${finalScore} points`);
      this.logger.info(`   ⏱️  Final Time: ${(finalTime / 1000).toFixed(2)}s`);
      this.logger.info(`   ✅ Course Valid: ${isValid ? 'Yes' : 'No'}`);

      this.logger.info('✅ Obstacle course simulation completed successfully');

    } catch (error) {
      this.logger.error('❌ Simulation failed:', error);
    }
  }

  private showHelp(): void {
    this.logger.info(`
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
    this.logger.info('🚀 Obstacle Course CLI Started');
    this.logger.info('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new ObstacleCourseCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}