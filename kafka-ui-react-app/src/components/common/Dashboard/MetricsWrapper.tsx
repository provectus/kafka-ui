import React from 'react';
import styled from 'styled-components';

interface Props {
  title?: string;
}

const MetricsWrapperStyled = styled.div`
  overflow-y: scroll;
  .indicatorsWrapper {
    display: flex;
    gap: 2px;
    > * {
      &:first-child {
        border-top-left-radius: 8px;
        border-bottom-left-radius: 8px;
      }
      &:last-child {
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        margin-right: 3px;
      }
    }
  }
`;

const MetricsWrapper: React.FC<Props> = ({ title, children }) => {
  return (
    <MetricsWrapperStyled>
      {title && <h5 className="is-7 has-text-weight-medium mb-2">{title}</h5>}
      <div className="indicatorsWrapper">{children}</div>
    </MetricsWrapperStyled>
  );
};

export default MetricsWrapper;
