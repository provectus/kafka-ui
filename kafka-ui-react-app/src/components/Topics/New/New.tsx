import React from 'react';
import { ClusterName, TopicName, TopicFormData } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterTopicsPath } from 'lib/paths';
import TopicForm from 'components/Topics/shared/Form/TopicForm';

interface Props {
  clusterName: ClusterName;
  isTopicCreated: boolean;
  createTopic: (clusterName: ClusterName, form: TopicFormData) => void;
  redirectToTopicPath: (clusterName: ClusterName, topicName: TopicName) => void;
  resetUploadedState: () => void;
}

const New: React.FC<Props> = ({
  clusterName,
  isTopicCreated,
  createTopic,
  redirectToTopicPath,
}) => {
  const methods = useForm<TopicFormData>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isSubmitting && isTopicCreated) {
      const { name } = methods.getValues();
      redirectToTopicPath(clusterName, name);
    }
  }, [isSubmitting, isTopicCreated, redirectToTopicPath, clusterName, methods]);

  const onSubmit = async (data: TopicFormData) => {
    // TODO: need to fix loader. After success loading the first time, we won't wait for creation any more, because state is
    // loaded, and we will try to get entity immediately after pressing the button, and we will receive null
    // going to object page on the second creation. Setting of isSubmitting after createTopic is a workaround, need to tweak loader logic
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
