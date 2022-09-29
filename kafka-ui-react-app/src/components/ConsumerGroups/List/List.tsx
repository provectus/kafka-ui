import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import {
  ConsumerGroupDetails,
  ConsumerGroupOrdering,
  SortOrder,
} from 'generated-sources';
import { useAppDispatch } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import { clusterConsumerGroupDetailsPath, ClusterNameRoute } from 'lib/paths';
import { fetchConsumerGroupsPaged } from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import { ColumnDef } from '@tanstack/react-table';
import Table, { TagCell, LinkCell } from 'components/common/NewTable';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PER_PAGE } from 'lib/constants';

export interface Props {
  consumerGroups: ConsumerGroupDetails[];
  totalPages: number;
}

const List: React.FC<Props> = ({ consumerGroups, totalPages }) => {
  const dispatch = useAppDispatch();
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    dispatch(
      fetchConsumerGroupsPaged({
        clusterName,
        orderBy:
          (searchParams.get('sortBy') as ConsumerGroupOrdering) || undefined,
        sortOrder:
          (searchParams.get('sortDirection')?.toUpperCase() as SortOrder) ||
          undefined,
        page: Number(searchParams.get('page') || 1),
        perPage: Number(searchParams.get('perPage') || PER_PAGE),
        search: searchParams.get('q') || '',
      })
    );
  }, [clusterName, dispatch, searchParams]);

  const columns = React.useMemo<ColumnDef<ConsumerGroupDetails>[]>(
    () => [
      {
        id: ConsumerGroupOrdering.NAME,
        header: 'Group ID',
        accessorKey: 'groupId',
        cell: LinkCell,
      },
      {
        id: ConsumerGroupOrdering.MEMBERS,
        header: 'Num Of Members',
        accessorKey: 'members',
      },
      {
        header: 'Num Of Topics',
        accessorKey: 'topics',
        enableSorting: false,
      },
      {
        header: 'Messages Behind',
        accessorKey: 'messagesBehind',
        enableSorting: false,
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
        cell: TagCell,
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
        pageCount={totalPages}
        data={consumerGroups}
        emptyMessage="No active consumer groups found"
        serverSideProcessing
        enableSorting
        onRowClick={({ original }) =>
          navigate(
            clusterConsumerGroupDetailsPath(clusterName, original.groupId)
          )
        }
      />
    </>
  );
};

export default List;
