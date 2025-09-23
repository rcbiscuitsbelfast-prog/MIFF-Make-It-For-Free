import React, { useMemo, useRef, useState } from 'react';

type ScenarioId = 'TutorialScenarioPure' | 'SpiritTamerDemoPure';

export function Launcher() {
  const [scenario, setScenario] = useState<ScenarioId>('TutorialScenarioPure');
  const [seed, setSeed] = useState<string>('123');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const godotSrc = useMemo(() => '../docs/godot/export/web/index.html', []);

  function startScenario() {
    const target = iframeRef.current?.contentWindow;
    if (!target) return;
    const message = { type: 'MIFF_START', scenario, seed };
    target.postMessage(message, '*');
  }

  function toggleDebug() {
    const target = iframeRef.current?.contentWindow;
    if (!target) return;
    target.postMessage({ type: 'MIFF_TOGGLE_DEBUG' }, '*');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, padding: 16 }}>
      <div>
        <h2>MIFF Launcher</h2>
        <label>Scenario</label>
        <select value={scenario} onChange={e => setScenario(e.target.value as ScenarioId)}>
          <option value="TutorialScenarioPure">TutorialScenarioPure</option>
          <option value="SpiritTamerDemoPure">SpiritTamerDemoPure</option>
        </select>
        <label style={{ display: 'block', marginTop: 8 }}>Seed</label>
        <input value={seed} onChange={e => setSeed(e.target.value)} />
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={startScenario}>Start</button>
          <button onClick={toggleDebug}>Debug Overlay</button>
        </div>
        <p style={{ fontSize: 12, color: '#666' }}>Posts MIFF_START to embedded Godot export.</p>
      </div>
      <iframe ref={iframeRef} src={godotSrc} title="Godot Export" style={{ width: '100%', height: '80vh', border: '1px solid #ddd' }} />
    </div>
  );
}

export default Launcher;

