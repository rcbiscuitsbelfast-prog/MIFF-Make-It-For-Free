// ConvertToWebPure - Convert unified render payloads to Web-friendly data
import { RenderPayload, RenderData, BridgeSchemaValidator } from '../BridgeSchemaPure/schema';

export interface WebConvertedPayload {
  op: 'convert';
  status: 'ok' | 'error';
  engine: 'web';
  items: any[];
  issues: string[];
}

export class ConvertToWebManager {
  convert(payload: RenderPayload): WebConvertedPayload {
    const issues = BridgeSchemaValidator.validateRenderPayload(payload);
    const items = (payload.renderData || []).map((rd: RenderData) => BridgeSchemaValidator.convertToWeb(rd));
    return {
      op: 'convert',
      status: issues.length === 0 ? 'ok' : 'error',
      engine: 'web',
      items,
      issues
    };
  }
}

