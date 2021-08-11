export interface KsqlTables {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export interface KsqlState {
  tables: Dictionary<string>[];
  streams: Dictionary<string>[];
}
