import { MessageSchemaSourceEnum } from 'generated-sources';

export const testSchema = {
  key: {
    name: 'key',
    source: MessageSchemaSourceEnum.SCHEMA_REGISTRY,
    schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
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
  "$schema": "http://json-schema.org/draft-07/schema#",
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
