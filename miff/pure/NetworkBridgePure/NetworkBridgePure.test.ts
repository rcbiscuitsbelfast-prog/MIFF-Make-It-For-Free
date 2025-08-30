/**
 * NetworkBridgePure.test.ts
 * 
 * Tests for NetworkBridgePure module covering peer management, state sync, and rollback netcode.
 */

import { NetworkBridge, Peer, StateSyncScheduler, NetworkConfig, GameState } from './NetworkBridgePure';

describe('NetworkBridgePure', () => {
  let config: NetworkConfig;

  beforeEach(() => {
    config = {
      maxPlayers: 4,
      tickRate: 60,
      rollbackFrames: 7,
      inputDelay: 2
    };
  });

  describe('Peer', () => {
    it('should create a peer with correct initial state', () => {
      const peer = new Peer('test-peer', true);
      
      expect(peer.id).toBe('test-peer');
      expect(peer.isHost).toBe(true);
      expect(peer.isConnected).toBe(false);
      expect(peer.latency).toBe(0);
    });

    it('should update latency and last seen timestamp', () => {
      const peer = new Peer('test-peer');
      const before = Date.now();
      
      peer.updateLatency(50);
      
      expect(peer.latency).toBe(50);
      expect(peer.lastSeen).toBeGreaterThanOrEqual(before);
    });

    it('should mark connection status correctly', () => {
      const peer = new Peer('test-peer');
      
      peer.markConnected();
      expect(peer.isConnected).toBe(true);
      
      peer.markDisconnected();
      expect(peer.isConnected).toBe(false);
    });
  });

  describe('StateSyncScheduler', () => {
    let scheduler: StateSyncScheduler;

    beforeEach(() => {
      scheduler = new StateSyncScheduler(config);
    });

    it('should add and remove peers correctly', () => {
      const peer1 = new Peer('peer1');
      const peer2 = new Peer('peer2');
      
      scheduler.addPeer(peer1);
      scheduler.addPeer(peer2);
      
      // Access private property for testing
      const peers = (scheduler as any).peers;
      expect(peers.has('peer1')).toBe(true);
      expect(peers.has('peer2')).toBe(true);
      
      scheduler.removePeer('peer1');
      expect(peers.has('peer1')).toBe(false);
      expect(peers.has('peer2')).toBe(true);
    });

    it('should submit and retrieve inputs correctly', () => {
      const peer = new Peer('test-peer');
      scheduler.addPeer(peer);
      
      const input = { move: 'up' };
      scheduler.submitInput('test-peer', 5, input);
      
      // Access private property for testing
      const inputBuffer = (scheduler as any).inputBuffer;
      expect(inputBuffer.get('test-peer').get(5)).toEqual(input);
    });

    it('should not advance frame without sufficient inputs', () => {
      const peer = new Peer('test-peer');
      peer.markConnected();
      scheduler.addPeer(peer);
      
      const result = scheduler.advanceFrame();
      expect(result).toBeNull();
    });

    it('should advance frame with sufficient inputs', () => {
      const peer = new Peer('test-peer');
      peer.markConnected();
      scheduler.addPeer(peer);
      
      // Submit input for current frame
      scheduler.submitInput('test-peer', 0, { move: 'up' });
      
      const result = scheduler.advanceFrame();
      expect(result).not.toBeNull();
      expect(result?.frame).toBe(0);
      expect(result?.inputs.has('test-peer')).toBe(true);
    });

    it('should rollback to specified frame', () => {
      const peer = new Peer('test-peer');
      peer.markConnected();
      scheduler.addPeer(peer);
      
      // Advance a few frames
      for (let i = 0; i < 5; i++) {
        scheduler.submitInput('test-peer', i, { move: 'up' });
        scheduler.advanceFrame();
      }
      
      scheduler.rollbackToFrame(2);
      
      // Access private property for testing
      const currentFrame = (scheduler as any).currentFrame;
      expect(currentFrame).toBe(2);
    });
  });

  describe('NetworkBridge', () => {
    let mockTransport: any;
    let bridge: NetworkBridge;

    beforeEach(() => {
      mockTransport = {
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn(),
        send: jest.fn().mockResolvedValue(true),
        receive: jest.fn().mockResolvedValue(null),
        getConnectedPeers: jest.fn().mockReturnValue([])
      };
      
      bridge = new NetworkBridge(mockTransport, config);
    });

    it('should start hosting successfully', async () => {
      const hostId = await bridge.startHosting();
      
      expect(hostId).toBeDefined();
      expect(hostId.length).toBeGreaterThan(0);
      
      const peers = bridge.getConnectedPeers();
      expect(peers.length).toBe(1);
      expect(peers[0].isHost).toBe(true);
    });

    it('should join game successfully', async () => {
      const success = await bridge.joinGame('host-id');
      
      expect(success).toBe(true);
      expect(mockTransport.connect).toHaveBeenCalledWith('host-id');
      
      const peers = bridge.getConnectedPeers();
      expect(peers.length).toBe(1);
      expect(peers[0].isHost).toBe(false);
    });

    it('should submit local input and broadcast to peers', () => {
      // Start hosting first
      bridge.startHosting();
      
      const input = { move: 'left' };
      bridge.submitLocalInput(input);
      
      // Should have called send for each connected peer (except self)
      expect(mockTransport.send).toHaveBeenCalled();
    });

    it('should disconnect all peers', () => {
      bridge.disconnect();
      
      expect(mockTransport.disconnect).toHaveBeenCalled();
      const peers = bridge.getConnectedPeers();
      expect(peers.length).toBe(0);
    });

    it('should update and process incoming messages', async () => {
      // Mock incoming message
      const mockMessage = {
        peerId: 'remote-peer',
        data: new TextEncoder().encode(JSON.stringify({ frame: 0, input: { move: 'up' } }))
      };
      mockTransport.receive.mockResolvedValueOnce(mockMessage);
      
      const result = bridge.update();
      
      // Should process the message and potentially advance frame
      expect(mockTransport.receive).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should handle multi-peer scenario', async () => {
      const bridge1 = new NetworkBridge({
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn(),
        send: jest.fn().mockResolvedValue(true),
        receive: jest.fn().mockResolvedValue(null),
        getConnectedPeers: jest.fn().mockReturnValue([])
      }, config);

      const bridge2 = new NetworkBridge({
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn(),
        send: jest.fn().mockResolvedValue(true),
        receive: jest.fn().mockResolvedValue(null),
        getConnectedPeers: jest.fn().mockReturnValue([])
      }, config);

      // Bridge 1 hosts
      const hostId = await bridge1.startHosting();
      
      // Bridge 2 joins
      const joined = await bridge2.joinGame(hostId);
      expect(joined).toBe(true);
      
      // Both should have peers
      expect(bridge1.getConnectedPeers().length).toBe(1);
      expect(bridge2.getConnectedPeers().length).toBe(1);
    });

    it('should handle rollback scenario', () => {
      const scheduler = new StateSyncScheduler(config);
      const peer = new Peer('test-peer');
      peer.markConnected();
      scheduler.addPeer(peer);
      
      // Submit inputs for frames 0-4
      for (let i = 0; i < 5; i++) {
        scheduler.submitInput('test-peer', i, { move: 'up' });
        scheduler.advanceFrame();
      }
      
      // Rollback to frame 2
      scheduler.rollbackToFrame(2);
      
      // Submit different input for frame 2
      scheduler.submitInput('test-peer', 2, { move: 'down' });
      
      // Should be able to advance from frame 2
      const result = scheduler.advanceFrame();
      expect(result?.frame).toBe(2);
      expect(result?.inputs.get('test-peer')).toEqual({ move: 'down' });
    });
  });
});