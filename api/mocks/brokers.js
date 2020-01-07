const randomBroker = () => ({
  bytesInPerSec: Math.ceil(Math.random() * 10000),
  bytesOutPerSec: Math.ceil(Math.random() * 10000),
  segmentSize: Math.ceil(Math.random() * 1_000_000_000),
  partitionReplicas: 134,
});

module.exports = {
  'wrYGf-csNgiGdK7B_ADF7Z': [
    {
      brokerId: 1,
      ...randomBroker(),
    },
  ],
  'dMMQx-WRh77BKYas_g2ZTz': [
    {
      brokerId: 2,
      ...randomBroker(),
    },
  ],
};
