export const defaultValues = {
  partitions: 1,
  replicationFactor: 1,
  minInsyncReplicas: 1,
  cleanupPolicy: 'delete',
  retentionBytes: -1,
  maxMessageBytes: 1000012,
  name: 'TestCustomParamEdit',
  customParams: [
    {
      name: 'delete.retention.ms',
      value: '86400001',
    },
  ],
};
