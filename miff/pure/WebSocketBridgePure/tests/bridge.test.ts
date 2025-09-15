import { WebSocketBridgePure } from '../index';

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
  expect(received[0].payload).toEqual({ hello:'world' });
});