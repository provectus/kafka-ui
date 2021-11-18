import React from 'react';
import { Connector } from 'generated-sources';
import TagStyled from 'components/common/Tag/Tag.styled';
import { StyledMetricsWrapper } from 'components/common/Metrics/Metrics.styled';
import MetricsSection from 'components/common/Metrics/MetricsSection';
import Indicator from 'components/common/Metrics/Indicator';

export interface OverviewProps {
  connector: Connector | null;
  runningTasksCount: number;
  failedTasksCount: number;
}

const Overview: React.FC<OverviewProps> = ({
  connector,
  runningTasksCount,
  failedTasksCount,
}) => {
  if (!connector) return null;

  return (
    <StyledMetricsWrapper>
      <MetricsSection>
        {connector.status?.workerId && (
          <Indicator label="Worker">{connector.status.workerId}</Indicator>
        )}
        <Indicator label="Type">{connector.type}</Indicator>
        {connector.config['connector.class'] && (
          <Indicator label="Class">
            {connector.config['connector.class']}
          </Indicator>
        )}
        <Indicator label="State">
          <TagStyled color="yellow">{connector.status.state}</TagStyled>
        </Indicator>
        <Indicator label="Tasks running">{runningTasksCount}</Indicator>
        <Indicator label="Tasks failed" isAlert>
          {failedTasksCount}
        </Indicator>
      </MetricsSection>
    </StyledMetricsWrapper>
  );
};

export default Overview;
