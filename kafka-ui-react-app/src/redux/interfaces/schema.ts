import { NewSchemaSubject, SchemaSubject } from 'generated-sources';

export type SchemaName = string;

export interface SchemasState {
  byName: { [subject: string]: SchemaSubject };
  allNames: SchemaName[];
  currentSchemaVersions: SchemaSubject[];
}

export interface NewSchemaSubjectRaw extends NewSchemaSubject {
  subject: string;
}
