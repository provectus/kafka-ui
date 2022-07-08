import { SchemaType, SchemaSubject } from 'generated-sources';
import { RootState } from 'redux/interfaces';

export const schemasInitialState: RootState['schemas'] = {
  totalPages: 0,
  ids: [],
  entities: {},
  versions: {
    latest: null,
    ids: [],
    entities: {},
  },
};

export const schemaVersion1: SchemaSubject = {
  subject: 'schema7_1',
  version: '1',
  id: 2,
  schema:
    '{"$schema":"http://json-schema.org/draft-07/schema#","$id":"http://example.com/myURI.schema.json","title":"TestRecord","type":"object","additionalProperties":false,"properties":{"f1":{"type":"integer"},"f2":{"type":"string"},"schema":{"type":"string"}}}',
  compatibilityLevel: 'FULL',
  schemaType: SchemaType.JSON,
};
export const schemaVersion2: SchemaSubject = {
  subject: 'MySchemaSubject',
  version: '2',
  id: 28,
  schema: '12',
  compatibilityLevel: 'FORWARD_TRANSITIVE',
  schemaType: SchemaType.JSON,
};

export { schemaVersion1 as schemaVersion };

export const schemasFulfilledState = {
  totalPages: 1,
  ids: [schemaVersion2.subject, schemaVersion1.subject],
  entities: {
    [schemaVersion2.subject]: schemaVersion2,
    [schemaVersion1.subject]: schemaVersion1,
  },
  versions: {
    latest: null,
    ids: [],
    entities: {},
  },
};

export const versionFulfilledState = {
  totalPages: 1,
  ids: [],
  entities: {},
  versions: {
    latest: schemaVersion2,
    ids: [schemaVersion1.id, schemaVersion2.id],
    entities: {
      [schemaVersion2.id]: schemaVersion2,
      [schemaVersion1.id]: schemaVersion1,
    },
  },
};
