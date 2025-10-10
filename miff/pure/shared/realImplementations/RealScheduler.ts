/**
 * Real Scheduler Implementation
 * 
 * Replaces mock scheduler with actual task scheduling functionality
 * for better test fidelity and real-world behavior validation.
 */

export interface ScheduledTask {
  id: string;
  name: string;
  callback: () => void | Promise<void>;
  interval: number;
  lastRun: number;
  nextRun: number;
  repeat: boolean;
  active: boolean;
}

export class RealScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private eventBus: any;
  private isRunning: boolean = false;

  constructor(eventBus: any) {
    this.eventBus = eventBus;
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.processTasks();
    }, 100); // Check every 100ms

    this.eventBus?.emit('scheduler-started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.eventBus?.emit('scheduler-stopped');
  }

  /**
   * Add a scheduled task
   */
  scheduleTask(
    id: string,
    name: string,
    callback: () => void | Promise<void>,
    interval: number,
    repeat: boolean = true
  ): boolean {
    if (this.tasks.has(id)) {
      return false; // Task already exists
    }

    const now = Date.now();
    const task: ScheduledTask = {
      id,
      name,
      callback,
      interval,
      lastRun: 0,
      nextRun: now + interval,
      repeat,
      active: true
    };

    this.tasks.set(id, task);
    this.eventBus?.emit('task-scheduled', { taskId: id, name, interval });
    return true;
  }

  /**
   * Remove a scheduled task
   */
  removeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    this.tasks.delete(id);
    this.eventBus?.emit('task-removed', { taskId: id });
    return true;
  }

  /**
   * Pause a task
   */
  pauseTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    task.active = false;
    this.eventBus?.emit('task-paused', { taskId: id });
    return true;
  }

  /**
   * Resume a task
   */
  resumeTask(id: string): boolean {
    const task = this.tasks.get(id);
    if (!task) {
      return false;
    }

    task.active = true;
    this.eventBus?.emit('task-resumed', { taskId: id });
    return true;
  }

  /**
   * Process all active tasks
   */
  private processTasks(): void {
    const now = Date.now();
    const tasksToRun: ScheduledTask[] = [];

    for (const task of this.tasks.values()) {
      if (task.active && now >= task.nextRun) {
        tasksToRun.push(task);
      }
    }

    for (const task of tasksToRun) {
      this.executeTask(task);
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: ScheduledTask): Promise<void> {
    try {
      task.lastRun = Date.now();
      
      if (task.repeat) {
        task.nextRun = task.lastRun + task.interval;
      } else {
        task.active = false;
        this.tasks.delete(task.id);
      }

      this.eventBus?.emit('task-executing', { taskId: task.id, name: task.name });
      
      await task.callback();
      
      this.eventBus?.emit('task-executed', { taskId: task.id, name: task.name });
    } catch (error) {
      this.eventBus?.emit('task-error', { 
        taskId: task.id, 
        name: task.name, 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Get task by ID
   */
  getTask(id: string): ScheduledTask | null {
    return this.tasks.get(id) || null;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values()).filter(task => task.active);
  }

  /**
   * Clear all tasks
   */
  clearAllTasks(): void {
    this.tasks.clear();
    this.eventBus?.emit('scheduler-cleared');
  }

  /**
   * Get scheduler status
   */
  getStatus(): { isRunning: boolean; taskCount: number; activeTaskCount: number } {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.size,
      activeTaskCount: this.getActiveTasks().length
    };
  }
}

// Export as mock for compatibility
export const realScheduler = RealScheduler;
export default RealScheduler;