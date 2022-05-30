import React from 'react';
import {
  ClusterName,
  TopicFormDataRaw,
  TopicName,
  TopicConfigByName,
  TopicWithDetailedInfo,
  TopicFormData,
} from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import { RouteParamsClusterTopic } from 'lib/paths';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { topicFormValidationSchema } from 'lib/yupExtended';
import { TOPIC_CUSTOM_PARAMS_PREFIX, TOPIC_CUSTOM_PARAMS } from 'lib/constants';
import styled from 'styled-components';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppSelector } from 'lib/hooks/redux';
import { getFullTopic } from 'redux/reducers/topics/selectors';
import useAppParams from 'lib/hooks/useAppParams';

import DangerZoneContainer from './DangerZone/DangerZoneContainer';

export interface Props {
  isFetched: boolean;
  isTopicUpdated: boolean;
  fetchTopicConfig: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
  }) => void;
  updateTopic: (payload: {
    clusterName: ClusterName;
    topicName: TopicName;
    form: TopicFormDataRaw;
  }) => void;
}

const EditWrapperStyled = styled.div`
  display: flex;
  justify-content: center;
  & > * {
    width: 800px;
  }
`;

export const DEFAULTS = {
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

  return {
    ...DEFAULTS,
    name,
    partitions: topic.partitionCount || DEFAULTS.partitions,
    replicationFactor,
    [TOPIC_CUSTOM_PARAMS_PREFIX]: topic.config
      ?.filter(
        (el) =>
          el.value !== el.defaultValue &&
          Object.keys(TOPIC_CUSTOM_PARAMS).includes(el.name)
      )
      .map((el) => ({ name: el.name, value: el.value })),
  };
};

let formInit = false;

const Edit: React.FC<Props> = ({
  isFetched,
  isTopicUpdated,
  fetchTopicConfig,
  updateTopic,
}) => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const topic = useAppSelector((state) => getFullTopic(state, topicName));

  const defaultValues = React.useMemo(() => topicParams(topic), [topic]);

  const methods = useForm<TopicFormData>({
    defaultValues,
    resolver: yupResolver(topicFormValidationSchema),
  });

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchTopicConfig({ clusterName, topicName });
  }, [fetchTopicConfig, clusterName, topicName]);

  React.useEffect(() => {
    if (isSubmitting && isTopicUpdated) {
      navigate('../');
    }
  }, [isSubmitting, isTopicUpdated, clusterName, navigate]);

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
    updateTopic({ clusterName, topicName, form: data });
    setIsSubmitting(true); // Keep this action after updateTopic to prevent redirect before update.
  };

  return (
    <>
      <PageHeading text={`Edit ${topicName}`} />
      <EditWrapperStyled>
        <div>
          <FormProvider {...methods}>
            <TopicForm
              topicName={topicName}
              isSubmitting={isSubmitting}
              isEditing
              onSubmit={methods.handleSubmit(onSubmit)}
            />
          </FormProvider>
          {topic && (
            <DangerZoneContainer
              defaultPartitions={defaultValues.partitions}
              defaultReplicationFactor={
                defaultValues.replicationFactor || DEFAULTS.replicationFactor
              }
            />
          )}
        </div>
      </EditWrapperStyled>
    </>
  );
};

export default Edit;
