import React, { useEffect, useMemo, useRef, useState } from 'react';
import { prewarmAssets } from './prewarm';

type ScenarioInfo = { id: string; name: string; fixture?: string; sitePath?: string };

export function Launcher() {
  const [scenarios, setScenarios] = useState<ScenarioInfo[]>([]);
  const [scenarioId, setScenarioId] = useState<string>('');
  const [seed, setSeed] = useState<string>('123');
  const [recording, setRecording] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const godotSrc = useMemo(() => '../docs/godot/export/web/index.html', []);

  useEffect(() => {
    fetch('../docs/archive/scenarios/scenario_registry.json')
      .then(r => r.json())
      .then((j) => {
        const list = Array.isArray(j?.scenarios) ? j.scenarios : [];
        setScenarios(list);
        if (list.length) setScenarioId(list[0].id);
      })
      .catch(() => {
        setScenarios([]);
      });
  }, []);

  function post(message: any) {
    const target = iframeRef.current?.contentWindow;
    if (!target) return;
    target.postMessage(message, '*');
  }

  function startScenario() {
    const meta = scenarios.find(s => s.id === scenarioId);
    post({
      type: 'MIFF_START',
      scenario: meta?.id,
      seed,
      sitePath: meta?.sitePath,
      fixture: meta?.fixture,
      modules: {
        touch: true,
        haptics: true,
        permissions: true,
      },
    });
    prewarmAssets([
      '/assets/sprites/npcs.png',
      '/assets/sprites/ui.png',
      '/assets/audio/click.ogg'
    ]);
  }

  function toggleDebug() {
    post({ type: 'MIFF_TOGGLE_DEBUG' });
  }

  function startRecord() {
    setRecording(true);
    post({ type: 'MIFF_RECORD_START' });
  }

  function stopRecord() {
    setRecording(false);
    post({ type: 'MIFF_RECORD_STOP' });
  }

  function replay() {
    post({ type: 'MIFF_REPLAY_START', seed, scenario: scenarioId });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, padding: 16 }}>
      <div>
        <h2>MIFF Launcher</h2>
        <label>Scenario</label>
        <select value={scenarioId} onChange={e => setScenarioId(e.target.value)}>
          {scenarios.map(s => (
            <option key={s.id} value={s.id}>{s.name || s.id}</option>
          ))}
        </select>
        <label style={{ display: 'block', marginTop: 8 }}>Seed</label>
        <input value={seed} onChange={e => setSeed(e.target.value)} />
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button onClick={startScenario}>Start</button>
          <button onClick={toggleDebug}>Debug Overlay</button>
          {!recording ? (
            <button onClick={startRecord}>Record</button>
          ) : (
            <button onClick={stopRecord}>Stop</button>
          )}
          <button onClick={replay}>Replay</button>
        </div>
        <div style={{ marginTop: 12, padding: 8, border: '1px solid #eee', borderRadius: 4 }}>
          <strong>HUD</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => post({ type: 'MIFF_INPUT', input: 'tap' })}>Tap</button>
            <button onClick={() => post({ type: 'MIFF_INPUT', input: 'doubleTap' })}>Double Tap</button>
            <button onClick={() => post({ type: 'MIFF_INPUT', input: 'longPress' })}>Long Press</button>
            <button onClick={() => post({ type: 'MIFF_INPUT', input: 'swipe', dir: 'right' })}>Swipe →</button>
            <button onClick={() => post({ type: 'MIFF_INPUT', input: 'pinch', scale: 0.9 })}>Pinch</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={() => post({ type: 'MIFF_EVENT', name: 'questUpdate' })}>Quest Update</button>
            <button onClick={() => post({ type: 'MIFF_EVENT', name: 'hit' })}>Hit</button>
            <button onClick={() => post({ type: 'MIFF_EVENT', name: 'loot' })}>Loot</button>
          </div>
        </div>
      </div>
      <iframe ref={iframeRef} src={godotSrc} title="Godot Export" style={{ width: '100%', height: '80vh', border: '1px solid #ddd' }} />
    </div>
  );
}

export default Launcher;

