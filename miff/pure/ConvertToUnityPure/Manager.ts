// ConvertToUnityPure - Convert unified render payloads to Unity-friendly data
import { BridgeSchemaValidator } from '../BridgeSchemaPure/schema';
import { RenderPayload, RenderData } from '../shared/ConsolidatedSchema';

export interface UnityConvertedPayload {
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
  engine: 'unity';
  items: any[];
  issues: string[];
}

export class ConvertToUnityManager {
  convert(): UnityConvertedPayload {
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

