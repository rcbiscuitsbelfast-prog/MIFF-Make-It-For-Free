# RenderReplayPure

**Schema Version**: v1  
**Module Type**: Visual Replay & Debugging Tool  
**Dependencies**: BridgeSchemaPure

## Overview

RenderReplayPure is a visual replay and debugging tool for MIFF engine bridges. It provides CLI tools to replay renderData payloads from golden tests, live CLI output, and JSON payloads across all supported engines (Unity, Web, Godot). The tool generates annotated replay logs and supports multiple export formats for contributor review and debugging.

## Features

- **Multi-Source Replay**: Replay from golden tests, CLI output, or JSON payloads
- **Engine Support**: Works with UnityBridgePure, WebBridgePure, and GodotBridgePure
- **Configurable Replay**: Speed control, loop mode, debug overlay, and timestamps
- **Multiple Export Formats**: JSON, Markdown, and HTML reports
- **Annotated Logs**: Detailed step-by-step replay logs with annotations
- **Error Handling**: Graceful handling of invalid inputs and missing files
- **CLI-First Design**: Full command-line interface for automation and CI integration

## CLI Commands

### Basic Usage

```bash
# Replay golden test with Unity engine
npx ts-node RenderReplayPure/cliHarness.ts replay-golden BridgeSchemaPure/sample_render.json --engine unity

# Replay CLI output with Web engine
npx ts-node RenderReplayPure/cliHarness.ts replay-cli web_output.json --engine web --format html

# Replay JSON payload with Godot engine
npx ts-node RenderReplayPure/cliHarness.ts replay-payload godot_payload.json --engine godot --format markdown

# Export replay session
npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay_report.html --format html
```

### Command Reference

#### `replay-golden <test-path>`
Replay renderData from a golden test file.

**Options:**
- `--engine <engine>`: Target engine (unity|web|godot) [default: web]
- `--speed <speed>`: Replay speed multiplier [default: 1.0]
- `--loop`: Enable loop mode
- `--no-debug`: Disable debug overlay
- `--format <format>`: Output format (json|markdown|html) [default: json]
- `--no-timestamp`: Disable timestamps

**Example:**
```bash
npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts \
  --engine unity \
  --speed 2.0 \
  --loop \
  --format html
```

#### `replay-cli <output-file>`
Replay renderData from CLI output file.

**Options:** Same as `replay-golden`

**Example:**
```bash
npx ts-node RenderReplayPure/cliHarness.ts replay-cli web_output.json \
  --engine web \
  --speed 1.0 \
  --format markdown
```

#### `replay-payload <json-file>`
Replay renderData from JSON payload file.

**Options:** Same as `replay-golden`

**Example:**
```bash
npx ts-node RenderReplayPure/cliHarness.ts replay-payload godot_payload.json \
  --engine godot \
  --speed 0.5 \
  --no-debug \
  --format json
```

#### `export <session-id> <output>`
Export replay session to file.

**Options:**
- `--format <format>`: Output format (json|markdown|html) [default: json]

**Example:**
```bash
npx ts-node RenderReplayPure/cliHarness.ts export replay_1234567890 replay_report.html --format html
```

## Usage Examples

### 1. Replay UnityBridgePure Golden Test

```bash
# Replay Unity bridge test with detailed output
npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts \
  --engine unity \
  --speed 1.0 \
  --format html

# Output:
# 🎬 Replaying golden test: UnityBridgePure/tests/goldenBridge.test.ts
# 🎯 Engine: unity
# ⚡ Speed: 1x
# 🔄 Loop: No
# 🐛 Debug: Yes
# 
# ✅ Replay successful!
# 📊 Session ID: replay_1703123456789
# 🎯 Engine: unity
# 📈 Steps: 2
# 🎨 RenderData: 3
# ⚠️ Issues: 0
# ⏱️ Duration: 2000ms
```

### 2. Replay WebBridgePure CLI Output

```bash
# Create sample CLI output
echo '{"op":"render","status":"ok","renderData":[{"id":"test","type":"sprite","position":{"x":100,"y":200}}]}' > web_output.json

# Replay with Web engine
npx ts-node RenderReplayPure/cliHarness.ts replay-cli web_output.json \
  --engine web \
  --speed 2.0 \
  --loop \
  --format markdown

# Output:
# 🎬 Replaying CLI output: web_output.json
# 🎯 Engine: web
# ⚡ Speed: 2x
# 🔄 Loop: Yes
# 🐛 Debug: Yes
# 
# ✅ Replay successful!
# 📊 Session ID: replay_1703123456790
# 🎯 Engine: web
# 📈 Steps: 1
# 🎨 RenderData: 1
# ⚠️ Issues: 0
# ⏱️ Duration: 500ms
```

### 3. Replay GodotBridgePure JSON Payload

```bash
# Create sample payload
cat > godot_payload.json << EOF
{
  "op": "render",
  "status": "ok",
  "renderData": [
    {
      "id": "npc_001",
      "type": "node",
      "name": "Guard Captain Marcus",
      "position": {"x": 640, "y": 960},
      "asset": "npc_sprite.png",
      "engineHints": {
        "godot": {
          "node": "Node2D",
          "script": "NPCController.gd",
          "language": "gdscript"
        }
      }
    }
  ]
}
EOF

# Replay with Godot engine
npx ts-node RenderReplayPure/cliHarness.ts replay-payload godot_payload.json \
  --engine godot \
  --speed 0.5 \
  --no-debug \
  --format json

# Output:
# 🎬 Replaying JSON payload: godot_payload.json
# 🎯 Engine: godot
# ⚡ Speed: 0.5x
# 🔄 Loop: No
# 🐛 Debug: No
# 
# ✅ Replay successful!
# 📊 Session ID: replay_1703123456791
# 🎯 Engine: godot
# 📈 Steps: 1
# 🎨 RenderData: 1
# ⚠️ Issues: 0
# ⏱️ Duration: 2000ms
```

### 4. Export Replay Session

```bash
# Export to HTML report
npx ts-node RenderReplayPure/cliHarness.ts export replay_1703123456789 replay_report.html --format html

# Output:
# 📤 Exporting session: replay_1703123456789
# 📁 Output: replay_report.html
# 📄 Format: html
# ✅ Export successful: replay_report.html
```

## Manager API

### Basic Usage

```typescript
import { RenderReplayManager, ReplayConfig } from './Manager';

// Create replay configuration
const config: ReplayConfig = {
  engine: 'web',
  speed: 1.0,
  loop: false,
  showDebug: true,
  outputFormat: 'json',
  timestamp: true
};

// Create manager instance
const manager = new RenderReplayManager(config);

// Replay from golden test
const result = manager.replayFromGoldenTest('BridgeSchemaPure/sample_render.json');

if (result.status === 'ok') {
  console.log(`Session ID: ${result.session.sessionId}`);
  console.log(`Steps: ${result.session.summary.totalSteps}`);
  console.log(`RenderData: ${result.session.summary.totalRenderData}`);
  
  // Export to file
  const exportResult = manager.exportReplay(result.session, 'replay_report.json');
  if (exportResult.success) {
    console.log('Export successful');
  }
}
```

### Replay from Different Sources

```typescript
// Replay from CLI output
const cliOutput = JSON.stringify({
  op: 'render',
  status: 'ok',
  renderData: [
    {
      id: 'test_sprite',
      type: 'sprite',
      position: { x: 100, y: 200 },
      asset: 'test.png'
    }
  ]
});

const cliResult = manager.replayFromCLIOutput(cliOutput);

// Replay from JSON payload
const payload = {
  op: 'render',
  status: 'ok',
  renderData: [
    {
      id: 'payload_sprite',
      type: 'sprite',
      position: { x: 300, y: 400 },
      asset: 'payload.png'
    }
  ]
};

const payloadResult = manager.replayFromPayload(payload);
```

### Generate Annotated Logs

```typescript
// Generate detailed replay log
const annotatedLog = manager.generateAnnotatedLog(result.session);

console.log(annotatedLog);
// Output:
// # Render Replay Session: replay_1703123456789
// Engine: web
// Steps: 2
// RenderData: 3
// Issues: 0
// Duration: 2000ms
// 
// ## Step 1 (2025-08-22T10:00:00.000Z)
// ### Annotations:
// - Operation: render
// - Status: ok
// - RenderData Count: 1
// - Engine Hints: web
// 
// ### RenderData:
// #### 1. sprite (test_sprite)
// - Position: {"x":100,"y":200}
// - Asset: test.png
```

## Configuration Options

### ReplayConfig Interface

```typescript
interface ReplayConfig {
  engine: 'unity' | 'web' | 'godot';     // Target engine
  speed: number;                         // Replay speed multiplier
  loop: boolean;                         // Whether to loop the replay
  showDebug: boolean;                    // Show debug overlay
  outputFormat: 'json' | 'markdown' | 'html'; // Export format
  timestamp: boolean;                    // Include timestamps
}
```

### Configuration Examples

```typescript
// Fast replay for quick debugging
const fastConfig: ReplayConfig = {
  engine: 'web',
  speed: 5.0,
  loop: true,
  showDebug: false,
  outputFormat: 'json',
  timestamp: false
};

// Detailed replay for thorough analysis
const detailedConfig: ReplayConfig = {
  engine: 'unity',
  speed: 0.5,
  loop: false,
  showDebug: true,
  outputFormat: 'html',
  timestamp: true
};

// Export replay for documentation
const exportConfig: ReplayConfig = {
  engine: 'godot',
  speed: 1.0,
  loop: false,
  showDebug: true,
  outputFormat: 'markdown',
  timestamp: true
};
```

## Output Formats

### JSON Format
```json
{
  "sessionId": "replay_1703123456789",
  "config": {
    "engine": "web",
    "speed": 1.0,
    "loop": false,
    "showDebug": true,
    "outputFormat": "json",
    "timestamp": true
  },
  "steps": [
    {
      "step": 1,
      "timestamp": "2025-08-22T10:00:00.000Z",
      "renderData": [...],
      "issues": [],
      "annotations": [...]
    }
  ],
  "summary": {
    "totalSteps": 1,
    "totalRenderData": 1,
    "totalIssues": 0,
    "duration": "1000ms",
    "engine": "web"
  }
}
```

### Markdown Format
```markdown
# Render Replay Session: replay_1703123456789

Engine: web
Steps: 1
RenderData: 1
Issues: 0
Duration: 1000ms

## Step 1 (2025-08-22T10:00:00.000Z)

### Annotations:
- Operation: render
- Status: ok
- RenderData Count: 1
- Engine Hints: web

### RenderData:
#### 1. sprite (test_sprite)
- Position: {"x":100,"y":200}
- Asset: test.png
```

### HTML Format
```html
<!DOCTYPE html>
<html>
<head>
    <title>Render Replay Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .step { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
        .issue { color: #d32f2f; }
        .annotation { color: #1976d2; }
        .renderdata { background: #f5f5f5; padding: 10px; margin: 5px 0; }
    </style>
</head>
<body>
    <h1>Render Replay Session: replay_1703123456789</h1>
    <p><strong>Engine:</strong> web</p>
    <p><strong>Steps:</strong> 1</p>
    <p><strong>RenderData:</strong> 1</p>
    <p><strong>Issues:</strong> 0</p>
    <p><strong>Duration:</strong> 1000ms</p>
    
    <div class="step">
        <h2>Step 1 (2025-08-22T10:00:00.000Z)</h2>
        <h3>Annotations:</h3>
        <ul>
            <li class="annotation">Operation: render</li>
            <li class="annotation">Status: ok</li>
        </ul>
        <h3>RenderData:</h3>
        <div class="renderdata">
            <h4>1. sprite (test_sprite)</h4>
            <p><strong>Position:</strong> {"x":100,"y":200}</p>
            <p><strong>Asset:</strong> test.png</p>
        </div>
    </div>
</body>
</html>
```

## Remix Hooks

### 1. Custom Replay Configuration

```typescript
// Extend replay configuration for custom engines
export interface CustomReplayConfig extends ReplayConfig {
  customEngine?: string;
  customFeatures?: string[];
  customSpeed?: number;
}

export function createCustomReplayConfig(
  engine: string,
  features: string[],
  speed: number
): CustomReplayConfig {
  return {
    engine: 'web', // Default to web for custom engines
    speed: speed,
    loop: false,
    showDebug: true,
    outputFormat: 'json',
    timestamp: true,
    customEngine: engine,
    customFeatures: features,
    customSpeed: speed
  };
}
```

### 2. Custom Replay Sources

```typescript
// Add custom replay source types
export interface CustomReplaySource {
  type: 'custom';
  data: any;
  format: string;
}

export function replayFromCustomSource(
  manager: RenderReplayManager,
  source: CustomReplaySource
): RenderReplayOutput {
  // Custom replay logic
  const payload = convertCustomSourceToPayload(source);
  return manager.replayFromPayload(payload);
}

function convertCustomSourceToPayload(source: CustomReplaySource): RenderPayload {
  // Convert custom source to standard payload format
  return {
    op: 'render',
    status: 'ok',
    renderData: source.data.renderData || [],
    metadata: {
      schemaVersion: 'v1',
      engine: 'custom',
      timestamp: new Date().toISOString(),
      module: 'custom'
    }
  };
}
```

### 3. Custom Export Formats

```typescript
// Add custom export format
export type CustomOutputFormat = 'csv' | 'xml' | 'yaml';

export function extendExportFormats(
  manager: RenderReplayManager,
  format: CustomOutputFormat
): void {
  // Extend manager with custom export format
  (manager as any).config.outputFormat = format;
  
  // Add custom export logic
  (manager as any).exportReplay = function(session: ReplaySession, outputPath: string) {
    if (format === 'csv') {
      return exportToCSV(session, outputPath);
    } else if (format === 'xml') {
      return exportToXML(session, outputPath);
    } else if (format === 'yaml') {
      return exportToYAML(session, outputPath);
    }
    return { success: false, issues: [`Unsupported format: ${format}`] };
  };
}

function exportToCSV(session: ReplaySession, outputPath: string): { success: boolean; issues?: string[] } {
  try {
    const csvLines = ['Step,Timestamp,RenderData,Issues'];
    session.steps.forEach(step => {
      csvLines.push(`${step.step},${step.timestamp},${step.renderData.length},${step.issues?.length || 0}`);
    });
    
    fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf-8');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      issues: [`CSV export failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}
```

### 4. Custom Annotations

```typescript
// Add custom annotation types
export interface CustomAnnotation {
  type: 'custom';
  key: string;
  value: any;
  priority: number;
}

export function addCustomAnnotations(
  manager: RenderReplayManager,
  annotations: CustomAnnotation[]
): void {
  // Extend annotation generation
  const originalGenerateAnnotations = (manager as any).generateAnnotations;
  
  (manager as any).generateAnnotations = function(payload: RenderPayload, stepIndex: number): string[] {
    const baseAnnotations = originalGenerateAnnotations.call(this, payload, stepIndex);
    const customAnnotations = annotations
      .filter(ann => ann.priority <= 10) // High priority annotations
      .map(ann => `${ann.key}: ${JSON.stringify(ann.value)}`);
    
    return [...baseAnnotations, ...customAnnotations];
  };
}

// Usage example
const customAnnotations: CustomAnnotation[] = [
  {
    type: 'custom',
    key: 'Performance',
    value: { fps: 60, memory: '128MB' },
    priority: 5
  },
  {
    type: 'custom',
    key: 'Debug Info',
    value: { debugLevel: 'verbose', logFile: 'replay.log' },
    priority: 8
  }
];

addCustomAnnotations(manager, customAnnotations);
```

### 5. Custom Validation Rules

```typescript
// Add custom validation for replay sessions
export function validateCustomReplaySession(session: ReplaySession): string[] {
  const issues: string[] = [];
  
  // Custom validation logic
  if (session.summary.totalSteps > 100) {
    issues.push('Session has too many steps (max 100)');
  }
  
  if (session.summary.totalRenderData > 1000) {
    issues.push('Session has too much renderData (max 1000)');
  }
  
  // Validate custom engine configurations
  if (session.config.engine === 'custom' && !session.config.customEngine) {
    issues.push('Custom engine must specify customEngine property');
  }
  
  return issues;
}

// Extend manager with custom validation
export function extendReplayValidation(manager: RenderReplayManager): void {
  const originalReplayFromPayload = manager.replayFromPayload;
  
  manager.replayFromPayload = function(payload: RenderPayload): RenderReplayOutput {
    const result = originalReplayFromPayload.call(this, payload);
    
    if (result.status === 'ok') {
      const customIssues = validateCustomReplaySession(result.session);
      if (customIssues.length > 0) {
        result.issues = [...(result.issues || []), ...customIssues];
      }
    }
    
    return result;
  };
}
```

## Integration Examples

### 1. CI/CD Integration

```yaml
# .github/workflows/replay-tests.yml
name: Replay Tests
on: [push, pull_request]

jobs:
  replay-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run replay tests
        run: |
          # Replay Unity bridge tests
          npx ts-node RenderReplayPure/cliHarness.ts replay-golden UnityBridgePure/tests/goldenBridge.test.ts \
            --engine unity --format html --no-debug
          
          # Replay Web bridge tests
          npx ts-node RenderReplayPure/cliHarness.ts replay-golden WebBridgePure/tests/goldenBridge.test.ts \
            --engine web --format markdown --no-debug
          
          # Replay Godot bridge tests
          npx ts-node RenderReplayPure/cliHarness.ts replay-golden GodotBridgePure/tests/goldenBridge.test.ts \
            --engine godot --format json --no-debug
      
      - name: Upload replay reports
        uses: actions/upload-artifact@v3
        with:
          name: replay-reports
          path: replay_*.html,replay_*.md,replay_*.json
```

### 2. Bridge Integration

```typescript
// In UnityBridgePure/Bridge.ts
import { RenderReplayManager } from '../RenderReplayPure/Manager';

export class UnityBridge {
  private replayManager: RenderReplayManager;
  
  constructor() {
    this.replayManager = new RenderReplayManager({
      engine: 'unity',
      speed: 1.0,
      loop: false,
      showDebug: true,
      outputFormat: 'json',
      timestamp: true
    });
  }
  
  // Add replay capability to bridge
  replayRenderData(payload: RenderPayload): RenderReplayOutput {
    return this.replayManager.replayFromPayload(payload);
  }
  
  // Export replay for debugging
  exportReplayDebug(session: ReplaySession, outputPath: string): boolean {
    const result = this.replayManager.exportReplay(session, outputPath);
    return result.success;
  }
}
```

### 3. Debugging Workflow

```bash
#!/bin/bash
# debug_replay.sh - Debug workflow for replay issues

echo "🔍 Starting replay debug workflow..."

# 1. Run bridge test and capture output
echo "📊 Running bridge test..."
npx ts-node UnityBridgePure/cliHarness.ts simulate npcs > bridge_output.json 2>&1

# 2. Replay the output
echo "🎬 Replaying bridge output..."
npx ts-node RenderReplayPure/cliHarness.ts replay-cli bridge_output.json \
  --engine unity \
  --speed 0.5 \
  --format html

# 3. Generate debug report
echo "📝 Generating debug report..."
npx ts-node RenderReplayPure/cliHarness.ts export replay_$(date +%s) debug_report.html \
  --format html

echo "✅ Debug workflow complete!"
echo "📁 Check debug_report.html for detailed analysis"
```

## Testing

Run golden tests to verify replay functionality:

```bash
npm test -- RenderReplayPure/tests/goldenReplay.test.ts
```

Tests cover:
- CLI command functionality
- Manager API functionality
- Error handling
- Export formats
- Configuration options

## Best Practices

### 1. Use Appropriate Speed Settings
```bash
# Fast debugging
--speed 5.0 --no-debug

# Detailed analysis
--speed 0.5 --show-debug

# Normal review
--speed 1.0 --show-debug
```

### 2. Choose Export Format Based on Use Case
```bash
# For CI/CD automation
--format json

# For documentation
--format markdown

# For visual review
--format html
```

### 3. Handle Large Replays
```bash
# For large replay sessions, use fast mode
--speed 10.0 --no-debug --no-timestamp

# Export to file for later analysis
--format json > large_replay.json
```

### 4. Debug Specific Issues
```bash
# Replay specific step
npx ts-node RenderReplayPure/cliHarness.ts replay-payload step_5.json \
  --engine web --speed 0.1 --show-debug

# Compare replay outputs
diff replay_1.json replay_2.json
```

## License Notes

This replay module is part of the MIFF framework and follows the dual-license model:
- **AGPLv3**: Open source use with attribution
- **Commercial**: Paid license for commercial use without attribution

See `LICENSE.md` for full terms.