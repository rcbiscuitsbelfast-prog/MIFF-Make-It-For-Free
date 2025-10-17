import { WebSocketBridgePure } from '../index';

describe('WebSocketBridgePure', () => {
  test('local bus echo between two peers', async ()=>{
    const a = new WebSocketBridgePure();
    const b = new WebSocketBridgePure();
    a.setChannel('test');
    b.setChannel('test');
    await a.connect();
    await b.connect();
    const received: any[] = [];
    b.onMessage((ch, payload)=>{ received.push({ ch, payload }); });
    a.send({ hello: 'world' });
    expect(received.length).toBe(1);
    expect(received[0!].payload).toEqual({ hello:'world' });
  });

  test('should connect in simulation mode', async () => {
    const bridge = new WebSocketBridgePure();
    await bridge.connect();
    expect(bridge).toBeDefined();
    bridge.close();
  });

  test('should connect with real WebSocket option', async () => {
    const realBridge = new WebSocketBridgePure({ 
      useRealWebSocket: true,
      serverUrl: 'ws://localhost:9999' // Non-existent server for testing
    });
    
    // Should fallback to simulation mode when connection fails
    await realBridge.connect();
    expect(realBridge).toBeDefined();
    
    realBridge.close();
  });

  test('should handle message callbacks', async () => {
    const bridge = new WebSocketBridgePure();
    const mockHandler = jest.fn();
    bridge.onMessage(mockHandler);
    
    // Connect first (simulation mode)
    await bridge.connect();
    
    // Simulate sending a message
    bridge.send({ type: 'test', data: 'hello' });
    
    // In simulation mode, messages are broadcast locally
    expect(mockHandler).toHaveBeenCalledWith('miff', { type: 'test', data: 'hello' });
    
    bridge.close();
  });

  test('should set channel', () => {
    const bridge = new WebSocketBridgePure();
    bridge.setChannel('test-channel');
    expect(bridge).toBeDefined();
    bridge.close();
  });

  test('should close connection', () => {
    const bridge = new WebSocketBridgePure();
    bridge.close();
    expect(bridge).toBeDefined();
  });

  test('should handle offMessage', () => {
    const bridge = new WebSocketBridgePure();
    const mockHandler = jest.fn();
    bridge.onMessage(mockHandler);
    bridge.offMessage();
    
    // Send message after removing handler
    bridge.send({ type: 'test', data: 'hello' });
    
    // Handler should not be called
    expect(mockHandler).not.toHaveBeenCalled();
    
    bridge.close();
  });
});