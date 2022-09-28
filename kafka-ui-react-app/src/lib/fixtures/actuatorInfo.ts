export const actuatorInfoPayload = (
  version = 'befd3b328e2c9c7df57b0c5746561b2f7fee8813'
) => ({
  git: { commit: { id: 'befd3b3' } },
  build: {
    artifact: 'kafka-ui-api',
    name: 'kafka-ui-api',
    time: '2022-09-15T09:52:21.753Z',
    version,
    group: 'com.provectus',
  },
});
