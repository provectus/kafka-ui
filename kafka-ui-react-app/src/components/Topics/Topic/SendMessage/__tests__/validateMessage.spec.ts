import validateMessage from 'components/Topics/Topic/SendMessage/validateMessage';
import { MessageSchemaSourceEnum } from 'generated-sources';

describe('validateMessage', () => {
  it('returns true on correct input data', async () => {
    const mockSetError = jest.fn();
    expect(
      await validateMessage(
        `{
      "f1": 32,
      "f2": "multi-state",
      "schema": "Bedfordshire violet SAS"
    }`,
        `{
      "f1": 21128,
      "f2": "Health Berkshire Re-engineered",
      "schema": "Dynamic Greenland Beauty"
    }`,
        {
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
        },
        mockSetError
      )
    ).toBe(true);
    expect(mockSetError).toHaveBeenCalledTimes(1);
  });

  it('returns flse on incorrect input data', async () => {
    const mockSetError = jest.fn();
    expect(
      await validateMessage(
        `{
      "f1": "32",
      "f2": "multi-state",
      "schema": "Bedfordshire violet SAS"
    }`,
        `{
      "f1": "21128",
      "f2": "Health Berkshire Re-engineered",
      "schema": "Dynamic Greenland Beauty"
    }`,
        {
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
        },
        mockSetError
      )
    ).toBe(false);
    expect(mockSetError).toHaveBeenCalledTimes(3);
  });
});
