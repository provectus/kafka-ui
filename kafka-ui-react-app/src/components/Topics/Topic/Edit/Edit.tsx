import React from 'react';
import {
  ClusterName,
  TopicFormDataRaw,
  TopicName,
  TopicConfigByName,
  TopicWithDetailedInfo,
  CleanupPolicy,
} from 'redux/interfaces';
import { TopicConfig } from 'generated-sources';
import { useForm, FormProvider } from 'react-hook-form';
import { camelCase } from 'lodash';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import { clusterTopicPath } from 'lib/paths';
import { useHistory } from 'react-router';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  topic?: TopicWithDetailedInfo;
  isFetched: boolean;
  isTopicUpdated: boolean;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
  updateTopic: (clusterName: ClusterName, form: TopicFormDataRaw) => void;
}

const DEFAULTS = {
  partitions: 1,
  replicationFactor: 1,
  minInSyncReplicas: 1,
  cleanupPolicy: CleanupPolicy.Delete,
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

  const methods = useForm<TopicFormDataRaw>({ defaultValues });

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
    updateTopic(clusterName, data);
    setIsSubmitting(true); // Keep this action after updateTopic to prevent redirect before update.
  };

  return (
    <div className="box">
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
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
  );
};

export default Edit;
