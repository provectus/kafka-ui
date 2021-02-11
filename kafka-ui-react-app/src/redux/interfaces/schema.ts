import { SchemaSubject } from 'generated-sources';

export interface SchemasState {
  byName: { [subject: string]: SchemaSubject };
  allNames: string[];
}
