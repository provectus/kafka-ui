import React from 'react';
import { Connector } from 'generated-sources';
import TagStyled from 'components/common/Tag/Tag.styled';
import * as Metrics from 'components/common/Metrics';

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
    <Metrics.Wrapper>
      <Metrics.Section>
        {connector.status?.workerId && (
          <Metrics.Indicator label="Worker">
            {connector.status.workerId}
          </Metrics.Indicator>
        )}
        <Metrics.Indicator label="Type">{connector.type}</Metrics.Indicator>
        {connector.config['connector.class'] && (
          <Metrics.Indicator label="Class">
            {connector.config['connector.class']}
          </Metrics.Indicator>
        )}
        <Metrics.Indicator label="State">
          <TagStyled color="yellow">{connector.status.state}</TagStyled>
        </Metrics.Indicator>
        <Metrics.Indicator label="Tasks Running">
          {runningTasksCount}
        </Metrics.Indicator>
        <Metrics.Indicator label="Tasks Failed" isAlert>
          f{failedTasksCount}
        </Metrics.Indicator>
      </Metrics.Section>
    </Metrics.Wrapper>
  );
};

export default Overview;
