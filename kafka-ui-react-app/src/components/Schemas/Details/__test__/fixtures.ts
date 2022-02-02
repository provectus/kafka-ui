import { SchemaSubject, SchemaType } from 'generated-sources';
import {
  schemaVersion1,
  schemaVersion2,
} from 'redux/reducers/schemas/__test__/fixtures';

export const versionPayload = [schemaVersion1, schemaVersion2];
export const versionEmptyPayload = [];

export const versions = [schemaVersion1, schemaVersion2];

export const jsonSchema: SchemaSubject = {
  subject: 'test',
  version: '15',
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
