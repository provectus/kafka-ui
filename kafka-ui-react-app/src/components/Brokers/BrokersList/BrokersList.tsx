import React from 'react';
import { ClusterName } from 'redux/interfaces';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { NavLink } from 'react-router-dom';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { Table } from 'components/common/table/Table/Table.styled';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import useAppParams from 'lib/hooks/useAppParams';
import useBrokers from 'lib/hooks/useBrokers';
import useClusterStats from 'lib/hooks/useClusterStats';

const BrokersList: React.FC = () => {
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const { data: clusterStats } = useClusterStats(clusterName);
  const { data: brokers } = useBrokers(clusterName);

  if (!clusterStats) return null;

  const {
    brokerCount,
    activeControllers,
    onlinePartitionCount,
    offlinePartitionCount,
    inSyncReplicasCount,
    outOfSyncReplicasCount,
    underReplicatedPartitionCount,
    diskUsage,
    version,
  } = clusterStats;

  const replicas = (inSyncReplicasCount ?? 0) + (outOfSyncReplicasCount ?? 0);
  const areAllInSync = inSyncReplicasCount && replicas === inSyncReplicasCount;
  const partitionIsOffline = offlinePartitionCount && offlinePartitionCount > 0;

  return (
    <>
      <PageHeading text="Broker" />
      <Metrics.Wrapper>
        <Metrics.Section title="Uptime">
          <Metrics.Indicator label="Total Broker">
            {brokerCount}
          </Metrics.Indicator>
          <Metrics.Indicator label="Active Controllers">
            {activeControllers}
          </Metrics.Indicator>
          <Metrics.Indicator label="Version">{version}</Metrics.Indicator>
        </Metrics.Section>
        <Metrics.Section title="Partitions">
          <Metrics.Indicator
            label="Online"
            isAlert
            alertType={partitionIsOffline ? 'error' : 'success'}
          >
            {partitionIsOffline ? (
              <Metrics.RedText>{onlinePartitionCount}</Metrics.RedText>
            ) : (
              onlinePartitionCount
            )}
            <Metrics.LightText>
              {' '}
              of {(onlinePartitionCount || 0) + (offlinePartitionCount || 0)}
            </Metrics.LightText>
          </Metrics.Indicator>
          <Metrics.Indicator
            label="URP"
            title="Under replicated partitions"
            isAlert
            alertType={!underReplicatedPartitionCount ? 'success' : 'error'}
          >
            {!underReplicatedPartitionCount ? (
              <Metrics.LightText>
                {underReplicatedPartitionCount}
              </Metrics.LightText>
            ) : (
              <Metrics.RedText>{underReplicatedPartitionCount}</Metrics.RedText>
            )}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="In Sync Replicas"
            isAlert
            alertType={areAllInSync ? 'success' : 'error'}
          >
            {areAllInSync ? (
              replicas
            ) : (
              <Metrics.RedText>{inSyncReplicasCount}</Metrics.RedText>
            )}
            <Metrics.LightText> of {replicas}</Metrics.LightText>
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
            <TableHeaderCell title="Segment Size" />
            <TableHeaderCell title="Segment Count" />
            <TableHeaderCell title="Port" />
            <TableHeaderCell title="Host" />
          </tr>
        </thead>
        <tbody>
          {(!diskUsage || diskUsage.length === 0) && (
            <tr>
              <td colSpan={10}>Disk usage data not available</td>
            </tr>
          )}

          {diskUsage &&
            diskUsage.length !== 0 &&
            diskUsage.map(({ brokerId, segmentSize, segmentCount }) => {
              const brokerItem = brokers?.find(({ id }) => id === brokerId);
              return (
                <tr key={brokerId}>
                  <td>
                    <NavLink to={`${brokerId}`} role="link">
                      {brokerId}
                    </NavLink>
                  </td>
                  <td>
                    <BytesFormatted value={segmentSize} />
                  </td>
                  <td>{segmentCount}</td>
                  <td>{brokerItem?.port}</td>
                  <td>{brokerItem?.host}</td>
                </tr>
              );
            })}
        </tbody>
      </Table>
    </>
  );
};

export default BrokersList;
