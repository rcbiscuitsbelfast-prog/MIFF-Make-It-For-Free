import { createRigState, reduceAnim, RigConfig } from '../index';

const config: RigConfig = {
  joints: ['root','spine','neck','head','shoulder_l','shoulder_r','elbow_l','elbow_r','hand_l','hand_r','hip_l','hip_r','knee_l','knee_r','foot_l','foot_r'],
  defaultPose: { name: 'idle', joints: { spine: { rot: 0 } } },
  poses: [
    { name: 'idle', joints: { spine: { rot: 0 } } },
    { name: 'walk_a', joints: { knee_l: { rot: 10 }, knee_r: { rot: -10 } } },
    { name: 'walk_b', joints: { knee_l: { rot: -10 }, knee_r: { rot: 10 } } },
    { name: 'interact', joints: { hand_r: { rot: 20 } } }
  ],
  transitions: [ { from: '*', to: 'walk_a', blendMs: 120 }, { from: 'walk_a', to: 'walk_b', blendMs: 120 }, { from: '*', to: 'idle', blendMs: 150 }, { from: '*', to: 'interact', blendMs: 160 } ]
};

describe('JointAnimPure golden', () => {
  test('walk cycle blend', () => {
    let s = createRigState(config);
    s = reduceAnim(s, { type: 'transition', to: 'walk_a' }, config);
    s = reduceAnim(s, { type: 'tick', dtMs: 120 }, config);
    expect(Math.round(s.joints.knee_l.rot)).toBe(10);
    s = reduceAnim(s, { type: 'transition', to: 'walk_b' }, config);
    s = reduceAnim(s, { type: 'tick', dtMs: 120 }, config);
    expect(Math.round(s.joints.knee_r.rot)).toBe(10);
  });

  test('interaction pose', () => {
    let s = createRigState(config);
    s = reduceAnim(s, { type: 'transition', to: 'interact' }, config);
    s = reduceAnim(s, { type: 'tick', dtMs: 160 }, config);
    expect(Math.round(s.joints.hand_r.rot)).toBe(20);
  });
});

