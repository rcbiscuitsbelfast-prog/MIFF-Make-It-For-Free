// ScenarioPreview.tsx
// Remix-safe UI stub for previewing MIFF scenarios in a React/JSX interface
// Displays scenario metadata (title, tags, subsystems) with placeholder preview logic
// MIT License, Copyright (c) 2025 MIFF Community

import React from 'react';

// Helper type for scenario metadata (mirrors scenario-metadata.json)
interface ScenarioMetadata {
  id: string;
  title: string;
  theme: string;
  subsystems: string[];
  status: 'Complete' | 'Placeholder';
}

// Props for the ScenarioPreview component
interface ScenarioPreviewProps {
  scenarios: ScenarioMetadata[];
  onSelect: (id: string) => void; // Placeholder for runtime selection handling
}

// Main component to list and preview scenarios
const ScenarioPreview: React.FC<ScenarioPreviewProps> = ({ scenarios, onSelect }) => {
  return (
    <div className="scenario-preview">
      <h1>MIFF Scenario Preview</h1>
      <ul className="scenario-list">
        {scenarios.map(scenario => (
          <li key={scenario.id} className="scenario-item">
            <h2>{scenario.title}</h2>
            <p><strong>Theme:</strong> {scenario.theme}</p>
            <p><strong>Subsystems:</strong> {scenario.subsystems.join(', ')}</p>
            <p><strong>Status:</strong> {scenario.status}</p>
            <button onClick={() => onSelect(scenario.id)}>Preview</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Stub component for individual scenario preview
const ScenarioDetail: React.FC<{ scenario: ScenarioMetadata }> = ({ scenario }) => {
  return (
    <div className="scenario-detail">
      <h2>{scenario.title}</h2>
      <p><strong>ID:</strong> {scenario.id}</p>
      <p><strong>Theme:</strong> {scenario.theme}</p>
      <p><strong>Subsystems:</strong> {scenario.subsystems.join(', ')}</p>
      <p><strong>Status:</strong> {scenario.status}</p>
      {/* Placeholder for runtime preview (e.g., dry-run via ScenarioRunnerPure) */}
      <div className="preview-placeholder">
        <p>Preview: {scenario.title} (Simulated via ScenarioRunnerPure)</p>
      </div>
    </div>
  );
};

// Comments for remixers and runtime agents:
// - Fetch metadata from scenario-metadata.json at runtime (e.g., via fetch or import)
// - Use ScenarioLoader.ts to load full scenario modules on preview
// - Integrate with ScenarioRunnerPure.ts for dry-run simulation in preview
// - Style with CSS or framework (e.g., Tailwind) as needed
// - Add interactive elements (e.g., objective list, trigger simulation) for richer previews
// - Ensure accessibility (e.g., ARIA labels, keyboard navigation)
// - Test with complex scenarios like 'mirror-many-paths' or 'labyrinth-unspoken-truths'

export { ScenarioPreview, ScenarioDetail };
export type { ScenarioMetadata };
