import React, { useEffect } from 'react';
import {
  ClusterName,
  TopicFormDataRaw,
  TopicName,
  TopicConfigByName,
  TopicFormData,
} from 'redux/interfaces';
import { useForm, FormProvider } from 'react-hook-form';
import TopicForm from 'components/Topics/shared/Form/TopicForm';
import { RouteParamsClusterTopic } from 'lib/paths';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import { topicFormValidationSchema } from 'lib/yupExtended';
import styled from 'styled-components';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { useAppSelector } from 'lib/hooks/redux';
import { getFullTopic } from 'redux/reducers/topics/selectors';
import useAppParams from 'lib/hooks/useAppParams';
import topicParamsTransformer from 'components/Topics/Topic/Edit/topicParamsTransformer';
import { MILLISECONDS_IN_WEEK } from 'lib/constants';

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
  retentionMs: MILLISECONDS_IN_WEEK,
  maxMessageBytes: 1000012,
  customParams: [],
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

  const defaultValues = topicParamsTransformer(topic);

  const methods = useForm<TopicFormData>({
    defaultValues,
    resolver: yupResolver(topicFormValidationSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    methods.reset(defaultValues);
  }, [!topic]);

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchTopicConfig({ clusterName, topicName });
  }, [fetchTopicConfig, clusterName, topicName, isTopicUpdated]);

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
              retentionBytes={defaultValues.retentionBytes}
              inSyncReplicas={Number(defaultValues.minInSyncReplicas)}
              isSubmitting={isSubmitting}
              cleanUpPolicy={topic.cleanUpPolicy}
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
