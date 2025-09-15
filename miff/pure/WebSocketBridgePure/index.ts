type MessageHandler = (channel: string, payload: unknown) => void;

export interface WebSocketBridgeOptions {
  url?: string;
  protocols?: string[];
}

export class WebSocketBridgePure {
  private url?: string;
  private protocols?: string[];
  private isConnected: boolean = false;
  private handler?: MessageHandler;

  // In-memory bus fallback for local simulation
  private static localBus = new Map<string, Set<MessageHandler>>();
  private channel: string = 'miff';

  constructor(opts: WebSocketBridgeOptions = {}){
    this.url = opts.url;
    this.protocols = opts.protocols;
  }

  public setChannel(channel: string){ this.channel = channel || 'miff'; }

  public async connect(): Promise<void> {
    // Stub: mark connected; real sockets can be added later.
    this.isConnected = true;
  }

  public onMessage(handler: MessageHandler): void {
    this.handler = handler;
    const set = WebSocketBridgePure.localBus.get(this.channel) || new Set();
    set.add(handler);
    WebSocketBridgePure.localBus.set(this.channel, set);
  }

  public offMessage(): void {
    if (!this.handler) return;
    const set = WebSocketBridgePure.localBus.get(this.channel);
    if (set) { set.delete(this.handler); }
    this.handler = undefined;
  }

  public send(payload: unknown): void {
    if (!this.isConnected) return;
    // Broadcast on local bus for now
    const set = WebSocketBridgePure.localBus.get(this.channel);
    if (set) {
      for (const h of set) h(this.channel, payload);
    }
  }

  public close(): void {
    this.offMessage();
    this.isConnected = false;
  }
}

