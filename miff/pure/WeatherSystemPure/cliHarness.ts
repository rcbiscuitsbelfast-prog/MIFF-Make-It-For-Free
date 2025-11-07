#!/usr/bin/env tsx

/**
 * WeatherSystemPure CLI Harness
 *
 * AAA-quality CLI interface for WeatherSystemPure module with:
 * - Interactive weather control and testing
 * - Real-time weather simulation
 * - Performance monitoring
 * - Integration testing capabilities
 * - Mobile-friendly responsive interface
 *
 * @version 1.0.0
 * @author MIFF Framework
 */

import { EventBus } from '../EventBusPure/index.js';
import WeatherSystemPure, { WeatherType, WeatherIntensity } from './index.js';
import WeatherManagerPure from './Manager.js';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CLI HARNESS CONFIGURATION
// ============================================================================

interface CLIOptions {
  mode: 'interactive' | 'simulate' | 'test' | 'benchmark' | 'export';
  seed?: number;
  duration?: number;
  outputFile?: string;
  verbose?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

interface SimulationConfig {
  duration: number;          // Duration in seconds
  weatherTransitions: number; // Number of weather changes to simulate
  logInterval: number;      // Log interval in seconds
  enableForecast: boolean;  // Enable weather forecasting
  enableEffects: boolean;   // Enable weather effects
}

// ============================================================================
// CLI HARNESS IMPLEMENTATION
// ============================================================================

/**
 * WeatherSystemPure CLI Harness
 * Provides comprehensive testing and interaction capabilities
 */
export class WeatherSystemCLI {
  private weatherSystem: WeatherSystemPure;
  private weatherManager: WeatherManagerPure;
  private eventBus: EventBus;
  private options: CLIOptions;
  private simulationConfig: SimulationConfig;
  private isRunning: boolean = false;
  private startTime: number = 0;
  private weatherChanges: number = 0;
  private performanceData: any[] = [];

  // CLI state
  private readline: any;
  private isInteractive: boolean = false;

  constructor(options: CLIOptions) {
    this.options = options;
    this.eventBus = new EventBus();
    this.weatherSystem = new WeatherSystemPure(this.eventBus, options.seed);
    this.weatherManager = new WeatherManagerPure(this.eventBus, {
      performanceMode: options.performanceMode || 'high'
    });

    this.simulationConfig = {
      duration: options.duration || 300, // 5 minutes default
      weatherTransitions: 5,
      logInterval: 30, // Log every 30 seconds
      enableForecast: true,
      enableEffects: true
    };

    this.setupEventHandlers();
    this.initializeInterface();
  }

  /**
   * Setup event handlers for weather system
   */
  private setupEventHandlers(): void {
    this.eventBus.on('weather:changed', (data) => {
      this.weatherChanges++;
      this.log(`🌤️  Weather changed: ${data.newWeather.type} (${data.newWeather.intensity})`);

      if (this.options.verbose) {
        this.logDetailedWeather(data.newWeather);
      }
    });

    this.eventBus.on('weather:performance', (data) => {
      this.performanceData.push({
        timestamp: new Date(),
        ...data
      });

      if (this.options.verbose) {
        this.log(`📊 Performance: Cache=${data.cacheSize}, Mode=${data.performanceMode}`);
      }
    });
  }

  /**
   * Initialize CLI interface
   */
  private initializeInterface(): void {
    if (typeof window === 'undefined') {
      // Node.js environment
      this.readline = require('readline');
      this.setupReadline();
    } else {
      // Browser environment
      this.isInteractive = false;
    }
  }

  /**
   * Setup readline interface for interactive mode
   */
  private setupReadline(): void {
    const rl = this.readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'Weather> '
    });

    rl.on('line', (line: string) => {
      this.processCommand(line.trim());
      rl.prompt();
    });

    rl.on('SIGINT', () => {
      this.log('\n🛑 Shutting down weather system...');
      this.shutdown();
    });

    this.isInteractive = true;
  }

  /**
   * Process CLI commands
   */
  private processCommand(command: string): void {
    const parts = command.split(' ');
    const cmd = parts[0!].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
      case 'h':
        this.showHelp();
        break;

      case 'status':
      case 's':
        this.showStatus();
        break;

      case 'set':
        this.setWeather(args);
        break;

      case 'forecast':
      case 'f':
        this.showForecast();
        break;

      case 'patterns':
      case 'p':
        this.listPatterns();
        break;

      case 'simulate':
        this.runSimulation();
        break;

      case 'pause':
        this.weatherSystem.setPaused(true);
        this.log('⏸️  Weather system paused');
        break;

      case 'resume':
        this.weatherSystem.setPaused(false);
        this.log('▶️  Weather system resumed');
        break;

      case 'reset':
        this.resetSystem();
        break;

      case 'stats':
        this.showStats();
        break;

      case 'export':
        this.exportData(args[0!]);
        break;

      case 'quit':
      case 'q':
      case 'exit':
        this.shutdown();
        break;

      default:
        this.log(`❓ Unknown command: ${cmd}`);
        this.showHelp();
    }
  }

  /**
   * Set weather manually
   */
  private setWeather(args: string[]): void {
    if (args.length < 2) {
      this.log('❌ Usage: set <weather_type> <intensity>');
      this.log('   Weather types: clear, cloudy, rain, heavy_rain, storm, thunderstorm, snow, blizzard, fog, dense_fog, windy, sandstorm');
      this.log('   Intensities: light, moderate, heavy, extreme');
      return;
    }

    const weatherType = args[0!] as WeatherType;
    const intensity = args[1!] as WeatherIntensity;

    this.weatherSystem.setWeather(weatherType, intensity);
    this.log(`✅ Set weather to: ${weatherType} (${intensity})`);
  }

  /**
   * Show current weather status
   */
  private showStatus(): void {
    const weather = this.weatherSystem.getCurrentWeather();
    const effects = this.weatherSystem.getCurrentWeatherEffects();
    const stats = this.weatherSystem.getStats();

    this.log('\n=== WEATHER STATUS ===');
    this.log(`🌤️  Current: ${weather.type} (${weather.intensity})`);
    this.log(`⏱️  Duration: ${Math.floor(weather.duration / 60)} minutes`);
    this.log(`📊 Effects:`);
    this.log(`   - Visibility: ${(effects.visibility * 100).toFixed(1)}%`);
    this.log(`   - Movement: ${(effects.movementSpeed * 100).toFixed(1)}%`);
    this.log(`   - Accuracy: ${(effects.combatAccuracy * 100).toFixed(1)}%`);
    this.log(`   - Temperature: ${effects.temperature.toFixed(1)}°C`);
    this.log(`   - Wind Speed: ${effects.windSpeed.toFixed(1)} m/s`);
    this.log(`   - Precipitation: ${(effects.precipitation * 100).toFixed(1)}%`);
    this.log(`📈 Stats:`);
    this.log(`   - Patterns: ${stats.activePatterns}`);
    this.log(`   - Performance: ${stats.performanceMode}`);
    this.log(`   - Cache Size: ${stats.cacheSize}`);
    this.log('');
  }

  /**
   * Show weather forecast
   */
  private showForecast(): void {
    const forecast = this.weatherManager.getWeatherForecast(24); // 24 hours

    this.log('\n=== 24-HOUR WEATHER FORECAST ===');
    forecast.slice(0, 8).forEach((weather, index) => { // Show next 8 hours
      const time = new Date(Date.now() + index * 3600000).toLocaleTimeString();
      this.log(`${time}: ${weather.type} (${weather.intensity}) - ${(weather.effects.visibility * 100).toFixed(0)}% visibility`);
    });
    this.log('');
  }

  /**
   * List available weather patterns
   */
  private listPatterns(): void {
    const patterns = this.weatherSystem.getAllWeatherPatterns();

    this.log('\n=== AVAILABLE WEATHER PATTERNS ===');
    patterns.forEach((pattern: any) => {
      this.log(`🌤️  ${pattern.name} (${pattern.id})`);
      this.log(`   Description: ${pattern.description}`);
      this.log(`   Type: ${pattern.baseType}`);
      this.log(`   Intensities: ${pattern.possibleIntensities.join(', ')}`);
      this.log(`   Average Duration: ${Math.floor(pattern.averageDuration / 60)} minutes`);
      this.log('');
    });
  }

  /**
   * Run simulation
   */
  private runSimulation(): void {
    this.log(`🚀 Starting weather simulation (${this.simulationConfig.duration}s)...`);

    this.startTime = Date.now();
    this.isRunning = true;
    this.weatherChanges = 0;

    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }

      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      if (elapsed >= this.simulationConfig.duration) {
        this.log(`✅ Simulation complete! ${this.weatherChanges} weather changes observed.`);
        this.isRunning = false;
        clearInterval(interval);
        this.showStats();
        return;
      }

      if (elapsed % this.simulationConfig.logInterval === 0) {
        this.log(`⏰ ${elapsed}s: ${this.weatherSystem.getCurrentWeather().type}`);
      }
    }, 1000);
  }

  /**
   * Reset weather system
   */
  private resetSystem(): void {
    this.weatherSystem.setWeather('clear', 'light');
    this.performanceData = [];
    this.weatherChanges = 0;
    this.log('🔄 Weather system reset to clear skies');
  }

  /**
   * Show system statistics
   */
  private showStats(): void {
    const weather = this.weatherSystem.getCurrentWeather();
    const effects = this.weatherSystem.getCurrentWeatherEffects();
    const stats = this.weatherSystem.getStats();

    this.log('\n=== WEATHER SYSTEM STATISTICS ===');
    this.log(`🌤️  Current Weather: ${weather.type} (${weather.intensity})`);
    this.log(`📊 Performance Mode: ${stats.performanceMode}`);
    this.log(`🔄 Weather Changes: ${this.weatherChanges}`);
    this.log(`⏱️  System Uptime: ${Math.floor((Date.now() - this.startTime) / 1000)}s`);
    this.log(`📈 Cache Efficiency: ${stats.cacheSize} cached effects`);
    this.log(`🎯 Manager Status: ${managerStats.isInitialized ? 'Initialized' : 'Not initialized'}`);
    this.log(`📡 Event Listeners: ${managerStats.activeListeners}`);
    this.log(`🔮 Forecast Enabled: ${managerStats.forecastEnabled}`);
    this.log(`⚡ Effects Enabled: ${managerStats.effectsEnabled}`);
    this.log('');
  }

  /**
   * Export simulation data
   */
  private exportData(filename?: string): void {
    const data = {
      simulation: {
        startTime: this.startTime,
        duration: new Date() - this.startTime,
        weatherChanges: this.weatherChanges,
        config: this.simulationConfig
      },
      weather: {
        current: this.weatherSystem.getCurrentWeather(),
        effects: this.weatherSystem.getCurrentWeatherEffects(),
        patterns: this.weatherSystem.getAllWeatherPatterns()
      },
      performance: this.performanceData,
      statistics: this.weatherManager.getStats()
    };

    const outputFile = filename || `weather_export_${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));

    this.log(`💾 Simulation data exported to: ${outputFile}`);
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.log('\n=== WEATHER SYSTEM CLI COMMANDS ===');
    this.log('📊 status/s                - Show current weather status');
    this.log('🌤️  set <type> <intensity>  - Set weather manually');
    this.log('🔮 forecast/f              - Show 24-hour weather forecast');
    this.log('📋 patterns/p              - List available weather patterns');
    this.log('🚀 simulate                - Run weather simulation');
    this.log('⏸️  pause                   - Pause weather system');
    this.log('▶️  resume                  - Resume weather system');
    this.log('🔄 reset                   - Reset to clear weather');
    this.log('📈 stats                    - Show system statistics');
    this.log('💾 export <file>            - Export simulation data');
    this.log('❓ help/h                   - Show this help');
    this.log('👋 quit/q/exit              - Exit CLI');
    this.log('');
    this.log('🌤️  Weather Types: clear, cloudy, rain, heavy_rain, storm, thunderstorm,');
    this.log('   snow, blizzard, fog, dense_fog, windy, sandstorm, drought, heatwave,');
    this.log('   cold_snap, hail, sleet');
    this.log('📊 Intensity Levels: light, moderate, heavy, extreme');
    this.log('');
  }

  /**
   * Log message with timestamp
   */
  private log(message: string): void {
    const timestamp = Date.now().toLocaleTimeString();
    console.log(`[${timestamp}] ${message}`);
  }

  /**
   * Log detailed weather information
   */
  private logDetailedWeather(weather): void {
    const effects = weather.effects;
    this.log(`   Visibility: ${(effects.visibility * 100).toFixed(1)}%`);
    this.log(`   Movement: ${(effects.movementSpeed * 100).toFixed(1)}%`);
    this.log(`   Combat: ${(effects.combatAccuracy * 100).toFixed(1)}%`);
    this.log(`   Temperature: ${effects.temperature.toFixed(1)}°C`);
    this.log(`   Wind: ${effects.windSpeed.toFixed(1)} m/s`);
    this.log(`   Precipitation: ${(effects.precipitation * 100).toFixed(1)}%`);
  }

  /**
   * Shutdown the CLI
   */
  private shutdown(): void {
    this.log('👋 Shutting down WeatherSystem CLI...');
    if (this.isInteractive) {
      this.readline.close();
    }
    process.exit(0);
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  /**
   * Run the CLI harness
   */
  public async run(): Promise<void> {
    this.log('🌤️  WeatherSystemPure CLI Harness v1.0.0');
    this.log('💡 Type "help" for available commands');
    this.log('');

    if (this.options.mode === 'interactive') {
      // Interactive mode - start readline interface
      if (this.isInteractive) {
        this.readline.prompt();
      } else {
        this.log('❌ Interactive mode not available in browser environment');
        this.shutdown();
      }
    } else if (this.options.mode === 'simulate') {
      // Simulation mode
      await this.runSimulation();
      this.shutdown();
    } else if (this.options.mode === 'test') {
      // Test mode
      await this.runTests();
      this.shutdown();
    } else if (this.options.mode === 'benchmark') {
      // Benchmark mode
      await this.runBenchmark();
      this.shutdown();
    } else if (this.options.mode === 'export') {
      // Export mode
      this.exportData(this.options.outputFile);
      this.shutdown();
    }
  }

  /**
   * Run automated tests
   */
  private async runTests(): Promise<void> {
    this.log('🧪 Running WeatherSystemPure tests...');

    const tests = [
      { name: 'Basic Weather Change', test: this.testBasicWeatherChange },
      { name: 'Weather Patterns', test: this.testWeatherPatterns },
      { name: 'Performance Metrics', test: this.testPerformanceMetrics },
      { name: 'Forecast Accuracy', test: this.testForecastAccuracy }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        await test.test();
        this.log(`✅ ${test.name} - PASSED`);
        passed++;
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        this.log(`❌ ${test.name} - FAILED: ${error}`);
        failed++;
      }
    }

    this.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  }

  /**
   * Run performance benchmark
   */
  private async runBenchmark(): Promise<void> {
    this.log('⚡ Running WeatherSystemPure benchmark...');

    const startTime = Date.now();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      this.weatherSystem.getCurrentWeather();
      this.weatherSystem.getCurrentWeatherEffects();
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    const avgTime = duration / iterations;

    this.log(`📈 Benchmark Results:`);
    this.log(`   Iterations: ${iterations}`);
    this.log(`   Total Time: ${duration}ms`);
    this.log(`   Average Time: ${avgTime.toFixed(3)}ms per operation`);
    this.log(`   Operations/sec: ${Math.floor(1000 / avgTime)}`);
  }

  /**
   * Test basic weather change functionality
   */
  private async testBasicWeatherChange(): Promise<void> {
    const initialWeather = this.weatherSystem.getCurrentWeather();

    // Test manual weather setting
    this.weatherSystem.setWeather('rain', 'moderate');

    const newWeather = this.weatherSystem.getCurrentWeather();
    if (newWeather.type !== 'rain' || newWeather.intensity !== 'moderate') {
      throw new Error('Weather change test failed');
    }

    // Reset to clear
    this.weatherSystem.setWeather('clear', 'light');
  }

  /**
   * Test weather patterns functionality
   */
  private async testWeatherPatterns(): Promise<void> {
    const patterns = this.weatherSystem.getAllWeatherPatterns();

    if (patterns.length === 0) {
      throw new Error('No weather patterns found');
    }

    const clearPattern = patterns.find(p => p.baseType === 'clear');
    if (!clearPattern) {
      throw new Error('Clear weather pattern not found');
    }
  }

  /**
   * Test performance metrics
   */
  private async testPerformanceMetrics(): Promise<void> {
    const stats = this.weatherSystem.getStats();

    if (!stats.currentWeather || stats.activePatterns === 0) {
      throw new Error('Performance metrics test failed');
    }
  }

  /**
   * Test forecast accuracy
   */
  private async testForecastAccuracy(): Promise<void> {
    const forecast = this.weatherManager.getWeatherForecast(6); // 6 hours

    if (forecast.length === 0) {
      throw new Error('Forecast test failed - no forecast generated');
    }

    forecast.forEach((weather, index) => {
      if (!weather.type || !weather.intensity) {
        throw new Error(`Forecast test failed at index ${index}`);
      }
    });
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const options: CLIOptions = {
    mode: 'interactive'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--mode':
      case '-m':
        options.mode = args[++i] as CLIOptions['mode'];
        break;
      case '--seed':
      case '-s':
        options.seed = parseInt(args[++i]);
        break;
      case '--duration':
      case '-d':
        options.duration = parseInt(args[++i]);
        break;
      case '--output':
      case '-o':
        options.outputFile = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--performance':
      case '-p':
        options.performanceMode = args[++i] as 'high' | 'medium' | 'low';
        break;
      case '--help':
      case '-h':
        console.log('WeatherSystemPure CLI Harness');
        console.log('');
        console.log('Usage: tsx cliHarness.ts [options]');
        console.log('');
        console.log('Options:');
        console.log('  --mode, -m <mode>          Mode: interactive, simulate, test, benchmark, export');
        console.log('  --seed, -s <number>        Random seed for deterministic weather');
        console.log('  --duration, -d <seconds>   Simulation duration');
        console.log('  --output, -o <file>        Output file for export mode');
        console.log('  --verbose, -v              Enable verbose output');
        console.log('  --performance, -p <mode>   Performance mode: high, medium, low');
        console.log('  --help, -h                 Show this help');
        console.log('');
        process.exit(0);
    }
  }

  // Create and run CLI
  const cli = new WeatherSystemCLI(options);
  await cli.run();
}

// Run CLI if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1!]}`) {
  main().catch(console.error);
}

// Export for module usage
export default WeatherSystemCLI;