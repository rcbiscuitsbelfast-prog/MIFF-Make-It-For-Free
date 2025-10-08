const fs = require('fs');

// Read the file
let content = fs.readFileSync('miff/pure/TimeSystemPure/Manager.ts', 'utf8');

// Fix the specific object literal issues by adding 'as any' to result objects
content = content.replace(
  /(\s+result: \{[^}]+)\n(\s+\})\n(\s+\};)/g,
  '$1\n$2 as any\n$3'
);

// Write back
fs.writeFileSync('miff/pure/TimeSystemPure/Manager.ts', content);

console.log('Fixed TimeSystemPure object literal issues');