export const expectedOutputs = {
  EARLIEST: {
    partitions: [0],
    partitionsOffsets: [
      {
        offset: undefined,
        partition: 0,
      },
    ],
    resetType: 'EARLIEST',
    topic: '__amazon_msk_canary',
  },
  LATEST: {
    partitions: [0],
    partitionsOffsets: [
      {
        offset: undefined,
        partition: 0,
      },
    ],
    resetType: 'LATEST',
    topic: '__amazon_msk_canary',
  },
  OFFSET: {
    partitions: [0],
    partitionsOffsets: [
      {
        offset: '10',
        partition: 0,
      },
    ],
    resetType: 'OFFSET',
    topic: '__amazon_msk_canary',
  },
};
