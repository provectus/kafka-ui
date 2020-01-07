const randomBrokerMetrics = () => ({
  bytesInPerSec: Math.ceil(Math.random() * 10000),

  brokerCount: 1,
  zooKeeperStatus: 1,
  activeControllers: 1,
  uncleanLeaderElectionCount: 0,
  networkPoolUsage: Math.random(),
  requestPoolUsage: Math.random(),
  onlinePartitionCount: Math.ceil(Math.random() * 1000),
  underReplicatedPartitionCount: Math.ceil(Math.random() * 10),
  offlinePartitionCount: Math.ceil(Math.random() * 10),
  diskUsage: [
    {
      brokerId: 1,
      segmentSize: Math.ceil(Math.random() * 1_000_000_000),
    },
  ],
  diskUsageDistribution: 'even',
});

module.exports = {
  'wrYGf-csNgiGdK7B_ADF7Z': randomBrokerMetrics(),
  'dMMQx-WRh77BKYas_g2ZTz': randomBrokerMetrics(),
};
