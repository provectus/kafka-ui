import {
  KsqlCommandV2Response,
  KsqlStreamDescription,
  KsqlTableDescription,
} from 'generated-sources';

export interface KsqlState {
  tables: KsqlTableDescription[];
  streams: KsqlStreamDescription[];
  executionResult: KsqlCommandV2Response | null;
}

export interface KsqlDescription {
  name?: string;
  topic?: string;
  keyFormat?: string;
  valueFormat?: string;
  isWindowed?: boolean;
}
