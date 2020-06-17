import React from 'react';
import {
  ClusterName,
  TopicFormData,
  TopicName,
  TopicConfigByName,
  TopicWithDetailedInfo,
  CleanupPolicy,
} from 'redux/interfaces';
import { useForm, FormContext } from 'react-hook-form';
import { camelCase } from 'lodash';

import TopicForm from '../shared/Form/TopicForm';
import FormBreadcrumbs from '../shared/Form/FormBreadcrumbs';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  topic?: TopicWithDetailedInfo;
  isFetched: boolean;
  isTopicDetailsFetched: boolean;
  isTopicUpdated: boolean;
  fetchTopicDetails: (clusterName: ClusterName, topicName: TopicName) => void;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
  updateTopic: (clusterName: ClusterName, form: TopicFormData) => void;
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => void;
  resetUploadedState: () => void;
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
    (result: { [name: string]: string }, param) => {
      result[camelCase(param.name)] = param.value || param.defaultValue;
      return result;
    },
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
  isTopicDetailsFetched,
  isTopicUpdated,
  fetchTopicDetails,
  fetchTopicConfig,
  updateTopic,
  redirectToTopicPath,
}) => {
  const defaultValues = topicParams(topic);

  const methods = useForm<TopicFormData>({ defaultValues });

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchTopicConfig(clusterName, topicName);
    fetchTopicDetails(clusterName, topicName);
  }, [fetchTopicConfig, fetchTopicDetails, clusterName, topicName]);

  React.useEffect(() => {
    if (isSubmitting && isTopicUpdated) {
      const { name } = methods.getValues();
      redirectToTopicPath(clusterName, name);
    }
  }, [isSubmitting, isTopicUpdated, redirectToTopicPath, clusterName, methods]);

  if (!isFetched || !isTopicDetailsFetched || !topic || !topic.config) {
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

  const onSubmit = async (data: TopicFormData) => {
    setIsSubmitting(true);
    updateTopic(clusterName, data);
  };

  return (
    <div className="section">
      <div className="level">
        <FormBreadcrumbs
          clusterName={clusterName}
          topicName={topicName}
          current="Edit Topic"
        />
      </div>

      <div className="box">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <FormContext {...methods}>
          <TopicForm
            topicName={topicName}
            config={config}
            isSubmitting={isSubmitting}
            isEditing
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </FormContext>
      </div>
    </div>
  );
};

export default Edit;
