import {
  CompatibilityLevelCompatibilityEnum,
  NewSchemaSubject,
  SchemaSubject,
} from 'generated-sources';

export type SchemaName = string;

export interface SchemasState {
  byName: { [subject: string]: SchemaSubject };
  allNames: SchemaName[];
  currentSchemaVersions: SchemaSubject[];
  globalSchemaCompatibilityLevel?: CompatibilityLevelCompatibilityEnum;
}

export interface NewSchemaSubjectRaw extends NewSchemaSubject {
  subject: string;
}
