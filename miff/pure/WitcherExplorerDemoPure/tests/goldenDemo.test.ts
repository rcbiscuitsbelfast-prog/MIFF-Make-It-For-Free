import path from 'path';
import { SafeJSONParser } from '../../shared/security/SafeJSONParser';


test('WitcherExplorerDemoPure demo runs', () => {
  const cli = path.resolve('WitcherExplorerDemoPure/cliHarness.ts');
  const out = (global as any).testUtils.runCLI(cli, []);
  const j = SafeJSONParser.parse(out);
  expect(j.op).toBe('witcher_explorer_demo');
  expect(j.status).toBe('ok');
  expect(j.nav.op).toBe('nav.path');
  expect(j.dlg.op).toBe('dialogue.next');
  expect(j.quest.op).toBe('parse');
});

