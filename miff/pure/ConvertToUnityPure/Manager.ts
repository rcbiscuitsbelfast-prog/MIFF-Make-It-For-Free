// ConvertToUnityPure - Convert unified render payloads to Unity-friendly data
import { RenderPayload, RenderData, BridgeSchemaValidator } from '../BridgeSchemaPure/schema';

export interface UnityConvertedPayload {
  op: 'convert';
  status: 'ok' | 'error';
  engine: 'unity';
  items: any[];
  issues: string[];
}

export class ConvertToUnityManager {
  convert(payload: RenderPayload): UnityConvertedPayload {
    const issues = BridgeSchemaValidator.validateRenderPayload(payload);
    const items = (payload.renderData || []).map((rd: RenderData) => BridgeSchemaValidator.convertToUnity(rd));
    return {
      op: 'convert',
      status: issues.length === 0 ? 'ok' : 'error',
      engine: 'unity',
      items,
      issues
    };
  }
}

