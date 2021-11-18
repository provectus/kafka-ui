import React from 'react';

import { StyledIndicatorsWrapper } from './Metrics.styled';

interface Props {
  title?: string;
}

const MetricsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <div>
      {title && <h5 className="is-7 has-text-weight-medium mb-2">{title}</h5>}
      <StyledIndicatorsWrapper>{children}</StyledIndicatorsWrapper>
    </div>
  );
};

export default MetricsSection;
