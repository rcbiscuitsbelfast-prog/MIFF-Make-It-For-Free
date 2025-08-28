#!/usr/bin/env node

/**
 * network.ts - CLI commands for NetworkBridgePure module
 * 
 * Provides commands for initializing, testing, and managing network connections.
 */

import { Command } from 'commander';
import { createNetworkBridge, NetworkConfig } from '../../src/modules/NetworkBridgePure/NetworkBridgePure';

const program = new Command();

program
  .name('network')
  .description('Network and multiplayer commands for MIFF games')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize a new network configuration')
  .option('-p, --players <number>', 'Maximum number of players', '4')
  .option('-t, --tick-rate <number>', 'Network tick rate (Hz)', '60')
  .option('-r, --rollback-frames <number>', 'Rollback frames for netcode', '7')
  .option('-d, --input-delay <number>', 'Input delay frames', '2')
  .action(async (options) => {
    const config: NetworkConfig = {
      maxPlayers: parseInt(options.players),
      tickRate: parseInt(options.tickRate),
      rollbackFrames: parseInt(options.rollbackFrames),
      inputDelay: parseInt(options.inputDelay)
    };

    console.log('🌐 Initializing NetworkBridgePure...');
    console.log('Configuration:', JSON.stringify(config, null, 2));

    const bridge = createNetworkBridge(config);
    const hostId = await bridge.startHosting();
    
    console.log('✅ Network bridge initialized');
    console.log(`Host ID: ${hostId}`);
    console.log('Ready for peer connections');
  });

program
  .command('test')
  .description('Run network connectivity tests')
  .option('-h, --host <id>', 'Host ID to connect to')
  .action(async (options) => {
    console.log('🧪 Running network tests...');

    const config: NetworkConfig = {
      maxPlayers: 4,
      tickRate: 60,
      rollbackFrames: 7,
      inputDelay: 2
    };

    const bridge = createNetworkBridge(config);

    if (options.host) {
      console.log(`Connecting to host: ${options.host}`);
      const success = await bridge.joinGame(options.host);
      
      if (success) {
        console.log('✅ Successfully connected to host');
        
        // Test input submission
        bridge.submitLocalInput({ move: 'up' });
        console.log('✅ Input submitted successfully');
        
        // Test frame update
        const state = bridge.update();
        if (state) {
          console.log(`✅ Frame ${state.frame} processed`);
        }
      } else {
        console.log('❌ Failed to connect to host');
      }
    } else {
      console.log('Starting as host...');
      const hostId = await bridge.startHosting();
      console.log(`✅ Host started with ID: ${hostId}`);
      
      // Test local input
      bridge.submitLocalInput({ move: 'left' });
      console.log('✅ Local input processed');
    }

    bridge.disconnect();
    console.log('✅ Network tests completed');
  });

program
  .command('simulate')
  .description('Simulate multi-peer network scenario')
  .option('-p, --peers <number>', 'Number of peers to simulate', '3')
  .action(async (options) => {
    const peerCount = parseInt(options.peers);
    console.log(`🎮 Simulating ${peerCount} peer network...`);

    const config: NetworkConfig = {
      maxPlayers: peerCount + 1,
      tickRate: 60,
      rollbackFrames: 7,
      inputDelay: 2
    };

    // Create host
    const host = createNetworkBridge(config);
    const hostId = await host.startHosting();
    console.log(`Host started: ${hostId}`);

    // Create peers
    const peers = [];
    for (let i = 0; i < peerCount; i++) {
      const peer = createNetworkBridge(config);
      const connected = await peer.joinGame(hostId);
      if (connected) {
        peers.push(peer);
        console.log(`Peer ${i + 1} connected`);
      }
    }

    // Simulate game loop
    console.log('Simulating game loop...');
    for (let frame = 0; frame < 10; frame++) {
      // Host submits input
      host.submitLocalInput({ frame, move: 'up' });
      
      // Peers submit inputs
      peers.forEach((peer, index) => {
        peer.submitLocalInput({ frame, move: index % 2 === 0 ? 'left' : 'right' });
      });

      // Update all bridges
      const hostState = host.update();
      peers.forEach(peer => peer.update());

      if (hostState) {
        console.log(`Frame ${hostState.frame}: ${hostState.inputs.size} inputs processed`);
      }
    }

    // Cleanup
    host.disconnect();
    peers.forEach(peer => peer.disconnect());
    console.log('✅ Simulation completed');
  });

export default program;