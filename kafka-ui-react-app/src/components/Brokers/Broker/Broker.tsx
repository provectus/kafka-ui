import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import useAppParams from 'lib/hooks/useAppParams';
import {
  clusterBrokerMetricsPath,
  clusterBrokerMetricsRelativePath,
  ClusterBrokerParam,
  clusterBrokerPath,
} from 'lib/paths';
import { useClusterStats } from 'lib/hooks/api/clusters';
import { useBrokers } from 'lib/hooks/api/brokers';
import { NavLink, Route, Routes } from 'react-router-dom';
import BrokerLogdir from 'components/Brokers/Broker/BrokerLogdir/BrokerLogdir';
import BrokerMetrics from 'components/Brokers/Broker/BrokerMetrics/BrokerMetrics';
import Navbar from 'components/common/Navigation/Navbar.styled';

export interface BrokerLogdirState {
  name: string;
  error: string;
  topics: number;
  partitions: number;
}

const Broker: React.FC = () => {
  const { clusterName, brokerId } = useAppParams<ClusterBrokerParam>();

  const { data: clusterStats } = useClusterStats(clusterName);
  const { data: brokers } = useBrokers(clusterName);

  if (!clusterStats) return null;

  const brokerItem = brokers?.find(({ id }) => id === Number(brokerId));
  const brokerDiskUsage = clusterStats.diskUsage?.find(
    (item) => item.brokerId === Number(brokerId)
  );
  return (
    <>
      <PageHeading text={`Broker ${brokerId}`} />
      <Metrics.Wrapper>
        <Metrics.Section>
          <Metrics.Indicator label="Segment Size">
            <BytesFormatted value={brokerDiskUsage?.segmentSize} />
          </Metrics.Indicator>
          <Metrics.Indicator label="Segment Count">
            {brokerDiskUsage?.segmentCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Port">{brokerItem?.port}</Metrics.Indicator>
          <Metrics.Indicator label="Host">{brokerItem?.host}</Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>

      <Navbar role="navigation">
        <NavLink
          to={clusterBrokerPath(clusterName, brokerId)}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
          end
        >
          Log directories
        </NavLink>
        <NavLink
          to={clusterBrokerMetricsPath(clusterName, brokerId)}
          className={({ isActive }) => (isActive ? 'is-active' : '')}
        >
          Metrics
        </NavLink>
      </Navbar>

      <Routes>
        <Route index element={<BrokerLogdir />} />
        <Route
          path={clusterBrokerMetricsRelativePath}
          element={<BrokerMetrics />}
        />
      </Routes>
    </>
  );
};

export default Broker;
