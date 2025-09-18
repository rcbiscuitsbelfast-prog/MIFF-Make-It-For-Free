/**
 * CLI Harness for TimeSystemPure
 * 
 * Provides comprehensive CLI interface for time management including
 * timers, cooldowns, scheduled events, time scaling, and multi-format export.
 * 
 * @module TimeSystemPure/cliHarness
 * @version 1.0.0
 * @license MIT
 */

import { TimeManager, Timer, Cooldown, ScheduledEvent, TimeScale } from './Manager';
import { parseCLIArgs, formatOutput } from '../shared/cliHarnessUtils';

const { mode, args } = parseCLIArgs(process.argv);
const manager = new TimeManager();

// Parse additional arguments
const timerId = args.find(arg => arg.startsWith('--timer-id='))?.split('=')[1] || 'test_timer';
const cooldownId = args.find(arg => arg.startsWith('--cooldown-id='))?.split('=')[1] || 'test_cooldown';
const scheduledId = args.find(arg => arg.startsWith('--scheduled-id='))?.split('=')[1] || 'test_scheduled';
const scaleId = args.find(arg => arg.startsWith('--scale-id='))?.split('=')[1] || 'test_scale';
const duration = parseFloat(args.find(arg => arg.startsWith('--duration='))?.split('=')[1] || '5');
const deltaTime = parseFloat(args.find(arg => arg.startsWith('--delta-time='))?.split('=')[1] || '1');
const timeScale = parseFloat(args.find(arg => arg.startsWith('--time-scale='))?.split('=')[1] || '1.0');
const atTime = parseFloat(args.find(arg => arg.startsWith('--at-time='))?.split('=')[1] || '10');
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1] || 'general';
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] as 'json' | 'manifest' | 'summary' | 'events' || 'json';

let output: any;

try {
  switch (mode) {
    case 'now':
      output = {
        op: 'now',
        status: 'ok',
        result: { time: manager.now() }
      };
      break;

    case 'set-scale':
      output = manager.setTimeScale(timeScale);
      break;

    case 'pause':
      output = manager.pause();
      break;

    case 'resume':
      output = manager.resume();
      break;

    case 'add-timer':
      const timer: Timer = {
        id: timerId,
        duration: duration,
        remaining: duration,
        repeat: args.includes('--repeat'),
        maxRepeats: args.includes('--max-repeats') ? parseInt(args.find(arg => arg.startsWith('--max-repeats='))!.split('=')[1]) : undefined,
        metadata: args.includes('--metadata') ? JSON.parse(args.find(arg => arg.startsWith('--metadata='))!.split('=')[1]) : undefined
      };
      output = manager.addTimer(timer);
      break;

    case 'add-cooldown':
      output = manager.addCooldown(cooldownId, duration, category);
      break;

    case 'schedule':
      const payload = args.includes('--payload') ? JSON.parse(args.find(arg => arg.startsWith('--payload='))!.split('=')[1]) : undefined;
      output = manager.schedule(scheduledId, atTime, payload);
      break;

    case 'add-scale':
      const scale: TimeScale = {
        id: scaleId,
        factor: timeScale,
        duration: args.includes('--duration') ? duration : undefined,
        startTime: manager.now(),
        metadata: args.includes('--metadata') ? JSON.parse(args.find(arg => arg.startsWith('--metadata='))!.split('=')[1]) : undefined
      };
      output = manager.addTimeScale(scale);
      break;

    case 'cancel':
      output = manager.cancel(args.find(arg => arg.startsWith('--id='))?.split('=')[1] || timerId);
      break;

    case 'check-cooldown':
      output = manager.isCooldownReady(cooldownId);
      break;

    case 'get-remaining':
      output = manager.getRemainingTime(args.find(arg => arg.startsWith('--id='))?.split('=')[1] || timerId);
      break;

    case 'tick':
      output = manager.tick(deltaTime);
      break;

    case 'list':
      const filter: any = {};
      if (args.includes('--type')) filter.type = args.find(arg => arg.startsWith('--type='))!.split('=')[1];
      if (args.includes('--category')) filter.category = category;
      if (args.includes('--min-duration')) filter.minDuration = parseFloat(args.find(arg => arg.startsWith('--min-duration='))!.split('=')[1]);
      if (args.includes('--max-duration')) filter.maxDuration = parseFloat(args.find(arg => arg.startsWith('--max-duration='))!.split('=')[1]);
      if (args.includes('--active')) filter.active = true;
      
      output = manager.list(filter);
      break;

    case 'stats':
      output = manager.getStats();
      break;

    case 'export':
      output = manager.exportTime(format);
      break;

    case 'reset':
      output = manager.resetTime();
      break;

    case 'dump':
      output = manager.dump();
      break;

    case 'demo':
      // Create demo time scenarios
      manager.addTimer({
        id: 'demo_timer_1',
        duration: 5,
        remaining: 5,
        repeat: true,
        maxRepeats: 3
      });

      manager.addTimer({
        id: 'demo_timer_2',
        duration: 10,
        remaining: 10,
        repeat: false
      });

      manager.addCooldown('demo_cooldown_1', 3, 'combat');
      manager.addCooldown('demo_cooldown_2', 7, 'magic');

      manager.schedule('demo_scheduled_1', 15, { message: 'Scheduled event fired' });
      manager.schedule('demo_scheduled_2', 20, { message: 'Another scheduled event' });

      manager.addTimeScale({
        id: 'demo_scale_1',
        factor: 2.0,
        duration: 5,
        startTime: manager.now()
      });

      // Simulate time passing
      const tickResults = [];
      for (let i = 0; i < 25; i++) {
        const tickResult = manager.tick(1);
        tickResults.push(tickResult);
      }

      output = {
        op: 'demo',
        status: 'ok',
        result: {
          message: 'Demo time scenarios completed',
          finalTime: manager.now(),
          tickResults: tickResults.slice(-10), // Last 10 ticks
          stats: manager.getStats().result
        }
      };
      break;

    case 'sample':
      // Create sample time scenarios
      const sampleScenarios = [
        {
          id: 'combat_scenario',
          timers: [
            { id: 'attack_timer', duration: 2, repeat: true },
            { id: 'ability_timer', duration: 8, repeat: false }
          ],
          cooldowns: [
            { id: 'heal_cooldown', duration: 5, category: 'healing' },
            { id: 'shield_cooldown', duration: 10, category: 'defense' }
          ],
          scheduled: [
            { id: 'boss_phase_2', at: 30, payload: { phase: 2 } },
            { id: 'boss_phase_3', at: 60, payload: { phase: 3 } }
          ]
        },
        {
          id: 'magic_scenario',
          timers: [
            { id: 'mana_regen', duration: 1, repeat: true },
            { id: 'spell_duration', duration: 15, repeat: false }
          ],
          cooldowns: [
            { id: 'fireball_cooldown', duration: 3, category: 'offensive' },
            { id: 'teleport_cooldown', duration: 20, category: 'utility' }
          ],
          scheduled: [
            { id: 'mana_burn', at: 45, payload: { damage: 50 } }
          ]
        }
      ];

      const scenarioResults = sampleScenarios.map(scenario => {
        // Reset for each scenario
        manager.resetTime();

        scenario.timers.forEach(timer => {
          manager.addTimer({
            id: timer.id,
            duration: timer.duration,
            remaining: timer.duration,
            repeat: timer.repeat
          });
        });

        scenario.cooldowns.forEach(cooldown => {
          manager.addCooldown(cooldown.id, cooldown.duration, cooldown.category);
        });

        scenario.scheduled.forEach(scheduled => {
          manager.schedule(scheduled.id, scheduled.at, scheduled.payload);
        });

        // Simulate some time
        for (let i = 0; i < 10; i++) {
          manager.tick(1);
        }

        return {
          scenario: scenario.id,
          finalTime: manager.now(),
          activeTimers: scenario.timers.length,
          activeCooldowns: scenario.cooldowns.length,
          scheduledEvents: scenario.scheduled.length
        };
      });

      output = {
        op: 'sample',
        status: 'ok',
        result: {
          message: 'Sample time scenarios created',
          scenarios: scenarioResults
        }
      };
      break;

    default:
      output = {
        op: 'help',
        status: 'ok',
        result: {
          availableCommands: [
            'now',
            'set-scale --time-scale=<factor>',
            'pause',
            'resume',
            'add-timer --timer-id=<id> --duration=<sec> [--repeat] [--max-repeats=<num>] [--metadata=<json>]',
            'add-cooldown --cooldown-id=<id> --duration=<sec> [--category=<cat>]',
            'schedule --scheduled-id=<id> --at-time=<time> [--payload=<json>]',
            'add-scale --scale-id=<id> --time-scale=<factor> [--duration=<sec>] [--metadata=<json>]',
            'cancel --id=<id>',
            'check-cooldown --cooldown-id=<id>',
            'get-remaining --id=<id>',
            'tick --delta-time=<sec>',
            'list [--type=<type>] [--category=<cat>] [--min-duration=<sec>] [--max-duration=<sec>] [--active]',
            'stats',
            'export --format=<json|manifest|summary|events>',
            'reset',
            'dump',
            'demo',
            'sample'
          ],
          examples: [
            'node cliHarness.ts add-timer --timer-id=attack --duration=2 --repeat',
            'node cliHarness.ts add-cooldown --cooldown-id=heal --duration=5 --category=healing',
            'node cliHarness.ts schedule --scheduled-id=boss_phase --at-time=30 --payload={"phase":2}',
            'node cliHarness.ts tick --delta-time=1',
            'node cliHarness.ts export --format=manifest'
          ]
        }
      };
  }
} catch (error) {
  output = {
    op: mode || 'unknown',
    status: 'error',
    issues: [error instanceof Error ? error.message : 'Unknown error']
  };
}

// Output valid JSON to stdout for test runner to consume
console.log(formatOutput(output));