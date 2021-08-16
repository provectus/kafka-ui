export const fetchKsqlDbTablesPayload: {
  tables: Dictionary<string>[];
  streams: Dictionary<string>[];
} = {
  tables: [
    {
      type: 'TABLE',
      name: 'USERS',
      topic: 'users',
      keyFormat: 'KAFKA',
      valueFormat: 'AVRO',
      isWindowed: 'false',
    },
    {
      type: 'TABLE',
      name: 'USERS2',
      topic: 'users',
      keyFormat: 'KAFKA',
      valueFormat: 'AVRO',
      isWindowed: 'false',
    },
  ],
  streams: [
    {
      type: 'STREAM',
      name: 'KSQL_PROCESSING_LOG',
      topic: 'default_ksql_processing_log',
      keyFormat: 'KAFKA',
      valueFormat: 'JSON',
      isWindowed: 'false',
    },
    {
      type: 'STREAM',
      name: 'PAGEVIEWS',
      topic: 'pageviews',
      keyFormat: 'KAFKA',
      valueFormat: 'AVRO',
      isWindowed: 'false',
    },
  ],
};

export const ksqlCommandResponse = {
  data: {
    headers: [
      'type',
      'name',
      'topic',
      'keyFormat',
      'valueFormat',
      'isWindowed',
    ],
    rows: [
      [
        'STREAM',
        'KSQL_PROCESSING_LOG',
        'default_ksql_processing_log',
        'KAFKA',
        'JSON',
        'false',
      ],
      ['STREAM', 'PAGEVIEWS', 'pageviews', 'KAFKA', 'AVRO', 'false'],
    ],
  },
};
