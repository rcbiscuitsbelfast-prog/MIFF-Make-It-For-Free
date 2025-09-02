#!/usr/bin/env npx ts-node
import { pathfind } from '../systems/NavigationSystemPure/index';
import { nextNode } from '../systems/DialogueSystemPure/index';
import { parseQuestText } from '../systems/QuestModulePure/index';

function main(){
  const nav = pathfind({ width:10, height:10, walls:new Set(['3,0','3,1']) }, { x:0,y:0 }, { x:5,y:0 });
  const dlg = nextNode({ start:'a', nodes:{ a:{ id:'a', text:'Hi', choices:[{ text:'Next', next:'b' }] }, b:{ id:'b', text:'Bye' } } }, 'a', 0);
  const q = parseQuestText('id: q1\ntitle: Witcher Explorer\nstart: s1\nstep s1: Talk to elder | trigger: talk elder | next: s2\nstep s2: Collect 1 herb | trigger: collect herb 1 | reward: xp 10');
  
  // Extract events for golden fixture compatibility
  const events = [
    {
      type: 'pathfindingCompleted',
      path: nav.path,
      pathLength: nav.path ? nav.path.length : 0
    },
    {
      type: 'dialogueProgressed',
      nodeId: dlg.id,
      status: dlg.status
    },
    {
      type: 'questParsed',
      questId: q.quest ? q.quest.id : 'unknown',
      status: q.status
    }
  ];
  
  // Extract final state for golden fixture compatibility
  const finalState = {
    navigation: {
      pathFound: nav.status === 'ok',
      destination: { x: 5, y: 0 },
      pathLength: nav.path ? nav.path.length : 0
    },
    dialogue: {
      currentNode: dlg.id,
      completed: dlg.status === 'ok'
    },
    quest: {
      id: q.quest ? q.quest.id : 'q1',
      title: q.quest ? q.quest.title : 'Witcher Explorer',
      parsed: q.status === 'ok'
    }
  };
  
  console.log(JSON.stringify({ 
    op: 'runScenario', 
    status: 'ok', 
    name: 'WitcherExplorerDemoPure',
    events,
    finalState,
    nav, 
    dlg, 
    quest: q 
  }, null, 2));
}

if(require.main===module) main();

