import React from 'react';
import { ClusterName, ZooKeeperStatus } from 'redux/interfaces';
import { ClusterStats } from 'generated-sources';
import useInterval from 'lib/hooks/useInterval';
import cx from 'classnames';
import MetricsWrapper from 'components/common/Dashboard/MetricsWrapper';
import Indicator from 'components/common/Dashboard/Indicator';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { useParams } from 'react-router';
import TagStyled from 'components/common/Tag/Tag.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import StyledTable from 'components/common/table/Table/Table.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';

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
      <div className="section">
        <PageHeading text="Brokers" />
        <div className="metrics-box mb-2 is-flex">
          <MetricsWrapper title="Uptime">
            <Indicator label="Total Brokers">{brokerCount}</Indicator>
            <Indicator label="Active Controllers">
              {activeControllers}
            </Indicator>
            <Indicator label="Zookeeper Status">
              <TagStyled
                text={zkOnline ? 'online' : 'offline'}
                color={zkOnline ? 'green' : 'gray'}
              />
            </Indicator>
            <Indicator label="Version">{version}</Indicator>
          </MetricsWrapper>
          <MetricsWrapper title="Partitions">
            <Indicator label="Online">
              <span
                className={cx({
                  'has-text-danger': offlinePartitionCount !== 0,
                })}
              >
                {onlinePartitionCount}
              </span>
              <span className="has-text-weight-light">
                {' '}
                of {(onlinePartitionCount || 0) + (offlinePartitionCount || 0)}
              </span>
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
          </MetricsWrapper>
        </div>
      </div>
      <StyledTable isFullwidth>
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
      </StyledTable>
    </>
  );
};

export default Brokers;
