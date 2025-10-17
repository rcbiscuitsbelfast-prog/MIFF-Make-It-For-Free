/**
 * ChainValidatorPure - Graph Validation and Chain Analysis
 *
 * Provides a lightweight, pure TypeScript graph manager focused on validating
 * dependency chains, detecting cycles, computing statistics, and exporting
 * graph data in multiple formats.
 *
 * @module ChainValidatorPure
 * @version 1.0.0
 * @license MIT
 */

export type ChainNodeType = 'chain' | 'quest' | 'task' | 'event' | 'checkpoint' | 'generic';

export interface ChainNode {
  id: string;
  type: ChainNodeType;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChainEdge {
  from: string;
  to: string;
  kind?: 'requires' | 'unlocks' | 'depends' | 'follows' | 'generic';
  metadata?: Record<string, any>;
}

export interface ValidationIssue {
  code: string;
  message: string;
  nodeId?: string;
  edge?: { from: string; to: string };
}

export interface ValidationResultEnvelope {
  op: 'validate';
  status: 'ok' | 'error' | 'warning';
  result: {
    isValid: boolean;
    issues: ValidationIssue[];
    warnings: string[];
    summary: {
      nodes: number;
      edges: number;
      cycles: number;
      isolatedNodes: number;
    }
  };
}

export interface StatsEnvelope {
  op: 'stats';
  status: 'ok';
  result: {
    nodes: number;
    edges: number;
    density: number;
    inDegree: { min: number; max: number; average: number };
    outDegree: { min: number; max: number; average: number };
    components: number;
    cycles: number;
    topologicalOrder?: string[] | null;
  };
}

export interface ExportEnvelope {
  op: 'export';
  status: 'ok';
  format: 'json' | 'yaml' | 'csv';
  result: any;
}

export class ChainValidatorManager {
  private nodes = new Map<string, ChainNode>();
  private adjacency = new Map<string, Set<string>>();
  private reverseAdjacency = new Map<string, Set<string>>();

  // CRUD: Nodes
  addNode(node: ChainNode): { op: 'addNode'; status: 'ok' | 'error'; node?: ChainNode; issues?: string[] } {
    const issues: string[] = [];
    if (!node.id || typeof node.id !== 'string') {
      issues.push('Node id must be a non-empty string');
    }
    if (this.nodes.has(node.id)) {
      issues.push(`Node already exists: ${node.id}`);
    }
    if (issues.length > 0) {
      return { op: 'addNode', status: 'error', issues } as any;
    }
    const normalized: ChainNode = { ...node, id: node.id.trim(), type: (node.type ?? 'generic') as ChainNodeType };
    this.nodes.set(normalized.id, normalized);
    if (!this.adjacency.has(normalized.id)) this.adjacency.set(normalized.id, new Set());
    if (!this.reverseAdjacency.has(normalized.id)) this.reverseAdjacency.set(normalized.id, new Set());
    return { op: 'addNode', status: 'ok', node: { ...normalized } } as any;
  }

  updateNode(id: string, updates: Partial<Omit<ChainNode, 'id'>>): { op: 'updateNode'; status: 'ok' | 'error'; node?: ChainNode; issues?: string[] } {
    const issues: string[] = [];
    const existing = this.nodes.get(id);
    if (!existing) {
      issues.push(`Node not found: ${id}`);
      return { op: 'updateNode', status: 'error', issues } as any;
    }
    const updated: ChainNode = { ...existing, ...updates };
    this.nodes.set(id, updated);
    return { op: 'updateNode', status: 'ok', node: { ...updated } } as any;
  }

  removeNode(id: string): { op: 'removeNode'; status: 'ok' | 'error'; removed?: ChainNode; issues?: string[] } {
    const issues: string[] = [];
    const existing = this.nodes.get(id);
    if (!existing) {
      issues.push(`Node not found: ${id}`);
      return { op: 'removeNode', status: 'error', issues } as any;
    }
    // Remove edges
    const outgoing = this.adjacency.get(id) || new Set();
    const incoming = this.reverseAdjacency.get(id) || new Set();
    for (const to of outgoing) this.reverseAdjacency.get(to)?.delete(id);
    for (const from of incoming) this.adjacency.get(from)?.delete(id);
    this.adjacency.delete(id);
    this.reverseAdjacency.delete(id);
    this.nodes.delete(id);
    return { op: 'removeNode', status: 'ok', removed: { ...existing } } as any;
  }

  // CRUD: Edges
  addEdge(edge: ChainEdge): { op: 'addEdge'; status: 'ok' | 'error'; edge?: ChainEdge; issues?: string[] } {
    const issues: string[] = [];
    if (!edge.from || !edge.to) issues.push('Edge must have from and to');
    if (!this.nodes.has(edge.from)) issues.push(`Missing node: ${edge.from}`);
    if (!this.nodes.has(edge.to)) issues.push(`Missing node: ${edge.to}`);
    if (edge.from === edge.to) issues.push('Self-loop edges are not allowed');

    const existingSet = this.adjacency.get(edge.from) || new Set();
    if (existingSet.has(edge.to)) issues.push(`Duplicate edge: ${edge.from} -> ${edge.to}`);

    if (issues.length > 0) return { op: 'addEdge', status: 'error', issues } as any;

    if (!this.adjacency.has(edge.from)) this.adjacency.set(edge.from, new Set());
    if (!this.reverseAdjacency.has(edge.to)) this.reverseAdjacency.set(edge.to, new Set());
    this.adjacency.get(edge.from)!.add(edge.to);
    this.reverseAdjacency.get(edge.to)!.add(edge.from);
    return { op: 'addEdge', status: 'ok', edge: { ...edge } } as any;
  }

  removeEdge(from: string, to: string): { op: 'removeEdge'; status: 'ok' | 'error'; removed?: { from: string; to: string }; issues?: string[] } {
    const issues: string[] = [];
    if (!this.adjacency.get(from)?.has(to)) issues.push(`Edge not found: ${from} -> ${to}`);
    if (issues.length > 0) return { op: 'removeEdge', status: 'error', issues } as any;
    this.adjacency.get(from)!.delete(to);
    this.reverseAdjacency.get(to)!.delete(from);
    return { op: 'removeEdge', status: 'ok', removed: { from, to } } as any;
  }

  // Queries
  getNode(id: string): ChainNode | null {
    const n = this.nodes.get(id);
    return n ? { ...n } : null;
  }

  listNodes(): ChainNode[] {
    return Array.from(this.nodes.values()).map((n: any) => ({ ...n }));
  }

  listEdges(): ChainEdge[] {
    const edges: ChainEdge[] = [];
    for (const [from, tos] of this.adjacency.entries()) {
      for (const to of tos) edges.push({ from, to, kind: 'generic' });
    }
    return edges;
  }

  // Validation
  validate(): ValidationResultEnvelope {
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];

    // Detect orphans
    const isolatedNodes = this.listIsolatedNodes();
    for (const id of isolatedNodes) {
      warnings.push(`Isolated node: ${id}`);
    }

    // Detect duplicates handled on add

    // Detect missing references handled on add

    // Detect cycles
    const cycles = this.findCycles();
    for (const cycle of cycles) {
      issues.push({ code: 'cycle', message: `Cycle detected: ${cycle.join(' -> ')} -> ${cycle[0]}` });
    }

    const status: 'ok' | 'error' | 'warning' = issues.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ok';

    return {
      op: 'validate',
      status,
      result: {
        isValid: issues.length === 0,
        issues,
        warnings,
        summary: {
          nodes: this.nodes.size,
          edges: this.listEdges().length,
          cycles: cycles.length,
          isolatedNodes: isolatedNodes.length
        }
      }
    };
  }

  // Stats
  getStats(): StatsEnvelope {
    const nodes = this.nodes.size;
    const edges = this.listEdges().length;
    const density = nodes > 1 ? edges / (nodes * (nodes - 1)) : 0;
    const inDegs: number[] = [];
    const outDegs: number[] = [];
    for (const id of this.nodes.keys()) {
      inDegs.push(this.reverseAdjacency.get(id)?.size || 0);
      outDegs.push(this.adjacency.get(id)?.size || 0);
    }
    const inStats = this.statsFromArray(inDegs);
    const outStats = this.statsFromArray(outDegs);
    const components = this.countConnectedComponents();
    const cycles = this.findCycles().length;
    const topo = this.topologicalSort();
    return {
      op: 'stats',
      status: 'ok',
      result: {
        nodes,
        edges,
        density: Math.round(density * 1e6) / 1e6,
        inDegree: inStats,
        outDegree: outStats,
        components,
        cycles,
        topologicalOrder: topo.ok ? topo.order : null
      }
    };
  }

  // Export
  exportGraph(format: 'json' | 'yaml' | 'csv' = 'json'): ExportEnvelope {
    const payload = {
      nodes: this.listNodes(),
      edges: this.listEdges(),
      stats: this.getStats().result,
      exportedAt: Date.now().toISOString(),
      version: '1.0.0'
    };
    switch (format) {
      case 'json':
        return { op: 'export', status: 'ok', format, result: payload };
      case 'yaml':
        return { op: 'export', status: 'ok', format, result: this.toYAML(payload) };
      case 'csv':
        return { op: 'export', status: 'ok', format, result: this.toCSV(payload) };
      default:
        return { op: 'export', status: 'ok', format: 'json', result: payload };
    }
  }

  // Utilities
  private listIsolatedNodes(): string[] {
    const isolated: string[] = [];
    for (const id of this.nodes.keys()) {
      const indeg = this.reverseAdjacency.get(id)?.size || 0;
      const outdeg = this.adjacency.get(id)?.size || 0;
      if (indeg === 0 && outdeg === 0) isolated.push(id);
    }
    return isolated;
  }

  private findCycles(): string[][] {
    const color = new Map<string, 0 | 1 | 2>(); // 0=unvisited,1=visiting,2=visited
    const parent = new Map<string, string | null>();
    const cycles: string[][] = [];

    const dfs = (u: string) => {
      color.set(u, 1);
      for (const v of this.adjacency.get(u) || []) {
        if (!color.has(v)) {
          parent.set(v, u);
          dfs(v);
        } else if (color.get(v) === 1) {
          // found back edge, reconstruct cycle
          const cycle: string[] = [v!];
          let x: string | null = u;
          while (x && x !== v) {
            cycle.push(x);
            x = parent.get(x) || null;
          }
          cycle.push(v);
          cycle.reverse();
          // normalize cycle start for deduplication
          const norm = this.normalizeCycle(cycle);
          if (!this.cycleExists(cycles, norm)) cycles.push(norm);
        }
      }
      color.set(u, 2);
    };

    for (const id of this.nodes.keys()) {
      if (!color.has(id)) {
        parent.set(id, null);
        dfs(id);
      }
    }
    return cycles;
  }

  private normalizeCycle(cycle: string[]): string[] {
    if (cycle.length === 0) return cycle;
    // rotate so smallest id lexicographically is first
    const body = cycle.slice(0, -1); // last equals first
    let minIdx = 0;
    for (let i = 1; i < body.length; i++) if (body[i!] < body[minIdx!]) minIdx = i;
    const rotated = [...body.slice(minIdx), ...body.slice(0, minIdx), body[minIdx!]];
    return rotated;
  }

  private cycleExists(bag: string[][], cycle: string[]): boolean {
    return bag.some(c => c.length === cycle.length && c.every((id, i) => id === cycle[i!]));
  }

  private topologicalSort(): { ok: boolean; order?: string[] } {
    const indeg = new Map<string, number>();
    for (const id of this.nodes.keys()) indeg.set(id, 0);
    for (const [u, vs] of this.adjacency.entries()) for (const v of vs) indeg.set(v, (indeg.get(v) || 0) + 1);
    const queue: string[] = Array.from(indeg.entries()).filter(([, d]) => d === 0).map(([id]) => id);
    const order: string[] = [];
    const indegMutable = new Map(indeg);
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      for (const v of this.adjacency.get(u) || []) {
        const d = (indegMutable.get(v) || 0) - 1;
        indegMutable.set(v, d);
        if (d === 0) queue.push(v);
      }
    }
    const ok = order.length === this.nodes.size;
    return ok ? { ok: true, order } : { ok: false };
  }

  private countConnectedComponents(): number {
    const visited = new Set<string>();
    let components = 0;
    const undirected = new Map<string, Set<string>>();
    for (const id of this.nodes.keys()) undirected.set(id, new Set());
    for (const [u, vs] of this.adjacency.entries()) {
      for (const v of vs) {
        undirected.get(u)!.add(v);
        undirected.get(v)!.add(u);
      }
    }
    const dfs = (u: string) => {
      visited.add(u);
      for (const v of undirected.get(u) || []) if (!visited.has(v)) dfs(v);
    };
    for (const id of this.nodes.keys()) if (!visited.has(id)) {
      components++;
      dfs(id);
    }
    return components;
  }

  private statsFromArray(values: number[]): { min: number; max: number; average: number } {
    if (values.length === 0) return { min: 0, max: 0, average: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, average: Math.round(avg * 1e6) / 1e6 };
  }

  private toYAML(payload: any): string {
    // Simple YAML emitter sufficient for golden tests; not a full serializer
    const esc = (s: string) => s.replace(/"/g, '\\"');
    const lines: string[] = [];
    lines.push('nodes:');
    for (const n of payload.nodes) {
      lines.push(`  - id: "${esc(n.id)}"`);
      lines.push(`    type: "${esc(n.type)}"`);
      if (n.label) lines.push(`    label: "${esc(n.label)}"`);
    }
    lines.push('edges:');
    for (const e of payload.edges) {
      lines.push(`  - from: "${esc(e.from)}"`);
      lines.push(`    to: "${esc(e.to)}"`);
    }
    lines.push('stats:');
    lines.push(`  nodes: ${payload.stats.nodes}`);
    lines.push(`  edges: ${payload.stats.edges}`);
    lines.push(`  cycles: ${payload.stats.cycles}`);
    lines.push(`  components: ${payload.stats.components}`);
    lines.push(`exportedAt: "${esc(payload.exportedAt)}"`);
    lines.push(`version: "${esc(payload.version)}"`);
    return lines.join('\n');
  }

  private toCSV(payload: any): string {
    const nodeRows = ['type,id,label'];
    for (const n of payload.nodes) nodeRows.push(`${n.type},${n.id},${(n.label || '').replace(/,/g, ';')}`);
    const edgeRows = ['from,to'];
    for (const e of payload.edges) edgeRows.push(`${e.from},${e.to}`);
    return ['[nodes!]', ...nodeRows, '', '[edges!]', ...edgeRows, '', '[stats!]', `nodes,${payload.stats.nodes}`, `edges,${payload.stats.edges}`, `cycles,${payload.stats.cycles}`, `components,${payload.stats.components}`].join('\n');
  }
}

export default ChainValidatorManager;

