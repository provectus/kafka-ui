import React from 'react';
import { ClusterName, ZooKeeperStatus } from 'redux/interfaces';
import useInterval from 'lib/hooks/useInterval';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { useParams } from 'react-router';
import { Tag } from 'components/common/Tag/Tag.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Table } from 'components/common/table/Table/Table.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import { useAppDispatch, useAppSelector } from 'lib/hooks/redux';
import {
  fetchClusterStats,
  selectStats,
} from 'redux/reducers/brokers/brokersSlice';

const Brokers: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clusterName } = useParams<{ clusterName: ClusterName }>();
  const {
    brokerCount,
    activeControllers,
    zooKeeperStatus,
    onlinePartitionCount,
    offlinePartitionCount,
    inSyncReplicasCount,
    outOfSyncReplicasCount,
    underReplicatedPartitionCount,
    diskUsage,
    version,
  } = useAppSelector(selectStats);

  React.useEffect(() => {
    dispatch(fetchClusterStats(clusterName));
  }, [fetchClusterStats, clusterName]);

  useInterval(() => {
    fetchClusterStats(clusterName);
  }, 5000);

  const zkOnline = zooKeeperStatus === ZooKeeperStatus.online;

  return (
    <>
      <PageHeading text="Brokers" />
      <Metrics.Wrapper>
        <Metrics.Section title="Uptime">
          <Metrics.Indicator label="Total Brokers">
            {brokerCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Active Controllers">
            {activeControllers}
          </Metrics.Indicator>
          <Metrics.Indicator label="Zookeeper Status">
            <Tag color={zkOnline ? 'green' : 'gray'}>
              {zkOnline ? 'online' : 'offline'}
            </Tag>
          </Metrics.Indicator>
          <Metrics.Indicator label="Version">{version}</Metrics.Indicator>
        </Metrics.Section>
        <Metrics.Section title="Partitions">
          <Metrics.Indicator
            label="Online"
            isAlert
            alertType={
              offlinePartitionCount && offlinePartitionCount > 0
                ? 'error'
                : 'success'
            }
          >
            {offlinePartitionCount && offlinePartitionCount > 0 ? (
              <Metrics.RedText>{onlinePartitionCount}</Metrics.RedText>
            ) : (
              onlinePartitionCount
            )}
            <Metrics.LightText>
              {' '}
              of {(onlinePartitionCount || 0) + (offlinePartitionCount || 0)}
            </Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator label="URP" title="Under replicated partitions">
            {underReplicatedPartitionCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="In Sync Replicas">
            {inSyncReplicasCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Out Of Sync Replicas">
            {outOfSyncReplicasCount}
          </Metrics.Indicator>
        </Metrics.Section>
      </Metrics.Wrapper>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Broker" />
            <TableHeaderCell title="Segment Size (Mb)" />
            <TableHeaderCell title="Segment Count" />
          </tr>
        </thead>
        <tbody>
          {diskUsage && diskUsage.length !== 0 ? (
            diskUsage.map(({ brokerId, segmentSize, segmentCount }) => (
              <tr key={brokerId}>
                <td>{brokerId}</td>
                <td>
                  <BytesFormatted value={segmentSize} />
                </td>
                <td>{segmentCount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10}>Disk usage data not available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Brokers;
