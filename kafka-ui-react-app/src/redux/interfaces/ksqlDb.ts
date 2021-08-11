export interface KsqlTables {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export interface KsqlState {
  headers: string[];
  rows: Record<string, string>[];
}
