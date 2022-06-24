import { TopicWithDetailedInfo } from 'redux/interfaces';
import { TOPIC_CUSTOM_PARAMS, TOPIC_CUSTOM_PARAMS_PREFIX } from 'lib/constants';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

const topicParamsTransformer = (topic: TopicWithDetailedInfo | undefined) => {
  if (!topic) {
    return DEFAULTS;
  }

  const { name, replicationFactor } = topic;

  return {
    ...DEFAULTS,
    name,
    replicationFactor,
    partitions: topic.partitionCount || DEFAULTS.partitions,
    maxMessageBytes: Number(
      topic?.config?.find((config) => config.name === 'max.message.bytes')
        ?.value || '1000012'
    ),
    minInsyncReplicas: Number(
      topic?.config?.find((config) => config.name === 'min.insync.replicas')
        ?.value || 1
    ),
    retentionBytes:
      Number(
        topic?.config?.find((config) => config.name === 'retention.bytes')
          ?.value
      ) || -1,
    retentionMs:
      Number(
        topic?.config?.find((config) => config.name === 'retention.ms')?.value
      ) || -1,

    [TOPIC_CUSTOM_PARAMS_PREFIX]: topic.config
      ?.filter(
        (el) =>
          el.value !== el.defaultValue &&
          Object.keys(TOPIC_CUSTOM_PARAMS).includes(el.name)
      )
      .map((el) => ({ name: el.name, value: el.value })),
  };
};
export default topicParamsTransformer;
