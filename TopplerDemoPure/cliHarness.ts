#!/usr/bin/env npx ts-node

import { runScenario } from './ScenarioPackTopplerDemoPure';

function main(){
  const out = runScenario({ dt: 0.1, total: 1.0 });
  console.log(JSON.stringify(out, null, 2));
}

if(require.main===module) main();

