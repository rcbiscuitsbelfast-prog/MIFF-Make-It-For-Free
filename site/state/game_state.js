// MIFF Reactive Game State
// Simple pub/sub store for UI ↔ gameplay integration

const subscribers = [];
const state = {
  currentZone: null,
  progress: { value: 0, total: 0, label: '' },
  activeQuest: { title: '', description: '', status: '' },
  inputMode: 'Keyboard'
};

export function getState(){ return { ...state, progress: { ...state.progress }, activeQuest: { ...state.activeQuest } }; }

export function updateState(key, value){
  if (key === 'progress'){
    const next = typeof value === 'object' ? value : { value: Number(value)||0, total: state.progress.total };
    state.progress = { value: Number(next.value)||0, total: Number(next.total)||0, label: next.label || state.progress.label || '' };
  } else if (key === 'activeQuest'){
    const q = value || {};
    state.activeQuest = { title: q.title || '', description: q.description || '', status: q.status || '' };
  } else if (key in state){
    state[key] = value;
  } else if (typeof key === 'object' && key){
    const obj = key;
    Object.keys(obj).forEach(k => updateState(k, obj[k]));
    return;
  }
  subscribers.forEach(cb => { try { cb(getState()); } catch {} });
}

export function subscribe(cb){
  if (typeof cb !== 'function') return () => {};
  subscribers.push(cb);
  try { cb(getState()); } catch {}
  return () => {
    const idx = subscribers.indexOf(cb);
    if (idx >= 0) subscribers.splice(idx, 1);
  };
}

// Attach to window for convenience in demos/tests
try { if (typeof window !== 'undefined') window.gameState = { getState, updateState, subscribe }; } catch {}

