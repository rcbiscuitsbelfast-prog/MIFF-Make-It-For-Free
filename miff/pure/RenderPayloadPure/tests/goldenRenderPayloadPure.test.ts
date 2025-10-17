import path from 'path';
import fs from 'fs';
import { RenderPayloadBuilder, createSampleFrame } from '../Manager';
import { BridgeSchemaValidator } from '../../BridgeSchemaPure/schema';

test('builder creates valid sample frame', () => {
  const payload = createSampleFrame();
  const issues = BridgeSchemaValidator.validateRenderPayload(payload);
  expect(issues).toHaveLength(0);
  expect(payload.renderData.length).toBeGreaterThan(0);
});

test('CLI build-sample outputs a payload', () => {
  const out = (global as any).testUtils.runCLI(path.resolve('RenderPayloadPure/cliHarness.ts'), ['build-sample']);
  const j = JSON.parse(out);
  expect(j.op).toBe('buildSample');
  expect(j.status).toBe('ok');
  expect(j.payload).toBeDefined();
  expect(Array.isArray(j.payload.renderData)).toBe(true);
});

test('CLI validate reports issues for invalid payload', () => {
  const invalid = {
    op: 'render',
    status: 'ok',
    renderData: [ { id: 'bad', type: 'invalid' } ]
  } as any;
  const tmp = path.resolve(__dirname, 'tmp_invalid.json');
  fs.writeFileSync(tmp, JSON.stringify(invalid));
  try{
    const out = (global as any).testUtils.runCLI(path.resolve('RenderPayloadPure/cliHarness.ts'), ['validate', tmp]);
    const j = JSON.parse(out);
    expect(j.op).toBe('validate');
    expect(j.status).toBe('error');
    expect(j.issues.some((x:string)=>x.includes('Invalid render type'))).toBe(true);
  } finally {
    fs.unlinkSync(tmp);
  }
});

