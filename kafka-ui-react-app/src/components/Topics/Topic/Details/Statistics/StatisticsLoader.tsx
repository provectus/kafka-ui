import React from 'react';
import * as S from 'components/Topics/Topic/Details/Statistics/Statistics.styled';
import RefreshIcon from 'components/common/Icons/RefreshIcon';
import { Button } from 'components/common/Button/Button';

export interface Props {
  status?: 'loading' | 'ready';
  updatedTime?: string;
  onLoad: () => void;
  // onStop: () => void
  onUpdate: () => void;
}

const StatisticsLoader: React.FC<Props> = ({
  status,
  updatedTime,
  onLoad,
  // onStop,
  onUpdate,
}) => {
  return (
    <div>
      <S.LoadingWrapper isReady={status === 'ready'}>
        {!status && (
          <Button buttonType="primary" buttonSize="M" onClick={onLoad}>
            Start analysis
          </Button>
        )}
        {status === 'ready' && (
          <>
            {updatedTime || ''}
            <RefreshIcon onClick={onUpdate} />
          </>
        )}
        {status === 'loading' && (
          <Button buttonType="primary" buttonSize="M" onClick={onLoad}>
            Stop analysis
          </Button>
        )}
      </S.LoadingWrapper>
    </div>
  );
};

export default StatisticsLoader;
