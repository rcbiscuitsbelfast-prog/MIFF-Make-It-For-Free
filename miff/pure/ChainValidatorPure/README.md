# ChainValidatorPure

Graph validation and chain analysis for MIFF. Detects cycles, isolated nodes, computes stats, and exports graphs.

## Features

- Add/update/remove nodes and edges
- Validate for cycles and isolated nodes
- Compute degree stats, components, density, and optional topological order
- Export to JSON, YAML, CSV
- CLI harness with envelope output and optional `--format`

## CLI

Run with tsx:

```
tsx cliHarness.ts <op|json-file> [args] [--format json|csv|markdown|html|yaml]
```

Operations:

- create graph.json
- addNode node.json
- updateNode <id> updates.json
- removeNode <id>
- addEdge edge.json
- removeEdge <from> <to>
- get <id>
- list
- validate
- stats
- export [json|yaml|csv]
- dump

All outputs are JSON envelopes: `{ op, status, result, [format], timestamp }`.

## Programmatic

```
import { ChainValidatorManager } from './index';
const mgr = new ChainValidatorManager();
mgr.addNode({ id: 'A', type: 'chain' });
mgr.addNode({ id: 'B', type: 'quest' });
mgr.addEdge({ from: 'A', to: 'B' });
const validation = mgr.validate();
```

