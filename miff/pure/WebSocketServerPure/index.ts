import { WebSocket, WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

export interface WebSocketServerOptions {
  port?: number;
  host?: string;
  enableRealWebSocket?: boolean;
}

export interface ClientConnection {
  id: string;
  ws: WebSocket;
  lastSeen: number;
  channels: Set<string>;
}

export class WebSocketServerPure extends EventEmitter {
  private server?: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private options: WebSocketServerOptions;
  private isRunning: boolean = false;

  constructor(options: WebSocketServerOptions = {}) {
    super();
    this.options = {
      port: 8080,
      host: 'localhost',
      enableRealWebSocket: false,
      ...options
    };
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    if (!this.options.enableRealWebSocket) {
      // Fallback to in-memory simulation
      this.isRunning = true;
      this.emit('ready', { port: 'simulation', host: 'memory' });
      return;
    }

    try {
      this.server = new WebSocketServer({
        port: this.options.port,
        host: this.options.host
      });

      this.server.on('connection', (ws: WebSocket, req: any) => {
        const clientId = this.generateClientId();
        const client: ClientConnection = {
          id: clientId,
          ws,
          lastSeen: Date.now(),
          channels: new Set()
        };

        this.clients.set(clientId, client);
        this.emit('clientConnected', { clientId, address: req.socket.remoteAddress });

        ws.on('message', (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(clientId, message);
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            this.emit('error', { clientId, error: 'Invalid JSON message' });
          }
        });

        ws.on('close', () => {
          this.handleClientDisconnect(clientId);
        });

        ws.on('error', (error: any) => {
          this.emit('error', { clientId, error: error.message });
        });
      });

      this.server.on('error', (error: any) => {
        this.emit('error', { error: error.message });
      });

      this.isRunning = true;
      this.emit('ready', { port: this.options.port, host: this.options.host });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.emit('error', { error: `Failed to start server: ${error}` });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.server) {
      this.server.close();
      this.server = undefined;
    }

    this.clients.clear();
    this.channels.clear();
    this.isRunning = false;
    this.emit('stopped');
  }

  public broadcast(channel: string, payload: unknown, excludeClientId?: string): void {
    if (!this.isRunning) return;

    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    const message = JSON.stringify({
      type: 'broadcast',
      channel,
      payload,
      timestamp: new Date()
    });

    for (const clientId of channelClients) {
      if (excludeClientId && clientId === excludeClientId) continue;
      
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    }
  }

  public sendToClient(clientId: string, payload: unknown): boolean {
    if (!this.isRunning) return false;

    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return false;

    const message = JSON.stringify({
      type: 'direct',
      payload,
      timestamp: new Date()
    });

    client.ws.send(message);
    return true;
  }

  public joinChannel(clientId: string, channel: string): boolean {
    if (!this.isRunning) return false;

    const client = this.clients.get(clientId);
    if (!client) return false;

    client.channels.add(channel);
    
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);

    this.emit('channelJoined', { clientId, channel });
    return true;
  }

  public leaveChannel(clientId: string, channel: string): boolean {
    if (!this.isRunning) return false;

    const client = this.clients.get(clientId);
    if (!client) return false;

    client.channels.delete(channel);
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }

    this.emit('channelLeft', { clientId, channel });
    return true;
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public getChannelCount(): number {
    return this.channels.size;
  }

  public getChannelClients(channel: string): string[] {
    const channelClients = this.channels.get(channel);
    return channelClients ? Array.from(channelClients) : [];
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastSeen = Date.now();

    switch (message.type) {
      case 'join':
        if (message.channel) {
          this.joinChannel(clientId, message.channel);
        }
        break;
      case 'leave':
        if (message.channel) {
          this.leaveChannel(clientId, message.channel);
        }
        break;
      case 'broadcast':
        if (message.channel && message.payload) {
          this.broadcast(message.channel, message.payload, clientId);
        }
        break;
      case 'ping':
        // Echo back with pong and original timestamp
        this.sendToClient(clientId, { type: 'pong', t: message.t || Date.now() });
        break;
      default:
        this.emit('message', { clientId, message });
    }
  }

  private handleClientDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Leave all channels
    for (const channel of client.channels) {
      this.leaveChannel(clientId, channel);
    }

    this.clients.delete(clientId);
    this.emit('clientDisconnected', { clientId });
  }
}