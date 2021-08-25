import React from 'react';
import { ClusterName, TopicFormData, FailurePayload } from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import Breadcrumb from 'components/common/Breadcrumb/Breadcrumb';
import { clusterTopicPath, clusterTopicsPath } from 'lib/paths';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import {
  formatTopicCreation,
  topicsApiClient,
  createTopicAction,
} from 'redux/actions';
import { useDispatch } from 'react-redux';
import { getResponse } from 'lib/errorHandling';
import { useHistory, useParams } from 'react-router';

interface RouterParams {
  clusterName: ClusterName;
}

const New: React.FC = () => {
  const methods = useForm<TopicFormData>();
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
