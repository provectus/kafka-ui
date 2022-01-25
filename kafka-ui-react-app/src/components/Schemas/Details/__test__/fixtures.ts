import { SchemaSubject, SchemaType } from 'generated-sources';

export const jsonSchema: SchemaSubject = {
  subject: 'test',
  version: '1',
  id: 1,
  schema:
    '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
  compatibilityLevel: 'BACKWARD',
  schemaType: SchemaType.JSON,
};

export const protoSchema: SchemaSubject = {
  subject: 'test_proto',
  version: '1',
  id: 2,
  schema:
    'syntax = "proto3";\npackage com.indeed;\n\nmessage MyRecord {\n  int32 id = 1;\n  string name = 2;\n}\n',
  compatibilityLevel: 'BACKWARD',
  schemaType: SchemaType.PROTOBUF,
};

export const versions: SchemaSubject[] = [
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
    version: '3',
    id: 3,
    schema:
      'syntax = "proto3";\npackage com.indeed;\n\nmessage MyRecord {\n  int32 id = 1;\n  string name = 2;\n}\n',
    compatibilityLevel: 'BACKWARD',
    schemaType: SchemaType.PROTOBUF,
  },
];

export const entityVersions = {
  ids: [3, 2, 1],
  entities: {
    '3': {
      subject: 'test',
      version: '3',
      id: 3,
      schema:
        'syntax = "proto3";\npackage com.indeed;\n\nmessage MyRecord {\n  int32 id = 1;\n  string name = 2;\n}\n',
      compatibilityLevel: 'BACKWARD',
      schemaType: SchemaType.PROTOBUF,
    },
    '2': {
      subject: 'test',
      version: '2',
      id: 2,
      schema:
        '{"type":"record","name":"MyRecord2","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
      compatibilityLevel: 'BACKWARD',
      schemaType: SchemaType.JSON,
    },
    '1': {
      subject: 'test',
      version: '1',
      id: 1,
      schema:
        '{"type":"record","name":"MyRecord1","namespace":"com.mycompany","fields":[{"name":"id","type":"long"}]}',
      compatibilityLevel: 'BACKWARD',
      schemaType: SchemaType.JSON,
    },
  },
};
