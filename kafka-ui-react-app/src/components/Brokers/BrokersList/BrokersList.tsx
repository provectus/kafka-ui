import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { useNavigate } from 'react-router-dom';
import PageHeading from 'components/common/PageHeading/PageHeading';
import * as Metrics from 'components/common/Metrics';
import useAppParams from 'lib/hooks/useAppParams';
import { useBrokers } from 'lib/hooks/api/brokers';
import { useClusterStats } from 'lib/hooks/api/clusters';
import Table, { LinkCell, SizeCell } from 'components/common/NewTable';
import CheckMarkRoundIcon from 'components/common/Icons/CheckMarkRoundIcon';
import { ColumnDef } from '@tanstack/react-table';
import { clusterBrokerPath } from 'lib/paths';
import Tooltip from 'components/common/Tooltip/Tooltip';
import ColoredCell from 'components/common/NewTable/ColoredCell';

import SkewHeader from './SkewHeader/SkewHeader';
import * as S from './BrokersList.styled';

const NA = 'N/A';

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
            segmentSize: NA,
            segmentCount: NA,
          };
        }) || [];
    } else {
      brokersResource = diskUsage;
    }

    return brokersResource.map(({ brokerId, segmentSize, segmentCount }) => {
      const broker = brokers?.find(({ id }) => id === brokerId);
      return {
        brokerId,
        size: segmentSize || NA,
        count: segmentCount || NA,
        port: broker?.port,
        host: broker?.host,
        partitionsLeader: broker?.partitionsLeader,
        partitionsSkew: broker?.partitionsSkew,
        leadersSkew: broker?.leadersSkew,
        inSyncPartitions: broker?.inSyncPartitions,
      };
    });
  }, [diskUsage, brokers]);

  const columns = React.useMemo<ColumnDef<(typeof rows)[number]>[]>(
    () => [
      {
        header: 'Broker ID',
        accessorKey: 'brokerId',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <S.RowCell>
            <LinkCell
              value={`${getValue<string | number>()}`}
              to={encodeURIComponent(`${getValue<string | number>()}`)}
            />
            {getValue<string | number>() === activeControllers && (
              <Tooltip
                value={<CheckMarkRoundIcon />}
                content="Active Controller"
                placement="right"
              />
            )}
          </S.RowCell>
        ),
      },
      {
        header: 'Disk usage',
        accessorKey: 'size',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue, table, cell, column, renderValue, row }) =>
          getValue() === NA ? (
            NA
          ) : (
            <SizeCell
              table={table}
              column={column}
              row={row}
              cell={cell}
              getValue={getValue}
              renderValue={renderValue}
              renderSegments
              precision={2}
            />
          ),
      },
      {
        // eslint-disable-next-line react/no-unstable-nested-components
        header: () => <SkewHeader />,
        accessorKey: 'partitionsSkew',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => {
          const value = getValue<number>();
          return (
            <ColoredCell
              value={value ? `${value.toFixed(2)}%` : '-'}
              warn={value >= 10 && value < 20}
              attention={value >= 20}
            />
          );
        },
      },
      { header: 'Leaders', accessorKey: 'partitionsLeader' },
      {
        header: 'Leader skew',
        accessorKey: 'leadersSkew',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => {
          const value = getValue<number>();
          return (
            <ColoredCell
              value={value ? `${value.toFixed(2)}%` : '-'}
              warn={value >= 10 && value < 20}
              attention={value >= 20}
            />
          );
        },
      },
      {
        header: 'Online partitions',
        accessorKey: 'inSyncPartitions',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue, row }) => {
          const value = getValue<number>();
          return (
            <ColoredCell
              value={value}
              attention={value !== row.original.count}
            />
          );
        },
      },
      { header: 'Port', accessorKey: 'port' },
      {
        header: 'Host',
        accessorKey: 'host',
      },
    ],
    []
  );

  const replicas = (inSyncReplicasCount ?? 0) + (outOfSyncReplicasCount ?? 0);
  const areAllInSync = inSyncReplicasCount && replicas === inSyncReplicasCount;
  const partitionIsOffline = offlinePartitionCount && offlinePartitionCount > 0;

  const isActiveControllerUnKnown = typeof activeControllers === 'undefined';

  return (
    <>
      <PageHeading text="Brokers" />
      <Metrics.Wrapper>
        <Metrics.Section title="Uptime">
          <Metrics.Indicator label="Broker Count">
            {brokerCount}
          </Metrics.Indicator>
          <Metrics.Indicator
            label="Active Controller"
            isAlert={isActiveControllerUnKnown}
          >
            {isActiveControllerUnKnown ? (
              <S.DangerText>No Active Controller</S.DangerText>
            ) : (
              activeControllers
            )}
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
              {` of ${
                (onlinePartitionCount || 0) + (offlinePartitionCount || 0)
              }
              `}
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
        emptyMessage="No clusters are online"
      />
    </>
  );
};

export default BrokersList;
