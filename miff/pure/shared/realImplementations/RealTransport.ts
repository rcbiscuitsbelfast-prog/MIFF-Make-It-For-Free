/**
 * Real Network Transport Implementation
 * 
 * Replaces mock transport with actual network functionality
 * for production use in MIFF framework.
 */

import { EventEmitter } from 'events';

export interface TransportConfig {
  protocol: 'websocket' | 'http' | 'tcp';
  host: string;
  port: number;
  timeout?: number;
  retries?: number;
  secure?: boolean;
}

export interface TransportMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  source: string;
  target?: string;
}

export class RealTransport extends EventEmitter {
  private config: TransportConfig;
  private connected: boolean = false;
  private connection: any = null;
  private messageQueue: TransportMessage[] = [];
  private reconnectAttempts: number = 0;

  constructor(config: TransportConfig) {
    super();
    this.config = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      switch (this.config.protocol) {
        case 'websocket':
          await this.connectWebSocket();
          break;
        case 'http':
          await this.connectHTTP();
          break;
        case 'tcp':
          await this.connectTCP();
          break;
        default:
          throw new Error(`Unsupported protocol: ${this.config.protocol}`);
      }

      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Process queued messages
      await this.processMessageQueue();
      
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.connection) {
        switch (this.config.protocol) {
          case 'websocket':
            this.connection.close();
            break;
          case 'http':
            // HTTP is stateless, no persistent connection to close
            break;
          case 'tcp':
            this.connection.end();
            break;
        }
      }

      this.connected = false;
      this.connection = null;
      this.emit('disconnected');
      
    } catch (error) {
      console.error('Error during disconnect:', error);
      throw error;
    }
  }

  async send(message: TransportMessage): Promise<void> {
    if (!this.connected) {
      this.messageQueue.push(message);
      await this.connect();
      return;
    }

    try {
      const serializedMessage = JSON.stringify(message);
      
      switch (this.config.protocol) {
        case 'websocket':
          this.connection.send(serializedMessage);
          break;
        case 'http':
          await this.sendHTTP(serializedMessage);
          break;
        case 'tcp':
          this.connection.write(serializedMessage + '\n');
          break;
      }

      this.emit('message_sent', message);
      
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    const WebSocket = require('ws');
    const url = `${this.config.secure ? 'wss' : 'ws'}://${this.config.host}:${this.config.port}`;
    
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(url);
      
      this.connection.on('open', () => {
        resolve();
      });
      
      this.connection.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.emit('message', message);
        } catch (error) {
          this.emit('error', new Error('Invalid message format'));
        }
      });
      
      this.connection.on('error', (error: Error) => {
        reject(error);
      });
      
      this.connection.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
      });
    });
  }

  private async connectHTTP(): Promise<void> {
    // HTTP is stateless, just validate the endpoint
    const protocol = this.config.secure ? 'https' : 'http';
    const url = `${protocol}://${this.config.host}:${this.config.port}/health`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP connection failed: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`HTTP endpoint unreachable: ${error}`);
    }
  }

  private async connectTCP(): Promise<void> {
    const net = require('net');
    
    return new Promise((resolve, reject) => {
      this.connection = net.createConnection({
        host: this.config.host,
        port: this.config.port,
        timeout: this.config.timeout || 5000
      });
      
      this.connection.on('connect', () => {
        resolve();
      });
      
      this.connection.on('data', (data: Buffer) => {
        try {
          const messages = data.toString().trim().split('\n');
          messages.forEach(messageStr => {
            if (messageStr) {
              const message = JSON.parse(messageStr);
              this.emit('message', message);
            }
          });
        } catch (error) {
          this.emit('error', new Error('Invalid message format'));
        }
      });
      
      this.connection.on('error', (error: Error) => {
        reject(error);
      });
      
      this.connection.on('close', () => {
        this.connected = false;
        this.emit('disconnected');
      });
    });
  }

  private async sendHTTP(message: string): Promise<void> {
    const protocol = this.config.secure ? 'https' : 'http';
    const url = `${protocol}://${this.config.host}:${this.config.port}/message`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: message
    });
    
    if (!response.ok) {
      throw new Error(`HTTP send failed: ${response.status}`);
    }
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      await this.send(message);
    }
  }

  private handleConnectionError(error: any): void {
    console.error('Transport connection error:', error);
    
    if (this.reconnectAttempts < (this.config.retries || 3)) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect().catch(err => {
          console.error('Reconnection failed:', err);
        });
      }, 1000 * this.reconnectAttempts);
    } else {
      this.emit('connection_failed', error);
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.connected;
  }

  getConnectionInfo(): any {
    return {
      protocol: this.config.protocol,
      host: this.config.host,
      port: this.config.port,
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export for use in place of mockTransport
export const realTransport = {
  connect: (config: TransportConfig) => new RealTransport(config).connect(),
  disconnect: (transport: RealTransport) => transport.disconnect(),
  send: (transport: RealTransport, message: TransportMessage) => transport.send(message),
  create: (config: TransportConfig) => new RealTransport(config)
};