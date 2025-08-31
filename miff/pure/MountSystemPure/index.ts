// MountSystemPure - mount/dismount entities

export type MountState = { mounted: Record<string,string|undefined> };
export type MountEvent = { type:'mount'|'dismount'; rider: string; mount?: string };

export function applyMount(state: MountState, events: MountEvent[]): { op:'mount'; status:'ok'; state: MountState }{
  const m = { ...state.mounted };
  for(const e of events){
    if(e.type==='mount' && e.mount) m[e.rider] = e.mount;
    else if(e.type==='dismount') m[e.rider] = undefined;
  }
  return { op:'mount', status:'ok', state: { mounted: m } };
}

