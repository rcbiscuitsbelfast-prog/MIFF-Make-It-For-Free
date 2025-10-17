#!/usr/bin/env tsx
import { parseKeyValueArgs, handleSuccess, handleError } from '../shared/cliHarnessUtils';
import { createRigState, reduceAnim, RigConfig } from './index';

const { mode, params } = parseKeyValueArgs(process.argv);

const config: RigConfig = {
  joints: ['root','spine','neck','head','shoulder_l','shoulder_r','elbow_l','elbow_r','hand_l','hand_r','hip_l','hip_r','knee_l','knee_r','foot_l','foot_r'],
  defaultPose: { name: 'idle', joints: { spine: { rot: 0 }, knee_l: { rot: 2 }, knee_r: { rot: -2 } } },
  poses: [
    { name: 'idle', joints: { spine: { rot: 0 } } },
    { name: 'walk_a', joints: { knee_l: { rot: 10 }, knee_r: { rot: -10 }, elbow_l: { rot: -5 }, elbow_r: { rot: 5 } } },
    { name: 'walk_b', joints: { knee_l: { rot: -10 }, knee_r: { rot: 10 }, elbow_l: { rot: 5 }, elbow_r: { rot: -5 } } },
    { name: 'interact', joints: { hand_r: { rot: 20 }, elbow_r: { rot: 15 } } }
  ],
  transitions: [ { from: '*', to: 'walk_a', blendMs: 120 }, { from: 'walk_a', to: 'walk_b', blendMs: 120 }, { from: '*', to: 'idle', blendMs: 150 }, { from: '*', to: 'interact', blendMs: 160 } ]
};

try {
  const state = createRigState(config);
  switch (mode) {
    case 'idle':
      handleSuccess({ state: reduceAnim(state, { type: 'set_pose', pose: 'idle' }, config) }, 'idle');
      break;
    case 'walk': {
      let s = reduceAnim(state, { type: 'transition', to: 'walk_a' }, config);
      for (let i=0;i<2;i++) s = reduceAnim(s, { type: 'tick', dtMs: 120 }, config);
      s = reduceAnim(s, { type: 'transition', to: 'walk_b' }, config);
      for (let i=0;i<2;i++) s = reduceAnim(s, { type: 'tick', dtMs: 120 }, config);
      handleSuccess({ state: s }, 'walk');
      break;
    }
    case 'interact': {
      let s = reduceAnim(state, { type: 'transition', to: 'interact' }, config);
      for (let i=0;i<2;i++) s = reduceAnim(s, { type: 'tick', dtMs: 160 }, config);
      handleSuccess({ state: s }, 'interact');
      break;
    }
    default:
      handleSuccess({ help: '--mode=idle|walk|interact' }, 'help');
  }
} catch (e) {
  handleError(e);
}

