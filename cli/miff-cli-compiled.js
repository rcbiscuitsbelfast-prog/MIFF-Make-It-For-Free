#!/usr/bin/env node

/**
 * MIFF CLI - Compiled Entry Point
 *
 * This is the compiled version of miff-cli.ts for Node.js compatibility.
 * Run with: node cli/miff-cli-compiled.js [command] [args]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Check if tsx is available
try {
    execSync('which tsx', { stdio: 'ignore' });
    console.log('🚀 MIFF CLI - Using tsx for TypeScript execution');
    console.log('📝 Note: For best performance, compile with: npm run build:cli\n');

    // Get command line arguments
    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log('🎮 MIFF CLI - Make It For Free Framework');
      console.log('========================================\n');
      console.log('Usage: node cli/miff-cli-compiled.js <command> [options]');
      console.log('       tsx cli/miff-cli.ts <command> [options] (recommended)\n');
      console.log('📋 Available Commands:');
      console.log('  • project    - Project management (create, init, validate, info)');
      console.log('  • module     - Module management (list, info, test, benchmark)');
      console.log('  • export     - Export systems (unity, godot, web, android)');
      console.log('  • demo       - Demo project management (create, list, run)');
      console.log('  • debug      - Debug and development tools');
      console.log('  • profile    - Performance profiling and analysis');
      console.log('  • optimize   - System optimization and cleanup');
      console.log('  • help       - Show detailed help information\n');
      console.log('🔍 For detailed help: node cli/miff-cli-compiled.js help');
      process.exit(0);
    }

    // Execute with tsx
    const tsxCommand = `tsx cli/miff-cli.ts ${args.join(' ')}`;
    console.log(`⚡ Executing: ${tsxCommand}\n`);

    const result = execSync(tsxCommand, {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
    });

    process.exit(0);

} catch (error) {
  console.log('⚠️  tsx not available. Please install with: npm install -g tsx');
  console.log('🔧 Alternative: Compile with TypeScript and run the compiled version\n');

  // Fallback to basic command handling
  const args = process.argv.slice(2);
  const command = args[0];
  console.log(`📝 Command: ${command || 'help'}`);

  switch (command) {
    case 'help':
      console.log('🎮 MIFF CLI Help');
      console.log('================\n');
      console.log('Commands:');
      console.log('  project  - Project management');
      console.log('  module   - Module management');
      console.log('  export   - Export systems');
      console.log('  demo     - Demo projects');
      console.log('  debug    - Debug tools');
      console.log('  profile  - Performance analysis');
      console.log('  optimize - System optimization\n');
      console.log('For full functionality, install tsx: npm install -g tsx');
      console.log('Then run: tsx cli/miff-cli.ts [command]');
      break;

    case 'project':
      console.log('🏗️  Project Management Commands:');
      console.log('  create <name>    - Create new project');
      console.log('  init             - Initialize current directory');
      console.log('  validate         - Validate project structure');
      console.log('  info             - Show project information');
      break;

    case 'module':
      console.log('📦 Module Management Commands:');
      console.log('  list             - List all modules');
      console.log('  info <module>    - Show module information');
      console.log('  test <module>    - Run module tests');
      console.log('  benchmark        - Run performance benchmarks');
      break;

    case 'export':
      console.log('🚀 Export Commands:');
      console.log('  unity <project>  - Export to Unity');
      console.log('  godot <project>  - Export to Godot');
      console.log('  web <project>    - Export to Web/HTML5');
      console.log('  android <project>- Export to Android');
      break;

    case 'demo':
      console.log('🎮 Demo Commands:');
      console.log('  create <type>    - Create demo project');
      console.log('  list             - List available demos');
      console.log('  run <demo>       - Run demo project');
      break;

    case 'debug':
      console.log('🐛 Debug Commands:');
      console.log('  info             - Show debug information');
      console.log('  test             - Run debug tests');
      console.log('  performance      - Show performance info');
      break;

    case 'profile':
      console.log('📊 Profile Commands:');
      console.log('  memory           - Memory profiling');
      console.log('  performance      - Performance profiling');
      console.log('  analysis         - System analysis');
      break;

    case 'optimize':
      console.log('⚡ Optimize Commands:');
      console.log('  clean            - Clean build artifacts');
      console.log('  optimize         - Optimize system');
      console.log('  health           - System health check');
      break;

    default:
      console.log(`❓ Unknown command: ${command || 'none'}`);
      console.log('📋 Available commands: project, module, export, demo, debug, profile, optimize, help');
      console.log('💡 Tip: Use tsx for full functionality: tsx cli/miff-cli.ts [command]');
  }

  process.exit(0);
}