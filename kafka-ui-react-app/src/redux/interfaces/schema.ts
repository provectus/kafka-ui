import { SchemaSubject } from 'generated-sources';

export type SchemaName = SchemaSubject['subject'];

export interface SchemasState {
  byName: { [subject: string]: SchemaSubject };
  allNames: SchemaName[];
  currentSchemaVersions: SchemaSubject[];
}
