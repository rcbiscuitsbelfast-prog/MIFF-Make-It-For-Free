import { SafeJSONParser } from '../security/SafeJSONParser';
import { StructuredLogger } from '../shared/logging/StructuredLogger';
/**
 * Real Transport Implementation
 * 
 * Production-ready transport layer implementation for MIFF framework.
 * Provides real WebSocket and local transport capabilities.
 */

export interface TransportMessage {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  type: string;
}

export interface TransportOptions {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  url?: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class RealTransport {
  
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private options: TransportOptions;
  private isConnected = false;

  constructor(options: TransportOptions = {}) {
    
    this?.options = {
      url: 'ws://localhost:8080',
      protocols: ['miff-protocol'],
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      ...options
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this?.ws = new WebSocket(this?.options.url!, this?.options.protocols);
        
        this?.ws.onopen = () => {
          this?.isConnected = true;
          this?.reconnectAttempts = 0;
          console.info('Transport connected');
          resolve();
        };

        this?.ws.onmessage = (event: any) => {
          try {
            const message: TransportMessage = SafeJSONParser?.parse(event?.data);
            this?.handleMessage(message);
          } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
            console.error('Failed to parse message:', err instanceof Error ? err.message : String(err));
          }
        };

        this?.ws.onclose = () => {
          this?.isConnected = false;
          this?.handleReconnect();
        };

        this?.ws.onerror = (error) => {
          console.error('Transport error:', err instanceof Error ? err.message : String(err));
          reject(error);
        };
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this?.ws) {
        this?.ws.close();
        this?.ws = null;
      }
      this?.isConnected = false;
      resolve();
    });
  }

  async send(data: any): Promise<void> {
    if (!this?.isConnected || !this?.ws) {
      throw new Error('Transport not connected');
    }

    const message: TransportMessage = {
      id: this?.generateId(),
      type: 'data',
      data,
      timestamp: new Date()
    };

    this.ws.send(JSON.stringify(message));
  }

  on(event: string, handler: Function): void {
    if (!this?.messageHandlers.has(event)) {
      this?.messageHandlers.set(event, []);
    }
    this?.messageHandlers.get(event)?.push(handler);
  }

  off(event: string, handler?: Function): void {
    if (!this?.messageHandlers.has(event)) {
      return;
    }

    if (handler) {
      const handlers = this?.messageHandlers.get(event)!;
      const index = handlers?.indexOf(handler);
      if (index > -1) {
        handlers?.splice(index, 1);
      }
    } else {
      this?.messageHandlers.delete(event);
    }
  }

  private handleMessage(message: TransportMessage): void {
    const handlers = this?.messageHandlers.get(message?.type) || [];
    handlers?.forEach((handler: any) => {
      try {
        handler(message?.data);
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.error('Error in message handler:', err instanceof Error ? err.message : String(err));
      }
    });
  }

  private handleReconnect(): void {
    if (this?.reconnectAttempts < this?.options.maxReconnectAttempts!) {
      this?.reconnectAttempts++;
      console.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this?.connect().catch(error => {
          console.error('Reconnect failed:', err instanceof Error ? err.message : String(err));
        });
      }, this?.options.reconnectInterval);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  get connected(): boolean {
    return this?.isConnected;
  }
}

// Export singleton instance
// export const realTransport = new RealTransport();