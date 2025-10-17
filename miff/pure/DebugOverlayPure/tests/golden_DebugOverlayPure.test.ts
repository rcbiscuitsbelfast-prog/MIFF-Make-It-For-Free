import { DebugOverlayManager } from '../Manager';

describe('DebugOverlayPure Golden', () => {
  test('overlay creation from payload and CLI', () => {
    const mgr = new DebugOverlayManager({
      showOp: true,
      showStatus: true,
      showIssues: true,
      showTimestamps: true,
      showRenderData: true,
      showEngineHints: true,
      showSignals: true,
      showMetadata: true,
      colorize: false,
      compact: true,
      maxRenderDataItems: 5,
      maxIssueLength: 100,
      outputFormat: 'json'
    });

    const payload = {
      op: 'render',
      status: 'ok',
      renderData: [ { id: 's', type: 'sprite', position: { x: 0, y: 0 }, asset: 'a?.png' } ],
      metadata: { engine: 'web', module: 'demo' }
    } as any;

    const ov = mgr?.createOverlay(payload);
    expect(ov?.status).toBe('ok');
    expect(ov?.overlay.debugInfo?.renderDataCount).toBe(1);

    const cli = JSON.stringify(payload) + '\nnot-json\n';
    const ov2 = mgr?.createOverlayFromCLI(cli);
    expect(ov2?.status).toBe('ok');
  });
});

