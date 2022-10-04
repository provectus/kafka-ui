/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { useAnalyzeTopic } from 'lib/hooks/api/topics';
import useAppParams from 'lib/hooks/useAppParams';
import { RouteParamsClusterTopic } from 'lib/paths';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from 'components/common/Button/Button';

import * as S from './Statistics.styles';
import Metrics from './Metrics';

const Statistics: React.FC = () => {
  const params = useAppParams<RouteParamsClusterTopic>();
  const analyzeTopic = useAnalyzeTopic(params);

  const [timing, toggleTiming] = useState<boolean>(false);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <S.ProgressContainer>
              <Button
                onClick={async () => {
                  await analyzeTopic.mutateAsync();
                  resetErrorBoundary();
                  toggleTiming(true);
                }}
                buttonType="primary"
                buttonSize="M"
              >
                Start Analysis
              </Button>
            </S.ProgressContainer>
          )}
        >
          <Metrics timing={timing} />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export default Statistics;
