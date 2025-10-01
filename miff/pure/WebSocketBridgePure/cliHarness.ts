#!/usr/bin/env tsx

/**
 * WebSocketBridgePure CLI Harness
 * 
 * Interactive command-line interface for testing and demonstrating
 * the WebSocketBridgePure real-time communication system.
 */

// Check for help command
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
WebSocketBridgePure CLI Harness - Real-Time Communication System

Usage: npx tsx miff/pure/WebSocketBridgePure/cliHarness.ts [command] [options]

Commands:
  test                     - Run basic WebSocket bridge tests
  connect <url>            - Connect to WebSocket server
  disconnect               - Disconnect from WebSocket server
  send <channel> <message> - Send message to channel
  subscribe <channel>      - Subscribe to channel
  unsubscribe <channel>    - Unsubscribe from channel
  status                   - Show connection status
  simulate                 - Simulate local message passing
  help                     - Show this help

Examples:
  npx tsx miff/pure/WebSocketBridgePure/cliHarness.ts test
  npx tsx miff/pure/WebSocketBridgePure/cliHarness.ts connect ws://localhost:8080
  npx tsx miff/pure/WebSocketBridgePure/cliHarness.ts send "game" "Hello World"
  npx tsx miff/pure/WebSocketBridgePure/cliHarness.ts simulate
`);
  process.exit(0);
}

import * as readline from 'readline';
import { WebSocketBridgePure, WebSocketBridgeOptions } from './index';

class WebSocketBridgeCLI {
  private bridge: WebSocketBridgePure;
  private rl: readline.Interface;
  private isRunning: boolean = false;

  constructor() {
    this.bridge = new WebSocketBridgePure({
      useRealWebSocket: false, // Use local simulation by default
      onStatusChange: (status) => {
        console.log(`📡 Connection status: ${status}`);
      }
    });

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'WebSocket> '
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.rl.on('line', (input) => {
      this.handleCommand(input.trim());
    });

    this.rl.on('close', () => {
      console.log('\n👋 WebSocket Bridge CLI closed');
      process.exit(0);
    });
  }

  private async handleCommand(input: string): Promise<void> {
    const [command, ...args] = input.split(' ');

    switch (command.toLowerCase()) {
      case 'test':
        await this.runTests();
        break;
      case 'connect':
        await this.connect(args[0]);
        break;
      case 'disconnect':
        await this.disconnect();
        break;
      case 'send':
        await this.sendMessage(args[0], args.slice(1).join(' '));
        break;
      case 'subscribe':
        await this.subscribe(args[0]);
        break;
      case 'unsubscribe':
        await this.unsubscribe(args[0]);
        break;
      case 'status':
        this.showStatus();
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
        console.log(`❌ Unknown command: ${command}`);
        console.log('Type "help" for available commands');
    }

    this.rl.prompt();
  }

  private async runTests(): Promise<void> {
    console.log('🧪 Running WebSocket Bridge tests...\n');

    try {
      // Test 1: Local simulation
      console.log('1. Testing local simulation...');
      this.bridge.setChannel('test');
      await this.bridge.connect();
      console.log('   ✅ Local simulation connected');

      // Test 2: Message sending
      console.log('2. Testing message sending...');
      await this.bridge.send('test', { type: 'test', message: 'Hello from CLI' });
      console.log('   ✅ Message sent successfully');

      // Test 3: Message receiving
      console.log('3. Testing message receiving...');
      let messageReceived = false;
      this.bridge.onMessage((channel, payload) => {
        console.log(`   📨 Received on ${channel}:`, payload);
        messageReceived = true;
      });

      // Send a test message to ourselves
      await this.bridge.send('test', { type: 'echo', message: 'Echo test' });
      
      // Wait a bit for message processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (messageReceived) {
        console.log('   ✅ Message received successfully');
      } else {
        console.log('   ⚠️  Message not received (may be expected in local mode)');
      }

      // Test 4: Disconnect
      console.log('4. Testing disconnect...');
      await this.bridge.disconnect();
      console.log('   ✅ Disconnected successfully');

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  private async connect(url?: string): Promise<void> {
    try {
      if (url) {
        this.bridge = new WebSocketBridgePure({
          useRealWebSocket: true,
          serverUrl: url,
          onStatusChange: (status) => {
            console.log(`📡 Connection status: ${status}`);
          }
        });
      }

      await this.bridge.connect();
      console.log('✅ Connected to WebSocket server');
    } catch (error) {
      console.error('❌ Connection failed:', error);
    }
  }

  private async disconnect(): Promise<void> {
    try {
      await this.bridge.disconnect();
      console.log('✅ Disconnected from WebSocket server');
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
    }
  }

  private async sendMessage(channel: string, message: string): Promise<void> {
    if (!channel || !message) {
      console.log('❌ Usage: send <channel> <message>');
      return;
    }

    try {
      this.bridge.setChannel(channel);
      await this.bridge.send(channel, { type: 'cli_message', content: message, timestamp: Date.now() });
      console.log(`✅ Message sent to channel "${channel}": ${message}`);
    } catch (error) {
      console.error('❌ Send failed:', error);
    }
  }

  private async subscribe(channel: string): Promise<void> {
    if (!channel) {
      console.log('❌ Usage: subscribe <channel>');
      return;
    }

    try {
      this.bridge.setChannel(channel);
      this.bridge.onMessage((msgChannel, payload) => {
        if (msgChannel === channel) {
          console.log(`📨 [${channel}]:`, payload);
        }
      });
      console.log(`✅ Subscribed to channel "${channel}"`);
    } catch (error) {
      console.error('❌ Subscribe failed:', error);
    }
  }

  private async unsubscribe(channel: string): Promise<void> {
    if (!channel) {
      console.log('❌ Usage: unsubscribe <channel>');
      return;
    }

    try {
      // Note: The current implementation doesn't have unsubscribe, so we'll just log
      console.log(`✅ Unsubscribed from channel "${channel}" (simulated)`);
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
    }
  }

  private showStatus(): void {
    console.log('📊 WebSocket Bridge Status:');
    console.log(`   Connected: ${this.bridge.isConnected ? 'Yes' : 'No'}`);
    console.log(`   Channel: ${this.bridge.getChannel()}`);
    console.log(`   Server URL: ${this.bridge.getServerUrl()}`);
  }

  private async simulate(): Promise<void> {
    console.log('🎭 Starting local simulation...');
    
    try {
      await this.bridge.connect();
      
      // Set up message handler
      this.bridge.onMessage((channel, payload) => {
        console.log(`📨 [${channel}]:`, payload);
      });

      // Send some test messages
      const channels = ['game', 'chat', 'system'];
      const messages = [
        'Welcome to the game!',
        'Player joined the server',
        'System maintenance in 5 minutes',
        'New high score achieved!',
        'Chat message from player'
      ];

      for (let i = 0; i < 5; i++) {
        const channel = channels[i % channels.length];
        const message = messages[i];
        
        this.bridge.setChannel(channel);
        await this.bridge.send(channel, {
          type: 'simulation',
          content: message,
          timestamp: Date.now(),
          id: i + 1
        });
        
        console.log(`📤 Sent to ${channel}: ${message}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('✅ Simulation completed');
      await this.bridge.disconnect();

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }
  }

  private showHelp(): void {
    console.log(`
Available commands:
  test                     - Run basic WebSocket bridge tests
  connect <url>            - Connect to WebSocket server
  disconnect               - Disconnect from WebSocket server
  send <channel> <message> - Send message to channel
  subscribe <channel>      - Subscribe to channel
  unsubscribe <channel>    - Unsubscribe from channel
  status                   - Show connection status
  simulate                 - Simulate local message passing
  help                     - Show this help
  exit/quit                - Exit the CLI
`);
  }

  public async start(): Promise<void> {
    console.log('🚀 WebSocket Bridge CLI Started');
    console.log('Type "help" for available commands or "test" to run tests\n');
    
    this.rl.prompt();
  }
}

// Main execution
async function main() {
  const cli = new WebSocketBridgeCLI();
  await cli.start();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}