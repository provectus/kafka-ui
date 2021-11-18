import React from 'react';

import { StyledIndicator, StyledIndicatorTitle } from './Metrics.styled';

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
    <StyledIndicator>
      <div title={title}>
        <StyledIndicatorTitle>
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
        </StyledIndicatorTitle>
        <span>
          {fetching ? <i className="fas fa-spinner fa-pulse" /> : children}
        </span>
      </div>
    </StyledIndicator>
  );
};

export default Indicator;
