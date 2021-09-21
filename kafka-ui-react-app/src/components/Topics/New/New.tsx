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
import yup from 'lib/yupExtended';
import { TOPIC_NAME_VALIDATION_PATTERN } from 'lib/constants';

interface RouterParams {
  clusterName: ClusterName;
}
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required()
    .matches(
      TOPIC_NAME_VALIDATION_PATTERN,
      'Only alphanumeric, _, -, and . allowed'
    ),
  partitions: yup.number().required(),
  replicationFactor: yup.number().required(),
  minInSyncReplicas: yup.number().required(),
  cleanupPolicy: yup.string().required(),
  retentionMs: yup.number().min(-1, 'Must be greater than or equal to -1'),
  retentionBytes: yup.number(),
  maxMessageBytes: yup.number().required(),
  customParams: yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      value: yup.string().required(),
    })
  ),
});

const New: React.FC = () => {
  const methods = useForm<TopicFormData>({
    resolver: yupResolver(validationSchema),
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
      const response = await getResponse(error);
      const alert: FailurePayload = {
        subject: ['schema', data.name].join('-'),
        title: `Schema ${data.name}`,
        response,
      };

      dispatch(createTopicAction.failure({ alert }));
    }
  };

  return (
    <div className="section">
      <div className="box">
        <FormProvider {...methods}>
          <TopicForm
            isSubmitting={methods.formState.isSubmitting}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default New;
