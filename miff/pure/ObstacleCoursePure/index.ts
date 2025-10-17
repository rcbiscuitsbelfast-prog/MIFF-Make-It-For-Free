/**
 * ObstacleCoursePure - AAA Quality Obstacle Course System
 *
 * Advanced platforming mechanics with:
 * - Jump and movement controls
 * - Checkpoint system
 * - Timed trials and scoring
 * - Mobile-optimized controls
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index?.js';

export type ObstacleType = 'jump' | 'climb' | 'swing' | 'balance' | 'speed' | 'precision';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  position: { x: number; y: number };
  difficulty: Difficulty;
  points: number;
  timeLimit?: number;
}

export interface Checkpoint {
  id: string;
  position: { x: number; y: number };
  required: boolean;
  bonusPoints: number;
}

export interface CourseAttempt {
  playerId: string;
  startTime: number;
  endTime?: number;
  checkpoints: string[];
  score: number;
  completed: boolean;
}

export class ObstacleCoursePure {
  private eventBus: EventBus;
  private obstacles: Map<string, Obstacle> = new Map();
  private checkpoints: Map<string, Checkpoint> = new Map();
  private attempts: Map<string, CourseAttempt> = new Map();
  private currentPlayerPosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(eventBus: EventBus) {
    this?.eventBus = eventBus;
    this?.initializeCourse();
  }

  private initializeCourse(): void {
    // Initialize basic obstacle course
    const obstacles: Obstacle[] = [
      {
        id: 'jump_1',
        type: 'jump',
        position: { x: 100, y: 0 },
        difficulty: 'easy',
        points: 10
      },
      {
        id: 'climb_1',
        type: 'climb',
        position: { x: 200, y: 10 },
        difficulty: 'medium',
        points: 20
      },
      {
        id: 'balance_1',
        type: 'balance',
        position: { x: 300, y: 0 },
        difficulty: 'hard',
        points: 30,
        timeLimit: 10
      }
    ];

    const checkpoints: Checkpoint[] = [
      {
        id: 'checkpoint_1',
        position: { x: 150, y: 0 },
        required: true,
        bonusPoints: 50
      },
      {
        id: 'checkpoint_2',
        position: { x: 250, y: 0 },
        required: false,
        bonusPoints: 25
      }
    ];

    obstacles?.forEach((obstacle: any) => {
      this?.obstacles.set(obstacle?.id, obstacle);
    });

    checkpoints?.forEach((checkpoint: any) => {
      this?.checkpoints.set(checkpoint?.id, checkpoint);
    });
  }

  public getObstacles(): Map<string, Obstacle> {
    return new Map(this?.obstacles);
  }

  public getCheckpoints(): Map<string, Checkpoint> {
    return new Map(this?.checkpoints);
  }

  public getAttempts(): Map<string, CourseAttempt> {
    return new Map(this?.attempts);
  }

  public getPlayerPosition(): { x: number; y: number } {
    return { ...this?.currentPlayerPosition };
  }

  public setPlayerPosition(position: { x: number; y: number }): void {
    this?.currentPlayerPosition = position;
    this?.checkCollisions();
  }

  private checkCollisions(): void {
    // Check for obstacle interactions
    this?.obstacles.forEach((obstacle, obstacleId) => {
      const distance = Math.sqrt(
        Math.pow(this.currentPlayerPosition.x - obstacle.position.x, 2) +
        Math.pow(this.currentPlayerPosition.y - obstacle.position.y, 2)
      );

      if (distance < 10) { // Player reached obstacle
        this?.eventBus.emit('obstacle:reached', {
          obstacleId: obstacleId,
          obstacle: obstacle,
          timestamp: new Date()
        });
      }
    });

    // Check for checkpoint interactions
    this?.checkpoints.forEach((checkpoint, checkpointId) => {
      const distance = Math.sqrt(
        Math.pow(this.currentPlayerPosition.x - checkpoint.position.x, 2) +
        Math.pow(this.currentPlayerPosition.y - checkpoint.position.y, 2)
      );

      if (distance < 15) { // Player reached checkpoint
        this?.eventBus.emit('checkpoint:reached', {
          checkpointId: checkpointId,
          checkpoint: checkpoint,
          timestamp: new Date()
        });
      }
    });
  }

  public startAttempt(playerId: string): boolean {
    const existingAttempt = this?.attempts.get(playerId);
    if (existingAttempt && !existingAttempt?.completed) {
      return false; // Player already has active attempt
    }

    const attempt: CourseAttempt = {
      playerId: playerId,
      startTime: new Date(),
      checkpoints: [],
      score: 0,
      completed: false
    };

    this?.attempts.set(playerId, attempt);

    this?.eventBus.emit('course:attempt_started', {
      playerId: playerId,
      attempt: attempt,
      timestamp: new Date()
    });

    return true;
  }

  public completeAttempt(playerId: string, score: number): boolean {
    const attempt = this?.attempts.get(playerId);
    if (!attempt || attempt?.completed) {
      return false;
    }

    attempt.endTime = new Date();
    attempt?.score = score;
    attempt?.completed = true;

    this?.eventBus.emit('course:attempt_completed', {
      playerId: playerId,
      attempt: attempt,
      finalScore: score,
      timestamp: new Date()
    });

    return true;
  }
}

export default ObstacleCoursePure;