import React from 'react';
import {
  ClusterName,
  TopicFormDataRaw,
  TopicName,
  TopicConfigByName,
  TopicWithDetailedInfo,
  TopicFormData,
} from 'redux/interfaces';
import { TopicConfig } from 'generated-sources';
import { useForm, FormProvider } from 'react-hook-form';
import { camelCase } from 'lodash';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import { clusterTopicPath } from 'lib/paths';
import { useHistory } from 'react-router';

import DangerZoneContainer from './DangerZoneContainer';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  topic?: TopicWithDetailedInfo;
  isFetched: boolean;
  isTopicUpdated: boolean;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
  updateTopic: (
    clusterName: ClusterName,
    topicName: TopicName,
    form: TopicFormDataRaw
  ) => void;
  updateTopicPartitionsCount: (
    clusterName: string,
    topicname: string,
    partitions: number
  ) => void;
}

const DEFAULTS = {
  partitions: 1,
  replicationFactor: 1,
  minInSyncReplicas: 1,
  cleanupPolicy: 'delete',
  retentionBytes: -1,
  maxMessageBytes: 1000012,
};

const topicParams = (topic: TopicWithDetailedInfo | undefined) => {
  if (!topic) {
    return DEFAULTS;
  }

  const { name, replicationFactor } = topic;

  const configs = topic.config?.reduce(
    (result: { [key: string]: TopicConfig['value'] }, param) => ({
      ...result,
      [camelCase(param.name)]: param.value || param.defaultValue,
    }),
    {}
  );

  return {
    ...DEFAULTS,
    name,
    partitions: topic.partitionCount || DEFAULTS.partitions,
    replicationFactor,
    customParams: topic.config
      ?.filter((el) => el.value !== el.defaultValue)
      .map((el) => ({ name: el.name, value: el.value })),
    ...configs,
  };
};

let formInit = false;

const Edit: React.FC<Props> = ({
  clusterName,
  topicName,
  topic,
  isFetched,
  isTopicUpdated,
  fetchTopicConfig,
  updateTopic,
}) => {
  const defaultValues = topicParams(topic);

  const methods = useForm<TopicFormData>({ defaultValues });

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const history = useHistory();

  React.useEffect(() => {
    fetchTopicConfig(clusterName, topicName);
  }, [fetchTopicConfig, clusterName, topicName]);

  React.useEffect(() => {
    if (isSubmitting && isTopicUpdated) {
      const { name } = methods.getValues();
      history.push(clusterTopicPath(clusterName, name));
    }
  }, [isSubmitting, isTopicUpdated, clusterTopicPath, clusterName, methods]);

  if (!isFetched || !topic || !topic.config) {
    return null;
  }

  if (!formInit) {
    methods.reset(defaultValues);
    formInit = true;
  }

  const config: TopicConfigByName = {
    byName: {},
  };

  topic.config.forEach((param) => {
    config.byName[param.name] = param;
  });

  const onSubmit = async (data: TopicFormDataRaw) => {
    updateTopic(clusterName, topicName, data);
    setIsSubmitting(true); // Keep this action after updateTopic to prevent redirect before update.
  };

  return (
    <div>
      <div className="box">
        <FormProvider {...methods}>
          <TopicForm
            topicName={topicName}
            config={config}
            isSubmitting={isSubmitting}
            isEditing
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </FormProvider>
      </div>
      {topic && (
        <DangerZoneContainer
          defaultPartitions={defaultValues.partitions}
          defaultReplicationFactor={
            defaultValues.replicationFactor || DEFAULTS.replicationFactor
          }
        />
      )}
    </div>
  );
};

export default Edit;
