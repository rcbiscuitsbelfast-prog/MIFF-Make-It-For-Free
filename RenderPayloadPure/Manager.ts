// RenderPayloadPure - Frame builder for unified render payloads
// Schema Version: v1

import { RenderPayload, RenderData, BridgeSchemaValidator } from '../BridgeSchemaPure/schema';

export interface FrameBuildOptions {
  timestamp?: string;
  engine?: string;
  module?: string;
}

export interface BuildResult {
  op: 'build';
  status: 'ok' | 'error';
  payload: RenderPayload;
  issues: string[];
}

export class RenderPayloadBuilder {
  private renderData: RenderData[] = [];

  addNode(node: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...node, type: 'node' as const });
    return this;
  }

  addSprite(sprite: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...sprite, type: 'sprite' as const });
    return this;
  }

  addText(text: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...text, type: 'text' as const });
    return this;
  }

  addAnimation(animation: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...animation, type: 'animation' as const });
    return this;
  }

  addSound(sound: Omit<RenderData, 'type'> & { type?: never }): this {
    this.renderData.push({ ...sound, type: 'sound' as const });
    return this;
  }

  addAny(data: RenderData): this {
    this.renderData.push(data);
    return this;
  }

  clear(): this {
    this.renderData = [];
    return this;
  }

  build(options: FrameBuildOptions = {}): BuildResult {
    const payload: RenderPayload = {
      op: 'render',
      status: 'ok',
      renderData: [...this.renderData],
      metadata: {
        schemaVersion: 'v1',
        engine: options.engine || 'unified',
        timestamp: options.timestamp || new Date().toISOString(),
        module: options.module || 'generic'
      }
    };

    const issues = BridgeSchemaValidator.validateRenderPayload(payload);
    const status: 'ok' | 'error' = issues.length === 0 ? 'ok' : 'error';
    return { op: 'build', status, payload, issues };
  }
}

export function createSampleFrame(): RenderPayload {
  const builder = new RenderPayloadBuilder();

  builder
    .addNode({
      id: 'npc_001',
      name: 'Guard Captain Marcus',
      position: { x: 640, y: 960, z: 0 },
      props: { npc_id: 'npc_001', has_quests: true },
      children: [
        {
          id: 'npc_001_sprite',
          type: 'sprite',
          position: { x: 0, y: 0, z: 0 },
          asset: 'npc_sprite.png',
          props: { texture: 'npc_sprite.png' }
        },
        {
          id: 'npc_001_title',
          type: 'text',
          position: { x: 0, y: -24, z: 0 },
          props: { text: 'Marcus', color: '#ffe08a' }
        }
      ],
      signals: [
        { name: 'npc_interacted', parameters: ['player_id'], connectedTo: ['QuestSystem'] }
      ]
    })
    .addAnimation({
      id: 'ambient_smoke',
      name: 'AmbientSmoke',
      position: { x: 620, y: 980 },
      props: { loop: true, frames: 16 }
    })
    .addSound({
      id: 'town_theme',
      name: 'TownTheme',
      props: { volume: 0.6, loop: true },
      asset: 'town_theme.mp3'
    })
    .addNode({
      id: 'ui_overlay',
      name: 'UIOverlay',
      position: { x: 10, y: 10 },
      scale: { x: 300, y: 60 },
      props: { ui_type: 'overlay' },
      children: [
        {
          id: 'ui_gold_text',
          type: 'text',
          position: { x: 0, y: 0 },
          props: { text: 'Gold: 123', font_size: 16, color: '#ffffff' }
        }
      ]
    });

  return builder.build({ module: 'render_payload_pure' }).payload;
}

