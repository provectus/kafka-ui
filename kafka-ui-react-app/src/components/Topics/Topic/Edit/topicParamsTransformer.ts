import {
  MILLISECONDS_IN_WEEK,
  TOPIC_CUSTOM_PARAMS,
  TOPIC_CUSTOM_PARAMS_PREFIX,
} from 'lib/constants';
import { TOPIC_EDIT_FORM_DEFAULT_PROPS } from 'components/Topics/Topic/Edit/Edit';
import { getCleanUpPolicyValue } from 'components/Topics/shared/Form/TopicForm';
import { Topic, TopicConfig } from 'generated-sources';

export const getValue = (
  config: TopicConfig[],
  fieldName: string,
  defaultValue?: number
) =>
  Number(config.find(({ name }) => name === fieldName)?.value) || defaultValue;

const topicParamsTransformer = (topic?: Topic, config?: TopicConfig[]) => {
  if (!config || !topic) {
    return TOPIC_EDIT_FORM_DEFAULT_PROPS;
  }

  const customParams = config.reduce((acc, { name, value, defaultValue }) => {
    if (value === defaultValue) return acc;
    if (!TOPIC_CUSTOM_PARAMS[name]) return acc;
    return [...acc, { name, value }];
  }, [] as { name: string; value?: string }[]);

  return {
    ...TOPIC_EDIT_FORM_DEFAULT_PROPS,
    name: topic.name,
    replicationFactor: topic.replicationFactor,
    partitions:
      topic.partitionCount || TOPIC_EDIT_FORM_DEFAULT_PROPS.partitions,
    cleanupPolicy:
      getCleanUpPolicyValue(topic.cleanUpPolicy) ||
      TOPIC_EDIT_FORM_DEFAULT_PROPS.cleanupPolicy,
    maxMessageBytes: getValue(config, 'max.message.bytes', 1000012),
    minInSyncReplicas: getValue(config, 'min.insync.replicas', 1),
    retentionBytes: getValue(config, 'retention.bytes', -1),
    retentionMs: getValue(config, 'retention.ms', MILLISECONDS_IN_WEEK),

    [TOPIC_CUSTOM_PARAMS_PREFIX]: customParams,
  };
};
export default topicParamsTransformer;
