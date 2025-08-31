#!/usr/bin/env npx ts-node
import fs from 'fs';
import path from 'path';
import { parseQuestText } from '../miff/pure/QuestModulePure/index';

function main(){
  const file = process.argv[2];
  if(!file){
    console.log('Usage: npx ts-node cli/quest.ts <quest-file>');
    process.exit(1);
  }
  const text = fs.readFileSync(path.resolve(file), 'utf-8');
  const res = parseQuestText(text);
  console.log(JSON.stringify(res, null, 2));
}

if(require.main===module) main();

