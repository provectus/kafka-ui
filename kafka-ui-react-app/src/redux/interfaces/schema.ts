import { SchemaSubject } from 'generated-sources';

export type SchemaName = string;

export interface SchemasState {
  byName: { [subject: string]: SchemaSubject };
  allNames: SchemaName[];
  currentSchemaVersions: SchemaSubject[];
}
