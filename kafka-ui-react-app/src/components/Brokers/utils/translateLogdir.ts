import { BrokersLogdirs } from 'generated-sources';
import { BrokerLogdirState } from 'components/Brokers/Broker/Broker';

export const translateLogdir = (data: BrokersLogdirs): BrokerLogdirState => {
  const partitionsCount =
    data.topics?.reduce(
      (prevValue, value) => prevValue + (value.partitions?.length || 0),
      0
    ) || 0;

  return {
    name: data.name || '-',
    error: data.error || '-',
    topics: data.topics?.length || 0,
    partitions: partitionsCount,
  };
};
