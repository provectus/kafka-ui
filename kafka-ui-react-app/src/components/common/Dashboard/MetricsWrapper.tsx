import React from 'react';
import { styled } from 'lib/themedStyles';

interface Props {
  title?: string;
}

const MetricsWrapperStyled = styled.div`
  width: 100%;
  overflow-y: scroll;
  .indicatorsWrapper {
    display: flex;
    gap: 2px;
    > * {
      &:first-child {
        border-radius: 8px 0px 0px 8px;
      }
      &:last-child {
        border-radius: 0px 8px 8px 0px;
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
