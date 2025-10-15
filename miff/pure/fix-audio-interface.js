#!/usr/bin/env node

const fs = require('fs');

function fixAudioInterface() {
  let content = fs.readFileSync('AudioPure/index.ts', 'utf8');
  
  // Find the problematic section and fix it
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip the problematic lines and replace with proper interface
    if (line.includes('sources: AudioSource[];') && i + 1 < lines.length && lines[i + 1] === '') {
      newLines.push(line);
      newLines.push('');
      newLines.push('interface AudioExportConfig {');
      newLines.push('  mixerStrips: AudioMixerStrip[];');
      newLines.push('  masterBus: AudioBus;');
      newLines.push('  exportTime: string;');
      newLines.push('  engineVersion: string;');
      newLines.push('}');
      newLines.push('');
      // Skip the next few lines that are problematic
      i += 6; // Skip the problematic lines
      continue;
    }
    
    newLines.push(line);
  }
  
  fs.writeFileSync('AudioPure/index.ts', newLines.join('\n'), 'utf8');
  console.log('✅ Fixed AudioPure/index.ts interface structure');
}

fixAudioInterface();
