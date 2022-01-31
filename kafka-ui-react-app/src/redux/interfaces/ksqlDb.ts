import { KsqlCommandV2Response } from 'generated-sources';

export interface KsqlTables {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export interface KsqlState {
  tables: Dictionary<string>[];
  streams: Dictionary<string>[];
  executionResult: KsqlCommandV2Response | null;
}
