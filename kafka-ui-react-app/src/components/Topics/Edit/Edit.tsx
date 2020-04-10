import React from 'react';
import {
  ClusterName,
  TopicFormData,
  TopicName,
  TopicConfigByName,
} from 'redux/interfaces';
import { useForm, FormContext } from 'react-hook-form';

import TopicForm from '../shared/Form/TopicForm';
import FormBreadcrumbs from '../shared/Form/FormBreadcrumbs';

interface Props {
  clusterName: ClusterName;
  topicName: TopicName;
  config?: TopicConfigByName;
  isFetched: boolean;
  isTopicUpdated: boolean;
  fetchTopicConfig: (clusterName: ClusterName, topicName: TopicName) => void;
  updateTopic: (clusterName: ClusterName, form: TopicFormData) => void;
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => void;
  resetUploadedState: () => void;
}

const Edit: React.FC<Props> = ({
  clusterName,
  topicName,
  config,
  isFetched,
  isTopicUpdated,
  fetchTopicConfig,
  updateTopic,
  redirectToTopicPath,
}) => {
  const methods = useForm<TopicFormData>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    fetchTopicConfig(clusterName, topicName);
  }, [fetchTopicConfig, clusterName, topicName]);

  React.useEffect(() => {
    if (isSubmitting && isTopicUpdated) {
      const { name } = methods.getValues();
      redirectToTopicPath(clusterName, name);
    }
  }, [
    isSubmitting,
    isTopicUpdated,
    redirectToTopicPath,
    clusterName,
    methods.getValues,
  ]);

  if (!isFetched || !config) {
    return null;
  }

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
