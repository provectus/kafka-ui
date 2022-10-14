import { TopicSerdeSuggestion } from 'generated-sources';

export const serdesPayload: TopicSerdeSuggestion = {
  key: [
    {
      name: 'String',
      description: undefined,
      preferred: false,
      schema: undefined,
      additionalProperties: undefined,
    },
    {
      name: 'Int32',
      description: undefined,
      preferred: true,
      schema:
        '{   "type" : "integer",   "minimum" : -2147483648,   "maximum" : 2147483647 }',
      additionalProperties: {},
    },
  ],
  value: [
    {
      name: 'String',
      description: undefined,
      preferred: false,
      schema: undefined,
      additionalProperties: undefined,
    },
    {
      name: 'Int64',
      description: undefined,
      preferred: true,
      schema:
        '{   "type" : "integer",   "minimum" : -9223372036854775808,   "maximum" : 9223372036854775807 }',
      additionalProperties: {},
    },
  ],
};
