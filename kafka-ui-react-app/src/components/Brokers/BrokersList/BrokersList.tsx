import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { useNavigate } from 'react-router-dom';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import useAppParams from 'lib/hooks/useAppParams';
import { useBrokers } from 'lib/hooks/api/brokers';
import { useClusterStats } from 'lib/hooks/api/clusters';
import Table, { LinkCell, SizeCell } from 'components/common/NewTable';
import { ColumnDef } from '@tanstack/react-table';
import { clusterBrokerPath } from 'lib/paths';

const BrokersList: React.FC = () => {
  const navigate = useNavigate();
  const { clusterName } = useAppParams<{ clusterName: ClusterName }>();
  const { data: clusterStats = {} } = useClusterStats(clusterName);
  const { data: brokers } = useBrokers(clusterName);

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

  const rows = React.useMemo(() => {
    let brokersResource;
    if (!diskUsage || !diskUsage?.length) {
      brokersResource =
        brokers?.map((broker) => {
          return {
            brokerId: broker.id,
            segmentSize: 'N/A',
            segmentCount: 'N/A',
          };
        }) || [];
    } else {
      brokersResource = diskUsage;
    }

    return brokersResource.map(({ brokerId, segmentSize, segmentCount }) => {
      const broker = brokers?.find(({ id }) => id === brokerId);
      return {
        brokerId,
        size: segmentSize || 'N/A',
        count: segmentCount || 'N/A',
        port: broker?.port,
        host: broker?.host,
      };
    });
  }, [diskUsage, brokers]);
  const columns = React.useMemo<ColumnDef<typeof rows>[]>(
    () => [
      {
        header: 'Broker ID',
        accessorKey: 'brokerId',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <LinkCell
            value={`${getValue<string | number>()}`}
            to={encodeURIComponent(`${getValue<string | number>()}`)}
          />
        ),
      },
      { header: 'Segment Size', accessorKey: 'size', cell: SizeCell },
      { header: 'Segment Count', accessorKey: 'count' },
      { header: 'Port', accessorKey: 'port' },
      { header: 'Host', accessorKey: 'host' },
    ],
    []
  );

  const replicas = (inSyncReplicasCount ?? 0) + (outOfSyncReplicasCount ?? 0);
  const areAllInSync = inSyncReplicasCount && replicas === inSyncReplicasCount;
  const partitionIsOffline = offlinePartitionCount && offlinePartitionCount > 0;

  return (
    <>
      <PageHeading text="Brokers" />
      <Metrics.Wrapper>
        <Metrics.Section title="Uptime">
          <Metrics.Indicator label="Broker Count">
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
      <Table
        columns={columns}
        data={rows}
        enableSorting
        onRowClick={({ original: { brokerId } }) =>
          navigate(clusterBrokerPath(clusterName, brokerId))
        }
        emptyMessage="Disk usage data not available"
      />
    </>
  );
};

export default BrokersList;
