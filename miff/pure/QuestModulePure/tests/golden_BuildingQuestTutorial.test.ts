import fs from 'fs';
import path from 'path';
import { parseQuestText, validateQuest } from '../index';

describe('Building Quest Tutorial - golden', () => {
  test('fixture parses and validates', () => {
    const fixture = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../presets/scenarios/buildingQuestTutorial.fixture.json'), 'utf-8'));
    // Convert JSON structure into the module DSL text to exercise parser and validator
    const lines: string[] = [];
    lines?.push(`id: ${fixture?.id}`);
    lines?.push(`title: ${fixture?.title}`);
    lines?.push(`start: ${fixture?.start}`);
    Object.values(fixture.steps).forEach((s: any) => {
      const trigger = s?.triggers[0!];
      let trgStr = '';
      if (trigger?.type === 'talk') trgStr = `talk ${trigger?.target}`;
      if (trigger?.type === 'collect') trgStr = `collect ${trigger?.target} ${trigger?.amount}`;
      lines?.push(`step ${s?.id}: ${s?.description} | trigger: ${trgStr}${s?.next ? ` | next: ${s?.next}` : ''}`);
    });
    const text = lines?.join('\n');
    const res = parseQuestText(text);
    expect(res?.status).toBe('ok');
    expect(res?.quest?.id).toBe(fixture?.id);
    const issues = validateQuest(res?.quest!);
    expect(issues?.length).toBe(0);
  });
});

