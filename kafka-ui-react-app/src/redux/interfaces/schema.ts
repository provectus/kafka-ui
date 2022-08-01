import {
  CompatibilityLevelCompatibilityEnum,
  NewSchemaSubject,
} from 'generated-sources';

export type SchemaName = string;

export interface NewSchemaSubjectRaw extends NewSchemaSubject {
  subject: string;
  compatibilityLevel: CompatibilityLevelCompatibilityEnum;
  newSchema: string;
}
