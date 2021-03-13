import { SchemaSubject, SchemaType } from 'generated-sources';

export const schemas: SchemaSubject[] = [
  {
    subject: 'test',
    version: '1',
    id: 1,
    schema:
      '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.JSON,
  },
  {
    subject: 'test2',
    version: '1',
    id: 2,
    schema:
      '{"type":"record","name":"MyRecord2","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.JSON,
  },
  {
    subject: 'test3',
    version: '1',
    id: 12,
    schema:
      '{"type":"record","name":"MyRecord3","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.JSON,
  },
];
