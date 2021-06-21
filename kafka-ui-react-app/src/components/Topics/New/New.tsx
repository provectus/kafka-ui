import React from 'react';
import { ClusterName, TopicName, TopicFormDataRaw } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterTopicsPath } from 'lib/paths';
import TopicForm from 'components/Topics/shared/Form/TopicForm';

interface Props {
  clusterName: ClusterName;
  isTopicCreated: boolean;
  createTopic: (clusterName: ClusterName, form: TopicFormDataRaw) => void;
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => void;
  resetUploadedState: () => void;
}

const New: React.FC<Props> = ({
  clusterName,
  isTopicCreated,
  createTopic,
  redirectToTopicPath,
  resetUploadedState,
}) => {
  const methods = useForm<TopicFormDataRaw>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isTopicCreated) {
      const { name } = methods.getValues();
      resetUploadedState();
      redirectToTopicPath(clusterName, name);
    }
  }, [
    resetUploadedState,
    isTopicCreated,
    redirectToTopicPath,
    clusterName,
    methods,
  ]);

  const onSubmit = async (data: TopicFormDataRaw) => {
    createTopic(clusterName, data);
    setIsSubmitting(true); // Keep this action after createTopic to prevent redirect before create.
  };

  return (
    <div className="section">
      <div className="level">
        <div className="level-item level-left">
          <Breadcrumb
            links={[
              { href: clusterTopicsPath(clusterName), label: 'All Topics' },
            ]}
          >
            New Topic
          </Breadcrumb>
        </div>
      </div>

      <div className="box">
        {/* eslint-disable react/jsx-props-no-spreading */}
        <FormProvider {...methods}>
          <TopicForm
            isSubmitting={isSubmitting}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default New;
