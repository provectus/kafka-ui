import { SchemaSubject, SchemaType } from 'generated-sources';

export const versions: SchemaSubject[] = [
  {
    subject: 'test',
    version: '3',
    id: 3,
    schema:
      'syntax = "proto3";\npackage com.indeed;\n\nmessage MyRecord {\n  int32 id = 1;\n  string name = 2;\n}\n',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.PROTOBUF,
  },
  {
    subject: 'test',
    version: '2',
    id: 2,
    schema:
      '{"type":"record","name":"MyRecord2","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.JSON,
  },
  {
    subject: 'test',
    version: '1',
    id: 1,
    schema:
      '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.JSON,
  },
];
