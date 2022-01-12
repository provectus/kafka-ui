import { SchemaType } from 'generated-sources';

export const schemaVersion = {
  subject: 'schema7_1',
  version: '1',
  id: 2,
  schema:
    '{"$schema":"http://json-schema.org/draft-07/schema#","$id":"http://example.com/myURI.schema.json","title":"TestRecord","type":"object","additionalProperties":false,"properties":{"f1":{"type":"integer"},"f2":{"type":"string"},"schema":{"type":"string"}}}',
  compatibilityLevel: 'FULL',
  schemaType: SchemaType.JSON,
};

export const schemasFulfilledState = {
  ids: ['MySchemaSubject', 'schema7_1'],
  entities: {
    MySchemaSubject: {
      subject: 'MySchemaSubject',
      version: '1',
      id: 28,
      schema: '12',
      compatibilityLevel: 'FORWARD_TRANSITIVE',
      schemaType: SchemaType.JSON,
    },
    schema7_1: schemaVersion,
  },
  versions: {
    ids: [],
    entities: {},
  },
};

export const schemasInitialState = {
  ids: [],
  entities: {},
  versions: {
    ids: [],
    entities: {},
  },
};
