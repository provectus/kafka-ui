import React from 'react';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import {
  ConsumerGroupDetails,
  ConsumerGroupOrdering,
  SortOrder,
} from 'generated-sources';
import { useTableState } from 'lib/hooks/useTableState';
import { SmartTable } from 'components/common/SmartTable/SmartTable';
import { TableColumn } from 'components/common/SmartTable/TableColumn';
import {
  GroupIDCell,
  StatusCell,
} from 'components/ConsumerGroups/List/ConsumerGroupsTableCells';
import usePagination from 'lib/hooks/usePagination';
import useSearch from 'lib/hooks/useSearch';
import { useAppDispatch } from 'lib/hooks/redux';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterNameRoute } from 'lib/paths';
import { fetchConsumerGroupsPaged } from 'redux/reducers/consumerGroups/consumerGroupsSlice';
import PageLoader from 'components/common/PageLoader/PageLoader';

export interface Props {
  consumerGroups: ConsumerGroupDetails[];
  orderBy: string | null;
  sortOrder: SortOrder;
  totalPages: number;
  isFetched: boolean;
  setConsumerGroupsSortOrderBy(orderBy: string | null): void;
}

const List: React.FC<Props> = ({
  consumerGroups,
  sortOrder,
  orderBy,
  totalPages,
  isFetched,
  setConsumerGroupsSortOrderBy,
}) => {
  const { page, perPage } = usePagination();
  const [searchText, handleSearchText] = useSearch();
  const dispatch = useAppDispatch();
  const { clusterName } = useAppParams<ClusterNameRoute>();

  React.useEffect(() => {
    dispatch(
      fetchConsumerGroupsPaged({
        clusterName,
        orderBy: (orderBy as ConsumerGroupOrdering) || undefined,
        sortOrder,
        page,
        perPage,
        search: searchText,
      })
    );
  }, [clusterName, orderBy, searchText, sortOrder, page, perPage, dispatch]);

  const tableState = useTableState<ConsumerGroupDetails, string>(
    consumerGroups,
    {
      totalPages,
      idSelector: (consumerGroup) => consumerGroup.groupId,
    },
    {
      handleOrderBy: setConsumerGroupsSortOrderBy,
      orderBy,
      sortOrder,
    }
  );

  if (!isFetched) {
    return <PageLoader />;
  }

  return (
    <div>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search by Consumer Group ID"
          value={searchText}
          handleSearch={handleSearchText}
        />
      </ControlPanelWrapper>
      <SmartTable
        tableState={tableState}
        isFullwidth
        placeholder="No active consumer groups"
        hoverable
        paginated
      >
        <TableColumn
          title="Consumer Group ID"
          cell={GroupIDCell}
          orderValue={ConsumerGroupOrdering.NAME}
        />
        <TableColumn
          title="Num Of Members"
          field="members"
          orderValue={ConsumerGroupOrdering.MEMBERS}
        />
        <TableColumn title="Num Of Topics" field="topics" />
        <TableColumn title="Messages Behind" field="messagesBehind" />
        <TableColumn title="Coordinator" field="coordinator.id" />
        <TableColumn
          title="State"
          cell={StatusCell}
          orderValue={ConsumerGroupOrdering.STATE}
        />
      </SmartTable>
    </div>
  );
};

export default List;
