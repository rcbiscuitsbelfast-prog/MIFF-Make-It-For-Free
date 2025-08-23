// ConvertToGodotPure - Convert unified render payloads to Godot-friendly data
import { RenderPayload, RenderData, BridgeSchemaValidator } from '../BridgeSchemaPure/schema';

export interface GodotConvertedPayload {
  op: 'convert';
  status: 'ok' | 'error';
  engine: 'godot';
  items: any[];
  issues: string[];
}

export class ConvertToGodotManager {
  convert(payload: RenderPayload): GodotConvertedPayload {
    const issues = BridgeSchemaValidator.validateRenderPayload(payload);
    const items = (payload.renderData || []).map((rd: RenderData) => BridgeSchemaValidator.convertToGodot(rd));
    return {
      op: 'convert',
      status: issues.length === 0 ? 'ok' : 'error',
      engine: 'godot',
      items,
      issues
    };
  }
}

