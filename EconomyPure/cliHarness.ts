#!/usr/bin/env -S node --no-warnings
import fs from 'fs';
import path from 'path';
import { EconomyManager, PriceRule, VendorState } from './Manager';

type Cmd =
  | { op: 'list' }
  | { op: 'createRule'; rule: PriceRule }
  | { op: 'createVendor'; vendor: VendorState }
  | { op: 'simulate'; vendorId: string; itemId: string }
  | { op: 'dumpRule'; id: string }
  | { op: 'dumpVendor'; id: string };

function main(){
  const sample = process.argv[2] || 'EconomyPure/sample_economy.json';
  const commands = process.argv[3] || '';
  const mgr = new EconomyManager();
  if (fs.existsSync(sample)){
    const j = JSON.parse(fs.readFileSync(path.resolve(sample),'utf-8')) as {rules:PriceRule[]; vendors:VendorState[]};
    for(const r of j.rules) mgr.createRule(r);
    for(const v of j.vendors) mgr.createVendor(v);
  }
  const cmds:Cmd[] = commands? JSON.parse(fs.readFileSync(path.resolve(commands),'utf-8')) : [{op:'list'} as Cmd];
  const outputs:any[] = [];
  for(const c of cmds){
    if(c.op==='list') outputs.push({ op:'list', status:'ok', result:mgr.list(), issues:[] });
    else if(c.op==='createRule') outputs.push(mgr.createRule(c.rule));
    else if(c.op==='createVendor') outputs.push(mgr.createVendor(c.vendor));
    else if(c.op==='simulate') outputs.push(mgr.calculatePrice(c.vendorId, c.itemId));
    else if(c.op==='dumpRule') outputs.push(mgr.dumpRule(c.id));
    else if(c.op==='dumpVendor') outputs.push(mgr.dumpVendor(c.id));
  }
  console.log(JSON.stringify({outputs}, null, 2));
}
if(require.main===module) main();