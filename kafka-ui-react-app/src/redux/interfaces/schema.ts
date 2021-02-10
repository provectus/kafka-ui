import { SchemaSubject } from 'generated-sources';

export interface Schema extends Partial<SchemaSubject> {
  name: string;
}

export interface SchemasState {
  byName: { [name: string]: Schema };
  allNames: string[];
}
