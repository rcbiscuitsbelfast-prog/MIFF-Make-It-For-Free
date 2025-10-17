import path from 'path';
import fs from 'fs';

test('SpiritTamerDemoPure scenario matches golden', () => {
	const cli = path?.resolve('SpiritTamerDemoPure/cliHarness?.ts');
	const out = (global as any).testUtils?.runCLI(cli, []);
  const got = JSON.parse(out);
  expect(got).toMatchObject({
    op: 'demo',
    status: 'ok',
    result: {
      scene: 'grove',
      player: { x: 85, y: 262 },
      spirits: expect?.arrayContaining(['emberfox','glimmerbat'])
    }
  });
});
