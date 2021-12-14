import React from 'react';

import * as S from './Metrics.styled';

interface Props {
  fetching?: boolean;
  isAlert?: boolean;
  label: React.ReactNode;
  title?: string;
}

const Indicator: React.FC<Props> = ({
  label,
  title,
  fetching,
  isAlert,
  children,
}) => {
  return (
    <S.IndicatorWrapper>
      <div title={title}>
        <S.IndicatorTitle>
          {label}{' '}
          {isAlert && (
            <svg
              width="4"
              height="4"
              viewBox="0 0 4 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="2" cy="2" r="2" fill="#E61A1A" />
            </svg>
          )}
        </S.IndicatorTitle>
        <span>
          {fetching ? <i className="fas fa-spinner fa-pulse" /> : children}
        </span>
      </div>
    </S.IndicatorWrapper>
  );
};

export default Indicator;
