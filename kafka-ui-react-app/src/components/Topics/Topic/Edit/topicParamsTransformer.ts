import { TopicWithDetailedInfo } from 'redux/interfaces';
import {
  MILLISECONDS_IN_WEEK,
  TOPIC_CUSTOM_PARAMS,
  TOPIC_CUSTOM_PARAMS_PREFIX,
} from 'lib/constants';
import { DEFAULTS } from 'components/Topics/Topic/Edit/Edit';

export const getValue = (
  topic: TopicWithDetailedInfo,
  fieldName: string,
  defaultValue?: number
) =>
  Number(topic?.config?.find((config) => config.name === fieldName)?.value) ||
  defaultValue;

const topicParamsTransformer = (topic?: TopicWithDetailedInfo) => {
  if (!topic) {
    return DEFAULTS;
  }

  const { name, replicationFactor } = topic;

  return {
    ...DEFAULTS,
    name,
    replicationFactor,
    partitions: topic.partitionCount || DEFAULTS.partitions,
    maxMessageBytes: getValue(topic, 'max.message.bytes', 1000012),
    minInSyncReplicas: getValue(topic, 'min.insync.replicas', 1),
    retentionBytes: getValue(topic, 'retention.bytes', -1),
    retentionMs: getValue(topic, 'retention.ms', MILLISECONDS_IN_WEEK),

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
