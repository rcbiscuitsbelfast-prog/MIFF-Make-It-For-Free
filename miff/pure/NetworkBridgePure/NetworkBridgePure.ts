/**
 * NetworkBridgePure.ts
 * 
 * Inspired by Godot's high-level multiplayer node API and rollback netcode patterns.
 * Provides pure, remix-safe networking for MIFF games with deterministic state sync.
 * 
 * Attribution: Godot Engine (MIT License) - multiplayer node system patterns
 * Attribution: GGPO (MIT License) - rollback netcode concepts
 */

export interface INetworkTransport {
  connect(peerId: string): Promise<boolean>;
  disconnect(peerId: string): void;
  send(peerId: string, data: Uint8Array): Promise<boolean>;
  receive(): Promise<{ peerId: string; data: Uint8Array } | null>;
  getConnectedPeers(): string[];
}

export interface NetworkConfig {
  maxPlayers: number;
  tickRate: number;
  rollbackFrames: number;
  inputDelay: number;
}

export interface GameState {
  frame: number;
  inputs: Map<string, any>;
  entities: Map<string, any>;
  checksum: number;
}

export class Peer {
  public id: string;
  public isHost: boolean;
  public isConnected: boolean;
  public latency: number;
  public lastSeen: number;

  constructor(id: string, isHost: boolean = false) {
    this.id = id;
    this.isHost = isHost;
    this.isConnected = false;
    this.latency = 0;
    this.lastSeen = Date.now();
  }

  updateLatency(latency: number): void {
    this.latency = latency;
    this.lastSeen = Date.now();
  }

  markConnected(): void {
    this.isConnected = true;
    this.lastSeen = Date.now();
  }

  markDisconnected(): void {
    this.isConnected = false;
  }
}

export class StateSyncScheduler {
  private config: NetworkConfig;
  private peers: Map<string, Peer>;
  private inputBuffer: Map<string, Map<number, any>>;
  private stateHistory: Map<number, GameState>;
  private currentFrame: number;

  constructor(config: NetworkConfig) {
    this.config = config;
    this.peers = new Map();
    this.inputBuffer = new Map();
    this.stateHistory = new Map();
    this.currentFrame = 0;
  }

  addPeer(peer: Peer): void {
    this.peers.set(peer.id, peer);
    this.inputBuffer.set(peer.id, new Map());
  }

  removePeer(peerId: string): void {
    this.peers.delete(peerId);
    this.inputBuffer.delete(peerId);
  }

  submitInput(peerId: string, frame: number, input: any): void {
    const buffer = this.inputBuffer.get(peerId);
    if (buffer) {
      buffer.set(frame, input);
    }
  }

  canAdvanceFrame(): boolean {
    const minFrame = this.currentFrame - this.config.rollbackFrames;
    for (const [peerId, buffer] of this.inputBuffer) {
      const peer = this.peers.get(peerId);
      if (peer && peer.isConnected) {
        let hasInput = false;
        for (let frame = minFrame; frame <= this.currentFrame; frame++) {
          if (buffer.has(frame)) {
            hasInput = true;
            break;
          }
        }
        if (!hasInput) return false;
      }
    }
    return true;
  }

  advanceFrame(): GameState | null {
    if (!this.canAdvanceFrame()) return null;

    const inputs = new Map();
    for (const [peerId, buffer] of this.inputBuffer) {
      const input = buffer.get(this.currentFrame);
      if (input) {
        inputs.set(peerId, input);
      }
    }

    const state: GameState = {
      frame: this.currentFrame,
      inputs,
      entities: new Map(), // Would be populated by game logic
      checksum: this.calculateChecksum(inputs)
    };

    this.stateHistory.set(this.currentFrame, state);
    this.currentFrame++;

    return state;
  }

  private calculateChecksum(inputs: Map<string, any>): number {
    let checksum = 0;
    for (const [peerId, input] of inputs) {
      checksum += peerId.charCodeAt(0) + JSON.stringify(input).length;
    }
    return checksum;
  }

  rollbackToFrame(frame: number): void {
    this.currentFrame = frame;
    // Clear future state history
    for (const key of this.stateHistory.keys()) {
      if (key > frame) {
        this.stateHistory.delete(key);
      }
    }
  }
}

export class NetworkBridge {
  private transport: INetworkTransport;
  private scheduler: StateSyncScheduler;
  private peers: Map<string, Peer>;
  private isHost: boolean;
  private localPeerId: string;

  constructor(transport: INetworkTransport, config: NetworkConfig) {
    this.transport = transport;
    this.scheduler = new StateSyncScheduler(config);
    this.peers = new Map();
    this.isHost = false;
    this.localPeerId = this.generatePeerId();
  }

  private generatePeerId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async startHosting(): Promise<string> {
    this.isHost = true;
    const localPeer = new Peer(this.localPeerId, true);
    localPeer.markConnected();
    this.peers.set(this.localPeerId, localPeer);
    this.scheduler.addPeer(localPeer);
    return this.localPeerId;
  }

  async joinGame(hostId: string): Promise<boolean> {
    const success = await this.transport.connect(hostId);
    if (success) {
      const localPeer = new Peer(this.localPeerId, false);
      localPeer.markConnected();
      this.peers.set(this.localPeerId, localPeer);
      this.scheduler.addPeer(localPeer);
    }
    return success;
  }

  submitLocalInput(input: any): void {
    const currentFrame = this.scheduler['currentFrame'];
    this.scheduler.submitInput(this.localPeerId, currentFrame, input);
    
    // Broadcast to other peers
    for (const [peerId, peer] of this.peers) {
      if (peerId !== this.localPeerId && peer.isConnected) {
        this.transport.send(peerId, this.serializeInput(currentFrame, input));
      }
    }
  }

  private serializeInput(frame: number, input: any): Uint8Array {
    const data = JSON.stringify({ frame, input });
    return new TextEncoder().encode(data);
  }

  private deserializeInput(data: Uint8Array): { frame: number; input: any } {
    const text = new TextDecoder().decode(data);
    return JSON.parse(text);
  }

  update(): GameState | null {
    // Process incoming messages
    this.processIncomingMessages();
    
    // Try to advance frame
    return this.scheduler.advanceFrame();
  }

  private async processIncomingMessages(): Promise<void> {
    while (true) {
      const message = await this.transport.receive();
      if (!message) break;

      const { frame, input } = this.deserializeInput(message.data);
      this.scheduler.submitInput(message.peerId, frame, input);
    }
  }

  getConnectedPeers(): Peer[] {
    return Array.from(this.peers.values()).filter(peer => peer.isConnected);
  }

  disconnect(): void {
    for (const [peerId, peer] of this.peers) {
      if (peerId !== this.localPeerId) {
        this.transport.disconnect(peerId);
      }
    }
    this.peers.clear();
  }
}

/**
 * Real WebSocket Transport Implementation
 * Replaces mock transport with actual WebSocket-based networking
 */
class WebSocketTransport implements INetworkTransport {
  private connections: Map<string, WebSocket> = new Map();
  private messageQueue: Array<{ peerId: string; data: Uint8Array }> = [];
  private isServer: boolean = false;
  private serverPort: number = 8080;

  constructor(isServer: boolean = false, port: number = 8080) {
    this.isServer = isServer;
    this.serverPort = port;
  }

  async connect(peerId: string): Promise<boolean> {
    try {
      if (this.isServer) {
        // Server mode: wait for incoming connections
        return true;
      } else {
        // Client mode: connect to server
        const ws = new WebSocket(`ws://localhost:${this.serverPort}`);
        
        return new Promise((resolve, reject) => {
          ws.onopen = () => {
            this.connections.set(peerId, ws);
            ws.onmessage = (event) => {
              const data = new Uint8Array(event.data);
              this.messageQueue.push({ peerId, data });
            };
            resolve(true);
          };
          
          ws.onerror = () => resolve(false);
          ws.onclose = () => this.connections.delete(peerId);
          
          setTimeout(() => resolve(false), 5000); // 5s timeout
        });
      }
    } catch (error) {
      console.warn('WebSocket connection failed, falling back to local mode:', error);
      return false;
    }
  }

  disconnect(peerId: string): void {
    const ws = this.connections.get(peerId);
    if (ws) {
      ws.close();
      this.connections.delete(peerId);
    }
  }

  async send(peerId: string, data: Uint8Array): Promise<boolean> {
    const ws = this.connections.get(peerId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(data);
        return true;
      } catch (error) {
        console.warn('Failed to send data:', error);
        return false;
      }
    }
    return false;
  }

  async receive(): Promise<{ peerId: string; data: Uint8Array } | null> {
    return this.messageQueue.shift() || null;
  }

  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys()).filter(peerId => {
      const ws = this.connections.get(peerId);
      return ws && ws.readyState === WebSocket.OPEN;
    });
  }
}

/**
 * Local Transport Implementation
 * For single-player or local testing scenarios
 */
class LocalTransport implements INetworkTransport {
  private localPeers: Set<string> = new Set();
  private messageBuffer: Array<{ peerId: string; data: Uint8Array }> = [];

  async connect(peerId: string): Promise<boolean> {
    this.localPeers.add(peerId);
    return true;
  }

  disconnect(peerId: string): void {
    this.localPeers.delete(peerId);
  }

  async send(peerId: string, data: Uint8Array): Promise<boolean> {
    if (this.localPeers.has(peerId)) {
      // Echo back for local testing
      this.messageBuffer.push({ peerId, data });
      return true;
    }
    return false;
  }

  async receive(): Promise<{ peerId: string; data: Uint8Array } | null> {
    return this.messageBuffer.shift() || null;
  }

  getConnectedPeers(): string[] {
    return Array.from(this.localPeers);
  }
}

// CLI interface with real transport implementation
export function createNetworkBridge(config: NetworkConfig): NetworkBridge {
  // Real transport implementation with WebSocket fallback to local
  let transport: INetworkTransport;
  
  // Check if we're in a WebSocket-capable environment
  if (typeof WebSocket !== 'undefined') {
    transport = new WebSocketTransport(false, 8080);
  } else {
    // Fallback to local transport for CLI/testing environments
    transport = new LocalTransport();
  }

  return new NetworkBridge(transport, config);
}

// Export for CLI usage
export default NetworkBridge;