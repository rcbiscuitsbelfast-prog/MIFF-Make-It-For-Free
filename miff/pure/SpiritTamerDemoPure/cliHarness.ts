#!/usr/bin/env -S node --no-warnings
import { spiritTamerDemo, formatOutput } from '../shared/cliHarnessUtils';

function main() {
  const output = spiritTamerDemo();
  console.log(formatOutput(output));
}

if (require.main === module) main();