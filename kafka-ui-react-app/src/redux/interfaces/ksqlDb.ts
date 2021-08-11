export interface KsqlTables {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export interface KsqlState {
  tables: Record<string, string>[];
  streams: Record<string, string>[];
}
