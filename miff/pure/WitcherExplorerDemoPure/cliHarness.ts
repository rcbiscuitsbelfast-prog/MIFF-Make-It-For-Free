#!/usr/bin/env -S node --no-warnings
import { witcherExplorerDemo, formatOutput } from '../shared/cliHarnessUtils';

function main() {
  const output = witcherExplorerDemo();
  console.log(formatOutput(output));
}

if (require.main === module) main();

