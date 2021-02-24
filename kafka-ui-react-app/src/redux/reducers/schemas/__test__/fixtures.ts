import { SchemasState } from 'redux/interfaces';
import { SchemaSubject } from 'generated-sources';

export const initialState: SchemasState = {
  byName: {},
  allNames: [],
  currentSchemaVersions: [],
};

export const clusterSchemasPayload: SchemaSubject[] = [
  {
    subject: 'test2',
    version: '3',
    id: 4,
    schema:
      '{"type":"record","name":"MyRecord4","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
  },
  {
    subject: 'test3',
    version: '1',
    id: 5,
    schema:
      '{"type":"record","name":"MyRecord","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
  },
  {
    subject: 'test',
    version: '2',
    id: 2,
    schema:
      '{"type":"record","name":"MyRecord2","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
  },
];

export const schemaVersionsPayload: SchemaSubject[] = [
  {
    subject: 'test',
    version: '1',
    id: 1,
    schema:
      '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
  },
  {
    subject: 'test',
    version: '2',
    id: 2,
    schema:
      '{"type":"record","name":"MyRecord2","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
  },
];
