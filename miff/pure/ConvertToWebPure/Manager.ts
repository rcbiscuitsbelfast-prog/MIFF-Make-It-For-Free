// ConvertToWebPure - Convert unified render payloads to Web-friendly data
import { BridgeSchemaValidator } from '../BridgeSchemaPure/schema';
import { RenderPayload, RenderData } from '../shared/ConsolidatedSchema';

export interface WebConvertedPayload {
  id?: string;
  name?: string;
  status?: string;
  data?: any;
  result?: any;
  errors?: string[];
  ok?: boolean;
  timestamp?: number;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
  op: 'convert';
  status: 'ok' | 'error';
  engine: 'web';
  items: any[];
  issues: string[];
}

export class ConvertToWebManager {
  convert(): WebConvertedPayload {
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

