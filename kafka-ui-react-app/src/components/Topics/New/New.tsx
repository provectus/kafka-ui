import React from 'react';
import { useForm, FormContext } from 'react-hook-form';
import { ClusterName, TopicFormData, TopicName } from 'redux/interfaces';

import TopicForm from '../shared/Form/TopicForm';
import FormBreadcrumbs from '../shared/Form/FormBreadcrumbs';


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
  resetUploadedState,
}) => {
  const methods = useForm<TopicFormData>();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isSubmitting && isTopicCreated) {
      const { name } = methods.getValues();
      redirectToTopicPath(clusterName, name);
    }
  }, [
      isSubmitting,
      isTopicCreated,
      redirectToTopicPath,
      clusterName,
      methods.getValues,
    ]);

  const onSubmit = async (data: TopicFormData) => {
    // TODO: need to fix loader. After success loading the first time, we won't wait for creation any more, because state is
    // loaded, and we will try to get entity immediately after pressing the button, and we will receive null
    // going to object page on the second creation. Resetting loaded state is workaround, need to tweak loader logic
    resetUploadedState();
    setIsSubmitting(true);
    createTopic(clusterName, data);
  };

  return (
    <div className="section">
      <div className="level">
        <FormBreadcrumbs clusterName={clusterName} current="New Topic"/>
      </div>

      <div className="box">
        <FormContext {...methods}>
          <TopicForm isSubmitting={isSubmitting} onSubmit={methods.handleSubmit(onSubmit)} />
        </FormContext>
      </div>
    </div>
  );
};

export default New;
