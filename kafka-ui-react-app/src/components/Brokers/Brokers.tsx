import React from 'react';
import { ClusterName, ZooKeeperStatus } from 'redux/interfaces';
import { ClusterStats } from 'generated-sources';
import useInterval from 'lib/hooks/useInterval';
import MetricsSection from 'components/common/Metrics/MetricsSection';
import Indicator from 'components/common/Metrics/Indicator';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { useParams } from 'react-router';
import TagStyled from 'components/common/Tag/Tag.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Table } from 'components/common/table/Table/Table.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import {
  MetricsLightText,
  StyledMetricsWrapper,
  MetricsRedText,
} from 'components/common/Metrics/Metrics.styled';

interface Props extends ClusterStats {
  isFetched: boolean;
  fetchClusterStats: (clusterName: ClusterName) => void;
  fetchBrokers: (clusterName: ClusterName) => void;
}

const Brokers: React.FC<Props> = ({
  brokerCount,
  activeControllers,
  zooKeeperStatus,
  onlinePartitionCount,
  offlinePartitionCount,
  inSyncReplicasCount,
  outOfSyncReplicasCount,
  underReplicatedPartitionCount,
  diskUsage,
  fetchClusterStats,
  fetchBrokers,
  version,
}) => {
  const { clusterName } = useParams<{ clusterName: ClusterName }>();

  React.useEffect(() => {
    fetchClusterStats(clusterName);
    fetchBrokers(clusterName);
  }, [fetchClusterStats, fetchBrokers, clusterName]);

  useInterval(() => {
    fetchClusterStats(clusterName);
  }, 5000);

  const zkOnline = zooKeeperStatus === ZooKeeperStatus.online;

  return (
    <>
      <div>
        <PageHeading text="Brokers" />
        <StyledMetricsWrapper>
          <MetricsSection title="Uptime">
            <Indicator label="Total Brokers">{brokerCount}</Indicator>
            <Indicator label="Active Controllers">
              {activeControllers}
            </Indicator>
            <Indicator label="Zookeeper Status">
              <TagStyled color={zkOnline ? 'green' : 'gray'}>
                {zkOnline ? 'online' : 'offline'}
              </TagStyled>
            </Indicator>
            <Indicator label="Version">{version}</Indicator>
          </MetricsSection>
          <MetricsSection title="Partitions">
            <Indicator label="Online" isAlert>
              {offlinePartitionCount && offlinePartitionCount > 0 ? (
                <MetricsRedText>{onlinePartitionCount}</MetricsRedText>
              ) : (
                onlinePartitionCount
              )}
              <MetricsLightText>
                {' '}
                of {(onlinePartitionCount || 0) + (offlinePartitionCount || 0)}
              </MetricsLightText>
            </Indicator>
            <Indicator label="URP" title="Under replicated partitions">
              {underReplicatedPartitionCount}
            </Indicator>
            <Indicator label="In Sync Replicas">
              {inSyncReplicasCount}
            </Indicator>
            <Indicator label="Out of Sync Replicas">
              {outOfSyncReplicasCount}
            </Indicator>
          </MetricsSection>
        </StyledMetricsWrapper>
      </div>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Broker" />
            <TableHeaderCell title="Segment size (Mb)" />
            <TableHeaderCell title="Segment Count" />
          </tr>
        </thead>
        <tbody>
          {diskUsage?.map((brokerDiskUsage) => (
            <tr key={brokerDiskUsage.brokerId}>
              <td>{brokerDiskUsage.brokerId}</td>
              <td>
                <BytesFormatted value={brokerDiskUsage.segmentSize} />
              </td>
              <td>{brokerDiskUsage.segmentCount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Brokers;
