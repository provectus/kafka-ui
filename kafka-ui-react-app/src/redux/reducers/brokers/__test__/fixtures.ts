export const brokersPayload = [
  { id: 1, host: 'b-1.test.kafka.amazonaws.com' },
  { id: 2, host: 'b-2.test.kafka.amazonaws.com' },
];

export const brokerStatsPayload = {
  brokerCount: 2,
  zooKeeperStatus: 1,
  activeControllers: 1,
  onlinePartitionCount: 138,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 239,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [
    { brokerId: 1, segmentSize: 16848434, segmentCount: 118 },
    { brokerId: 2, segmentSize: 12345678, segmentCount: 121 },
  ],
  version: '2.2.1',
};

export const brokersReducerState = {
  items: [],
  brokerCount: 2,
  zooKeeperStatus: 1,
  activeControllers: 1,
  onlinePartitionCount: 138,
  offlinePartitionCount: 0,
  inSyncReplicasCount: 239,
  outOfSyncReplicasCount: 0,
  underReplicatedPartitionCount: 0,
  diskUsage: [
    { brokerId: 1, segmentSize: 16848434, segmentCount: 118 },
    { brokerId: 2, segmentSize: 12345678, segmentCount: 121 },
  ],
  version: '2.2.1',
};
