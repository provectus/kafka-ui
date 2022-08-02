import React, { PropsWithChildren } from 'react';
import SpinnerIcon from 'components/common/Icons/SpinnerIcon';

import * as S from './Metrics.styled';

export interface Props {
  fetching?: boolean;
  isAlert?: boolean;
  label: React.ReactNode;
  title?: string;
  alertType?: 'success' | 'error' | 'warning' | 'info';
}

const Indicator: React.FC<PropsWithChildren<Props>> = ({
  label,
  title,
  fetching,
  isAlert,
  alertType = 'error',
  children,
}) => (
  <S.IndicatorWrapper>
    <div title={title}>
      <S.IndicatorTitle>
        {label}{' '}
        {isAlert && (
          <S.CircularAlertWrapper>
            <S.CircularAlert $type={alertType} />
          </S.CircularAlertWrapper>
        )}
      </S.IndicatorTitle>
      <span>{fetching ? <SpinnerIcon /> : children}</span>
    </div>
  </S.IndicatorWrapper>
);

export default Indicator;
