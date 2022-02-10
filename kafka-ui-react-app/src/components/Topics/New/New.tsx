import React from 'react';
import { ClusterName, TopicFormData, FailurePayload } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import { clusterTopicPath } from 'lib/paths';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import {
  formatTopicCreation,
  topicsApiClient,
  createTopicAction,
} from 'redux/actions';
import { useDispatch } from 'react-redux';
import { getResponse } from 'lib/errorHandling';
import { useHistory, useParams } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { topicFormValidationSchema } from 'lib/yupExtended';
import PageHeading from 'components/common/PageHeading/PageHeading';

interface RouterParams {
  clusterName: ClusterName;
}

const New: React.FC = () => {
  const methods = useForm<TopicFormData>({
    mode: 'all',
    resolver: yupResolver(topicFormValidationSchema),
  });

  const { clusterName } = useParams<RouterParams>();
  const history = useHistory();
  const dispatch = useDispatch();

  const onSubmit = async (data: TopicFormData) => {
    try {
      await topicsApiClient.createTopic({
        clusterName,
        topicCreation: formatTopicCreation(data),
      });
      history.push(clusterTopicPath(clusterName, data.name));
    } catch (error) {
      const response = await getResponse(error as Response);
      const alert: FailurePayload = {
        subject: ['schema', data.name].join('-'),
        title: `Schema ${data.name}`,
        response,
      };

      dispatch(createTopicAction.failure({ alert }));
    }
  };

  return (
    <>
      <PageHeading text="Create new Topic" />
      <FormProvider {...methods}>
        <TopicForm
          isSubmitting={methods.formState.isSubmitting}
          onSubmit={methods.handleSubmit(onSubmit)}
        />
      </FormProvider>
    </>
  );
};

export default New;
