import { MessageSchemaSourceEnum } from 'generated-sources';

export const testSchema = {
  key: {
    name: 'key',
    source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "http://example.com/myURI.schema.json",
  "title": "TestRecord",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "f1": {
      "type": "integer"
    },
    "f2": {
      "type": "string"
    },
    "schema": {
      "type": "string"
    }
  }
}
`,
  },
  value: {
    name: 'value',
    source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
    schema: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "http://example.com/myURI1.schema.json",
  "title": "TestRecord",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "f1": {
      "type": "integer"
    },
    "f2": {
      "type": "string"
    },
    "schema": {
      "type": "string"
    }
  }
}
`,
  },
};
