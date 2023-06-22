import React from 'react';
import { clusterConsumerGroupsPath, RouteParamsClusterTopic } from 'lib/paths';
import { ConsumerGroup } from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { useTopicConsumerGroups } from 'lib/hooks/api/topics';
import { ColumnDef } from '@tanstack/react-table';
import Table, { LinkCell, TagCell } from 'components/common/NewTable';
import Search from 'components/common/Search/Search';

import * as S from './TopicConsumerGroups.styled';

const TopicConsumerGroups: React.FC = () => {
  const [keyword, setKeyword] = React.useState('');
  const { clusterName, topicName } = useAppParams<RouteParamsClusterTopic>();

  const { data = [] } = useTopicConsumerGroups({
    clusterName,
    topicName,
  });

  const consumerGroups = React.useMemo(
    () =>
      data.filter(
        (item) => item.groupId.toLocaleLowerCase().indexOf(keyword) > -1
      ),
    [data, keyword]
  );

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
        header: 'Consumer Lag',
        accessorKey: 'consumerLag',
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
    <>
      <S.SearchWrapper>
        <Search
          onChange={setKeyword}
          placeholder="Search by Consumer Name"
          value={keyword}
        />
      </S.SearchWrapper>
      <Table
        columns={columns}
        data={consumerGroups}
        enableSorting
        emptyMessage="No active consumer groups"
      />
    </>
  );
};

export default TopicConsumerGroups;
