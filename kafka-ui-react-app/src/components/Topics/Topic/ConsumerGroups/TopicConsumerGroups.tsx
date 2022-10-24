import React from 'react';
import { clusterConsumerGroupsPath, RouteParamsClusterTopic } from 'lib/paths';
import { ConsumerGroup } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { useTopicConsumerGroups } from 'lib/hooks/api/topics';
import { ColumnDef } from '@tanstack/react-table';
import Table, { LinkCell, TagCell } from 'components/common/NewTable';

const TopicConsumerGroups: React.FC = () => {
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const { data: consumerGroups = [] } = useTopicConsumerGroups({
    clusterName,
    topicName,
  });
  const columns = React.useMemo<ColumnDef<ConsumerGroup>[]>(
    () => [
      {
        header: 'Consumer Group ID',
        accessorKey: 'groupId',
        enableSorting: false,
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ row }) => (
          <LinkCell
            value={row.original.groupId}
            to={`${clusterConsumerGroupsPath(clusterName)}/${
              row.original.groupId
            }`}
          />
        ),
      },
      {
        header: 'Active Consumers',
        accessorKey: 'members',
        enableSorting: false,
      },
      {
        header: 'Messages Behind',
        accessorKey: 'messagesBehind',
        enableSorting: false,
      },
      {
        header: 'Coordinator',
        accessorKey: 'coordinator',
        enableSorting: false,
        cell: ({ getValue }) => {
          const coordinator = getValue<ConsumerGroup['coordinator']>();
          if (coordinator === undefined) {
            return 0;
          }
          return coordinator.id;
        },
      },
      {
        header: 'State',
        accessorKey: 'state',
        enableSorting: false,
        cell: TagCell,
      },
    ],
    []
  );
  return (
    <Table
      columns={columns}
      data={consumerGroups}
      enableSorting
      emptyMessage="No active consumer groups"
    />
  );
};

export default TopicConsumerGroups;
