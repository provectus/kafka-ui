import { SchemaSubject } from 'generated-sources';

export interface SchemasState {
  byName: { [name: string]: SchemaSubject };
  allNames: string[];
}
