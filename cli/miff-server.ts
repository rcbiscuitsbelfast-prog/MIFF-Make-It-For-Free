#!/usr/bin/env node

import { WebSocketServerPure } from '../miff/pure/WebSocketServerPure/index.js';

interface ServerOptions {
  port?: number;
  host?: string;
  enableRealWebSocket?: boolean;
}

async function startServer(options: ServerOptions = {}) {
  const server = new WebSocketServerPure({
    port: options.port || 8080,
    host: options.host || 'localhost',
    enableRealWebSocket: options.enableRealWebSocket !== false
  });

  server.on('ready', (info) => {
    console.log(`🚀 MIFF WebSocket Server started on ${info.host}:${info.port}`);
    console.log(`📡 Mode: ${options.enableRealWebSocket !== false ? 'Real WebSocket' : 'Simulation'}`);
  });

  server.on('clientConnected', ({ clientId, address }) => {
    console.log(`👤 Client connected: ${clientId} from ${address}`);
  });

  server.on('clientDisconnected', ({ clientId }) => {
    console.log(`👋 Client disconnected: ${clientId}`);
  });

  server.on('channelJoined', ({ clientId, channel }) => {
    console.log(`📺 Client ${clientId} joined channel: ${channel}`);
  });

  server.on('channelLeft', ({ clientId, channel }) => {
    console.log(`📺 Client ${clientId} left channel: ${channel}`);
  });

  server.on('error', ({ clientId, error }) => {
    console.error(`❌ Error${clientId ? ` (Client ${clientId})` : ''}: ${error}`);
  });

  server.on('stopped', () => {
    console.log('🛑 Server stopped');
  });

  try {
    await server.start();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ServerOptions = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--port':
    case '-p':
      options.port = parseInt(args[++i]);
      break;
    case '--host':
    case '-h':
      options.host = args[++i];
      break;
    case '--simulation':
    case '-s':
      options.enableRealWebSocket = false;
      break;
    case '--help':
      console.log(`
MIFF WebSocket Server

Usage: npx miff-server [options]

Options:
  -p, --port <number>     Port to listen on (default: 8080)
  -h, --host <string>     Host to bind to (default: localhost)
  -s, --simulation        Run in simulation mode (no real WebSocket)
  --help                  Show this help message

Examples:
  npx miff-server                    # Start on localhost:8080
  npx miff-server -p 3000           # Start on localhost:3000
  npx miff-server -h 0.0.0.0 -p 80  # Start on all interfaces port 80
  npx miff-server --simulation      # Run in simulation mode
      `);
      process.exit(0);
      break;
  }
}

startServer(options).catch(console.error);