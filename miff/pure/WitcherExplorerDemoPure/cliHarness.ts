#!/usr/bin/env npx ts-node
import { pathfind } from '../NavigationSystemPure/index';
import { nextNode } from '../DialogueSystemPure/index';
import { parseQuestText } from '../QuestModulePure/index';

function main(){
  const nav = pathfind({ width:10, height:10, walls:new Set(['3,0','3,1']) }, { x:0,y:0 }, { x:5,y:0 });
  const dlg = nextNode({ start:'a', nodes:{ a:{ id:'a', text:'Hi', choices:[{ text:'Next', next:'b' }] }, b:{ id:'b', text:'Bye' } } }, 'a', 0);
  const q = parseQuestText('id: q1\ntitle: Witcher Explorer\nstart: s1\nstep s1: Talk to elder | trigger: talk elder | next: s2\nstep s2: Collect 1 herb | trigger: collect herb 1 | reward: xp 10');
  console.log(JSON.stringify({ op:'witcher_explorer_demo', status:'ok', nav, dlg, quest:q }, null, 2));
}

if(require.main===module) main();

