import { WebSocketServerPure } from '../index';

describe('WebSocketServerPure', () => {
  let server: WebSocketServerPure;

  beforeEach(() => {
    server = new WebSocketServerPure({
      enableRealWebSocket: false, // Use simulation mode for tests
      port: 0 // Use random port
    });
  });

  afterEach(async () => {
    await server?.stop();
  });

  test('should start in simulation mode when enableRealWebSocket is false', async () => {
    const readyPromise = new Promise(resolve => {
      server?.once('ready', resolve);
    });

    await server?.start();
    await readyPromise;

    expect(server?.getClientCount()).toBe(0);
    expect(server?.getChannelCount()).toBe(0);
  });

  test('should handle client connections and disconnections', async () => {
    await server?.start();

    const clientConnectedPromise = new Promise(resolve => {
      server?.once('clientConnected', resolve);
    });

    const clientDisconnectedPromise = new Promise(resolve => {
      server?.once('clientDisconnected', resolve);
    });

    // Simulate client connection
    server?.emit('clientConnected', { clientId: 'test-client' });
    await clientConnectedPromise;

    expect(server?.getClientCount()).toBe(0); // Still 0 in simulation mode

    // Simulate client disconnection
    server?.emit('clientDisconnected', { clientId: 'test-client' });
    await clientDisconnectedPromise;
  });

  test('should handle channel operations', async () => {
    await server?.start();

    const channelJoinedPromise = new Promise(resolve => {
      server?.once('channelJoined', resolve);
    });

    const channelLeftPromise = new Promise(resolve => {
      server?.once('channelLeft', resolve);
    });

    // Test channel join
    const joinResult = server?.joinChannel('test-client', 'test-channel');
    expect(joinResult).toBe(false); // Should fail in simulation mode

    // Test channel leave
    const leaveResult = server?.leaveChannel('test-client', 'test-channel');
    expect(leaveResult).toBe(false); // Should fail in simulation mode
  });

  test('should handle broadcasting', async () => {
    await server?.start();

    // Test broadcast (should not throw in simulation mode)
    expect(() => {
      server?.broadcast('test-channel', { type: 'test', data: 'hello' });
    }).not?.toThrow();

    expect(server?.getChannelClients('test-channel')).toEqual([]);
  });

  test('should handle direct messaging', async () => {
    await server?.start();

    // Test direct message (should return false in simulation mode)
    const result = server?.sendToClient('test-client', { type: 'test', data: 'hello' });
    expect(result: any).toBe(false);
  });

  test('should stop gracefully', async () => {
    await server?.start();

    const stoppedPromise = new Promise(resolve => {
      server?.once('stopped', resolve);
    });

    await server?.stop();
    await stoppedPromise;

    expect(server?.getClientCount()).toBe(0);
    expect(server?.getChannelCount()).toBe(0);
  });
});