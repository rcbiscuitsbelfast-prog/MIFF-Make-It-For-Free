#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const HealthFixture = z.object({
  entities: z.array(z.object({ id: z.string(), max: z.number().int().positive(), hp: z.number().int().nonnegative() }))
});

const QuestFixture = z.object({
  playerId: z.string(),
  quests: z.array(z.object({ id: z.string(), status: z.enum(['locked','active','completed']) }))
});

type SchemaDef = { name: string; schema: z.ZodTypeAny; example: unknown };
const SCHEMAS: SchemaDef[] = [
  { name: 'health', schema: HealthFixture, example: { entities: [{ id:'p1', max:100, hp:85 }] } },
  { name: 'quest', schema: QuestFixture, example: { playerId:'p1', quests:[{ id:'q_intro', status:'active' }] } }
];

function ensureDir(dir: string){ fs.mkdirSync(dir, { recursive: true }); }

function main(){
  const outDir = process.argv[2] || 'miff/fixtures';
  ensureDir(outDir);
  for (const s of SCHEMAS){
    const file = path.join(outDir, `${s.name}.json`);
    const parsed = s.schema.parse(s.example);
    fs.writeFileSync(file, JSON.stringify(parsed, null, 2));
    // emit a .schema.json for reference
    const schemaFile = path.join(outDir, `${s.name}.schema.json`);
    fs.writeFileSync(schemaFile, JSON.stringify(JSON.parse(s.schema.toString()), null, 2));
  }
  console.log(`Generated ${SCHEMAS.length} fixtures in ${outDir}`);
}

main();

