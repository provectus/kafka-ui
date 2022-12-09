/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useAnalyzeTopic } from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Action, ResourceType } from 'generated-sources';
import { ActionButton } from 'components/common/ActionComponent';

import * as S from './Statistics.styles';
import Metrics from './Metrics';

const Statistics: React.FC = () => {
  const params = useAppParams<RouteParamsClusterTopic>();
  const analyzeTopic = useAnalyzeTopic(params);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <S.ProgressContainer>
              <ActionButton
                onClick={async () => {
                  await analyzeTopic.mutateAsync();
                  resetErrorBoundary();
                }}
                buttonType="primary"
                buttonSize="M"
                permission={{
                  resource: ResourceType.TOPIC,
                  action: Action.MESSAGES_READ,
                  value: params.topicName,
                }}
              >
                Start Analysis
              </ActionButton>
            </S.ProgressContainer>
          )}
        >
          <Metrics />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default Statistics;
