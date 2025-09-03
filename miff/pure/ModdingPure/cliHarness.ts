#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import { createModdingSystem, ModdingConfig } from './ModdingPure';

function parseArgs(argv: string[]) {
  const [,, cmdOrFile, ...rest] = argv;
  const isCommand = ['init', 'teardown', 'replay', 'export'].includes(cmdOrFile || '');
  const args = isCommand ? rest : [cmdOrFile, ...rest];
  const command = isCommand ? cmdOrFile : 'replay';
  const opts: Record<string, any> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a?.startsWith('--')) {
      const k = a.slice(2);
      const v = args[i+1] && !args[i+1].startsWith('--') ? args[++i] : true;
      opts[k] = v;
    } else if (!opts.input) {
      opts.input = a;
    }
  }
  return { command, opts };
}

interface HarnessInput {
  config?: Partial<ModdingConfig>;
  actions?: Array<
    | { type: 'discover' }
    | { type: 'loadEnabled' }
    | { type: 'bundle'; plugins: string[] }
    | { type: 'export'; template: string; outputPath?: string }
  >;
}

(async function main() {
  const { command, opts } = parseArgs(process.argv);

  try {
    if (command === 'init') {
      process.stdout.write(JSON.stringify({ op: 'init', module: 'ModdingPure', status: 'ok', timestamp: Date.now() }));
      return;
    }
    if (command === 'teardown') {
      process.stdout.write(JSON.stringify({ op: 'teardown', module: 'ModdingPure', status: 'ok', timestamp: Date.now() }));
      return;
    }

    const inputFile = opts.input;
    if (!inputFile) {
      console.error('Usage: ts-node cliHarness.ts replay <input-file> [--config path]');
      process.exit(1);
    }

    const input: HarnessInput = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

    const baseConfig: ModdingConfig = {
      pluginDirectory: './plugins',
      autoLoad: false,
      dependencyResolution: 'strict',
      assetBundling: true,
      hotReload: false,
      maxPlugins: 100
    };

    const config: ModdingConfig = { ...baseConfig, ...input.config } as ModdingConfig;
    const system = createModdingSystem(config);
    await system.initialize();

    const summary: any = {
      op: 'modding_replay',
      status: 'ok',
      system: {
        config
      },
      plugins: undefined as any,
      bundle: undefined as any,
      exportPath: undefined as any
    };

    const actions = input.actions || [
      { type: 'discover' as const },
      { type: 'loadEnabled' as const },
      { type: 'bundle' as const, plugins: ['ui-enhancements'] },
      { type: 'export' as const, template: 'web-html5' }
    ];

    let bundleId: string | undefined;

    for (const action of actions) {
      if (action.type === 'discover') {
        await (system as any).discovery.discoverPlugins();
        summary.plugins = {
          total: (system.getLoadedPlugins?.() || []).length,
          availableTemplates: system.getExportTemplates().map(t => t.id)
        };
      } else if (action.type === 'loadEnabled') {
        await system.loadEnabledPlugins();
        const loaded = system.getLoadedPlugins();
        summary.plugins = {
          total: loaded.length,
          list: loaded.map(p => ({ id: p.id, status: p.status, name: p.manifest.name }))
        };
      } else if (action.type === 'bundle') {
        const bundle = await system.createPluginBundle(action.plugins);
        bundleId = bundle.id;
        summary.bundle = { id: bundle.id, name: bundle.name, assetCount: bundle.assets.size };
      } else if (action.type === 'export') {
        const outputPath = action.outputPath || path.resolve(process.cwd(), 'out');
        const exportPath = await system.exportBundle(bundleId || `bundle-${Date.now()}`, action.template, outputPath);
        summary.exportPath = exportPath;
      }
    }

    process.stdout.write(JSON.stringify(summary));
  } catch (error) {
    console.error(JSON.stringify({ op: 'modding_replay', status: 'error', error: (error as Error)?.message || String(error) }));
    process.exit(1);
  }
})();

