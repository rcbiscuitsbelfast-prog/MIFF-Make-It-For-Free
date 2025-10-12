#!/usr/bin/env node
const cp = require('child_process');

const total = Number(process.env.JEST_TOTAL_SHARDS || '2');
const index = Number(process.env.JEST_SHARD_INDEX || '0');

if (!(index >= 0 && index < total)){
  console.error('Invalid shard settings');
  process.exit(1);
}

const args = ['--config','jest.pure.config.cjs','--runInBand','--shard',`${index}/${total}`];
const res = cp.spawnSync('npx', ['jest', ...args], { stdio: 'inherit' });
process.exit(res.status || 0);

