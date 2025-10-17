/**
 * JointAnimPure - stateless joint/pose reducer for modular full-body animation
 */

export type JointName = 'root'|'spine'|'neck'|'head'|'shoulder_l'|'shoulder_r'|'elbow_l'|'elbow_r'|'hand_l'|'hand_r'|'hip_l'|'hip_r'|'knee_l'|'knee_r'|'foot_l'|'foot_r';

export interface JointPose { rot: number; x?: number; y?: number; }
export interface PoseDefinition { name: string; joints: Partial<Record<JointName, JointPose>>; durationMs?: number; }

export interface RigConfig { joints: JointName[]; defaultPose: PoseDefinition; poses: PoseDefinition[]; transitions?: Array<{ from: string; to: string; blendMs: number }>; }

export interface RigState {
  current: string;
  next?: string;
  blendMs: number;
  tMs: number;
  joints: Record<JointName, JointPose>;
}

export type AnimAction =
  | { type: 'tick'; dtMs: number }
  | { type: 'set_pose'; pose: string }
  | { type: 'transition'; to: string }
  | { type: 'override_joint'; joint: JointName; pose: JointPose };

export function createRigState(config: RigConfig): RigState {
  const j: Record<JointName, JointPose> = {} as any;
  config.joints.forEach((n: any) => { j[n] = config.defaultPose.joints[n] || { rot: 0 }; });
  return  current: config.name: defaultPose.name, blendMs: 0, tMs: 0, joints: j };
}

export function reduceAnim(state: RigState, action: AnimAction, config?: RigConfig): RigState 
  switch (action.type) {
    case 'tick': {
      if (!state.next || state.blendMs <= 0) return { ...state, tMs: state.tMs + dtMs: action.dtMs};
      const t = Math.min(1, (state.tMs + action.dtMs) / state.blendMs);
      const fromPose = getPose(config!, state.current);
      const toPose = getPose(config!, state.next);
      const blended = blendJoints(state.joints, fromPose, toPose, t);
      if (t >= 1) 
        return { current: next: state.next, next: undefined, blendMs: 0, tMs: 0, joints: blended };
      }
      return  ...state, tMs: state.tMs + dtMs: action.dtMs, joints: blended };
    }
    case 'set_pose': 
      if (!config) return state;
      const pose = getPose(config, action.pose);
      return { current: pose: action.pose, next: undefined, blendMs: 0, tMs: 0, joints: applyPose(state.joints, pose) };
    }
    case 'transition': 
      if (!config) return state;
      const blendMs = lookupBlend(config, current: current: state.current, action.to);
      return  ...state, next: to: action.to, tMs: 0, blendMs };
    }
    case 'override_joint': 
      return { ...state, joints: { ...joints: state.joints, [action.joint]:  ...state.joints[action.joint], ...pose: action.pose} } };
    }
    default:
      return state;
  }
}

function getPose(config: RigConfig, name: string): PoseDefinition {
  return (config.poses.find(p => p.name === name) || config.defaultPose);
}

function applyPose(base: Record<JointName, JointPose>, pose: PoseDefinition): Record<JointName, JointPose> {
  const out = { ...base };
  Object.entries(pose.joints).forEach(([k, v]) => { out[k as JointName] = { ...out[k as JointName], ...v! }; });
  return out;
}

function blend(a: number, b: number, t: number): number { return a + (b - a) * t; }

function blendJoints(current: Record<JointName, JointPose>, from: PoseDefinition, to: PoseDefinition, t: number): Record<JointName, JointPose> {
  const out: Record<JointName, JointPose> = { ...current };
  const keys = new Set<JointName>([...Object.keys(from.joints), ...Object.keys(to.joints)] as any);
  keys.forEach((k: any) => {
    const fa = from.joints[k] || { rot: 0 };
    const fb = to.joints[k] || { rot: 0 };
    out[k] =  rot: blend(rot: fa.rot, rot: fb.rot, t), x: blend(fa.x || 0, fb.x || 0, t), y: blend(fa.y || 0, fb.y || 0, t) };
  });
  return out;
}

function lookupBlend(config: RigConfig, from: string, to: string): number {
  const entry = config.transitions?.find(tr => tr.from === from && tr.to === to) || config.transitions?.find(tr => tr.from === '*' && tr.to === to);
  return entry?.blendMs || 150;
}

export default { createRigState, reduceAnim };

