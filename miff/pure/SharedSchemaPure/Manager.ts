export type SchemaVersion = 'v12';
export type EntityID = string;
export type StatBlock = { key: string; base: number;
    }[];
export type ZoneRef = { zoneId: string;
    };
export type EquipmentRef = { itemId: string;
    };
export type QuestRef = { questId: string;
    };

export type DumpTypesOutput = {
  op: 'dumpTypes';
  status: 'ok';
  issues: [];
  resolvedRefs: {};
  types: string[];
};

export class SharedSchemaManager {
  version(): SchemaVersion {
    return {
      major: 1,
      minor: 0,
      patch: 0
    };
  }
  
  listTypes(): string[] { 
    return ['EntityID','StatBlock','ZoneRef','EquipmentRef','QuestRef']; 
  }
  
  dumpTypes(): DumpTypesOutput {
    return {
      op: 'dumpTypes',
      status: 'ok',
      issues: [],
      resolvedRefs: {},
      types: this.listTypes(),
    };
  }
}