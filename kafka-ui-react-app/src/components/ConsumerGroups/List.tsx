import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import {
  ConsumerGroupDetails,
  ConsumerGroupOrdering,
  ConsumerGroupState,
  SortOrder,
} from 'generated-sources';
import useAppParams from 'lib/hooks/useAppParams';
import { clusterConsumerGroupDetailsPath, ClusterNameRoute } from 'lib/paths';
import { ColumnDef } from '@tanstack/react-table';
import Table, { LinkCell, TagCell } from 'components/common/NewTable';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CONSUMER_GROUP_STATE_TOOLTIPS, PER_PAGE } from 'lib/constants';
import { useConsumerGroups } from 'lib/hooks/api/consumers';
import Tooltip from 'components/common/Tooltip/Tooltip';

const List = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const consumerGroups = useConsumerGroups({
    clusterName,
    orderBy: (searchParams.get('sortBy') as ConsumerGroupOrdering) || undefined,
    sortOrder:
      (searchParams.get('sortDirection')?.toUpperCase() as SortOrder) ||
      undefined,
    page: Number(searchParams.get('page') || 1),
    perPage: Number(searchParams.get('perPage') || PER_PAGE),
    search: searchParams.get('q') || '',
  });

  const columns = React.useMemo<ColumnDef<ConsumerGroupDetails>[]>(
    () => [
      {
        id: ConsumerGroupOrdering.NAME,
        header: 'Group ID',
        accessorKey: 'groupId',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: ({ getValue }) => (
          <LinkCell
            value={`${getValue<string | number>()}`}
            to={encodeURIComponent(`${getValue<string | number>()}`)}
          />
        ),
      },
      {
        id: ConsumerGroupOrdering.MEMBERS,
        header: 'Num Of Members',
        accessorKey: 'members',
      },
      {
        id: ConsumerGroupOrdering.TOPIC_NUM,
        header: 'Num Of Topics',
        accessorKey: 'topics',
      },
      {
        id: ConsumerGroupOrdering.MESSAGES_BEHIND,
        header: 'Consumer Lag',
        accessorKey: 'consumerLag',
        cell: (args) => {
          return args.getValue() || 'N/A';
        },
      },
      {
        header: 'Coordinator',
        accessorKey: 'coordinator.id',
        enableSorting: false,
      },
      {
        id: ConsumerGroupOrdering.STATE,
        header: 'State',
        accessorKey: 'state',
        // eslint-disable-next-line react/no-unstable-nested-components
        cell: (args) => {
          const value = args.getValue() as ConsumerGroupState;
          return (
            <Tooltip
              value={<TagCell {...args} />}
              content={CONSUMER_GROUP_STATE_TOOLTIPS[value]}
              placement="bottom-end"
            />
          );
        },
      },
    ],
    []
  );

  return (
    <>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search placeholder="Search by Consumer Group ID" />
      </ControlPanelWrapper>
      <Table
        columns={columns}
        pageCount={consumerGroups.data?.pageCount || 0}
        data={consumerGroups.data?.consumerGroups || []}
        emptyMessage={
          consumerGroups.isSuccess
            ? 'No active consumer groups found'
            : 'Loading...'
        }
        serverSideProcessing
        enableSorting
        onRowClick={({ original }) =>
          navigate(
            clusterConsumerGroupDetailsPath(clusterName, original.groupId)
          )
        }
        disabled={consumerGroups.isFetching}
      />
    </>
  );
};

export default List;
