import { UI_STYLES } from './style_presets.js';

let subscribers = [];
let currentKey = (typeof localStorage !== 'undefined' && localStorage.getItem('miff_ui_style')) || 'default';
let currentStyle = UI_STYLES[currentKey] || UI_STYLES.default || {};

export function getCurrentStyle(){
  return currentStyle;
}

export function getCurrentKey(){
  return currentKey;
}

export function setCurrentStyle(input){
  if (typeof input === 'string'){
    currentKey = input;
    if (typeof localStorage !== 'undefined') try { localStorage.setItem('miff_ui_style', currentKey); } catch {}
    currentStyle = UI_STYLES[currentKey] || UI_STYLES.default || {};
  } else if (input && typeof input === 'object'){
    currentKey = 'custom';
    currentStyle = input;
  }
  subscribers.forEach(cb => { try { cb(currentStyle, currentKey); } catch {} });
}

export function subscribe(cb){
  if (typeof cb !== 'function') return () => {};
  subscribers.push(cb);
  return () => { subscribers = subscribers.filter(x => x !== cb); };
}

