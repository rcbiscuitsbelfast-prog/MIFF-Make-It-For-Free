#!/usr/bin/env npx ts-node
import { performance } from 'perf_hooks';
import v8 from 'v8';
import { PhysicsManager } from '../miff/pure/PhysicsSystemPure/Manager';
import { BridgeSchemaValidator } from '../miff/pure/BridgeSchemaPure/schema';

function bytesHuman(n:number){ const u=['B','KB','MB','GB']; let i=0; while(n>1024 && i<u.length-1){ n/=1024; i++; } return `${n.toFixed(2)} ${u[i]}`; }

function measure<T>(label:string, fn:()=>T){
  const start = performance.now();
  const before = v8.getHeapStatistics().used_heap_size;
  const result = fn();
  const after = v8.getHeapStatistics().used_heap_size;
  const ms = performance.now()-start;
  return { label, ms: Math.round(ms*100)/100, bytes: after-before, result };
}

function main(){
  const sim = measure('physics.step(1000)', () => {
    const pm = new PhysicsManager();
    pm.load({ defaultGravity:{x:0,y:9.81}, defaultFriction:0, bodies:[{ id:'b', position:{x:0,y:0}, velocity:{x:1,y:0}, mass:1 }] });
    for(let i=0;i<1000;i++) pm.step(0.016);
    return pm.dump('b');
  });
  const render = measure('schema.validateRenderPayload', () => {
    return BridgeSchemaValidator.validateRenderPayload({ op:'render', status:'ok', renderData:[{ id:'s', type:'sprite', position:{x:0,y:0} }] });
  });
  console.log(JSON.stringify({ op:'profile', status:'ok', results:[
    { label: sim.label, ms: sim.ms, mem: bytesHuman(sim.bytes) },
    { label: render.label, ms: render.ms, mem: bytesHuman(render.bytes) }
  ] }, null, 2));
}

if(require.main===module) main();

