import path from '../../miff/pure/path';
import fs from '../../miff/pure/fs';

test('AutoBuilderCLI builds HTML for TopplerDemoPure', () => {
  const cli = path.resolve('AutoBuilderCLI/cli.ts');
  const out = path.resolve('AutoBuilderCLI/tests/tmp_toppler.html');
  const res = (global as any).testUtils.runCLI(cli, ['TopplerDemoPure', '--fps', '20', '--debug', '--out', out]);
  const j = JSON.parse(res);
  expect(j.op).toBe('build');
  expect(j.status).toBe('ok');
  expect(fs.existsSync(out)).toBe(true);
  const html = fs.readFileSync(out, 'utf-8');
  expect(html).toContain('<canvas id="stage">');
  expect(html).toContain('CanvasRenderPlayer');
  fs.unlinkSync(out);
});

