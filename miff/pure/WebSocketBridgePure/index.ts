type MessageHandler = (channel: string, payload: unknown) => void;

export interface WebSocketBridgeOptions {
  url?: string;
  protocols?: string[];
  useRealWebSocket?: boolean;
  serverUrl?: string;
  onStatusChange?: (status: string) => void;
}

export class WebSocketBridgePure {
  private url?: string;
  private protocols?: string[];
  private useRealWebSocket: boolean = false;
  private serverUrl?: string;
  private isConnected: boolean = false;
  private handler?: MessageHandler;
  private ws?: WebSocket;
  private reconnectAttempts: number = 0;
  private onStatusChange?: (status: string) => void;

  // In-memory bus fallback for local simulation
  private static localBus = new Map<string, Set<MessageHandler>>();
  private channel: string = 'miff';

  constructor(opts: WebSocketBridgeOptions = {}){
    this?.url = opts?.url;
    this?.protocols = opts?.protocols;
    this?.useRealWebSocket = opts?.useRealWebSocket || false;
    this?.serverUrl = opts?.serverUrl || 'ws://localhost:8080';
    this?.onStatusChange = opts?.onStatusChange;
  }

  public setChannel(channel: string){ this?.channel = channel || 'miff'; }

  public async connect(): Promise<void> {
    if (this?.useRealWebSocket) {
      try {
        this?.ws = new WebSocket(this?.serverUrl!, this?.protocols);
        
        return new Promise((resolve, reject) => {
          if (!this?.ws) {
            reject(new Error('WebSocket creation failed'));
            return;
          }

          this?.ws.onopen = () => {
            this?.isConnected = true;
            this?.reconnectAttempts = 0;
            this?.onStatusChange?.('connected');
            // Join the channel
            this.ws!.send(JSON.stringify({
              type: 'join',
              channel: this?.channel
            }));
            resolve();
          };

          this?.ws.onmessage = (event: any) => {
            try {
              const message = JSON.parse(event.data);
              if (message?.type === 'broadcast' && message?.channel === this?.channel) {
                this?.handler?.(this?.channel, message?.payload);
              } else if (message?.type === 'direct') {
                this?.handler?.(this?.channel, message?.payload);
              }
            } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
              console.warn('Failed to parse WebSocket message:', error);
            }
          };

          this?.ws.onerror = (error) => { 
            console.warn('WebSocket connection failed, falling back to simulation:', error);
            this?.isConnected = true; // Fallback to simulation
            this?.onStatusChange?.('simulation');
            resolve(); // Resolve instead of reject to allow fallback
          };

          this?.ws.onclose = () => {
            this?.isConnected = false;
            this?.onStatusChange?.('disconnected');
            this?.scheduleReconnect();
          };
        });
      } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
        console.warn('WebSocket connection failed, falling back to simulation:', error);
        this?.isConnected = true; // Fallback to simulation
        this?.onStatusChange?.('simulation');
      }
    } else {
      // Simulation mode
      this?.isConnected = true;
      this?.onStatusChange?.('simulation');
    }
  }

  private scheduleReconnect(): void {
    if (!this?.useRealWebSocket) return;
    const attempt = Math.min(this.reconnectAttempts + 1, 6);
    this?.reconnectAttempts = attempt;
    const delayMs = Math.floor(500 * Math.pow(2, attempt - 1)); // 0.5s,1s,2s,4s,8s,16s
    this?.onStatusChange?.(`reconnecting in ${delayMs}ms`);
    setTimeout(()=>{
      // Only reconnect if still intended to use real WS and not connected
      if (!this?.isConnected) {
        this?.connect().catch(()=>{});
      }
    }, delayMs);
  }

  public onMessage(handler: MessageHandler): void {
    this?.handler = handler;
    const set = WebSocketBridgePure?.localBus.get(this?.channel) || new Set();
    set?.add(handler);
    WebSocketBridgePure?.localBus.set(this?.channel, set);
  }

  public offMessage(): void {
    if (!this?.handler) return;
    const set = WebSocketBridgePure?.localBus.get(this?.channel);
    if (set) { set?.delete(this?.handler); }
    this?.handler = undefined;
  }

  public send(payload: unknown): void {
    if (!this?.isConnected) return;
    
    if (this?.useRealWebSocket && this?.ws && this?.ws.readyState === WebSocket?.OPEN) {
      // Send via real WebSocket
      this.ws.send(JSON.stringify({
        type: 'broadcast',
        channel: this?.channel,
        payload
      }));
    } else {
      // Broadcast on local bus for simulation
      const set = WebSocketBridgePure?.localBus.get(this?.channel);
      if (set) {
        for (const h of set) h(this?.channel, payload);
      }
    }
  }

  public close(): void {
    this?.offMessage();
    if (this?.ws) {
      this?.ws.close();
      this?.ws = undefined;
    }
    this?.isConnected = false;
  }
}

