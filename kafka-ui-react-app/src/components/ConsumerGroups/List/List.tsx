import React from 'react';
import { useHistory } from 'react-router';
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
import { PER_PAGE } from 'lib/constants';
import usePagination from 'lib/hooks/usePagination';

export interface Props {
  consumerGroups: ConsumerGroupDetails[];
  orderBy: ConsumerGroupOrdering | null;
  sortOrder: SortOrder;
  totalPages: number;
  search: string;
  setConsumerGroupsSortOrderBy(orderBy: ConsumerGroupOrdering | null): void;
  setConsumerGroupsSearch(str: string): void;
}

const List: React.FC<Props> = ({
  consumerGroups,
  sortOrder,
  orderBy,
  totalPages,
  search,
  setConsumerGroupsSortOrderBy,
  setConsumerGroupsSearch,
}) => {
  const history = useHistory();
  const { perPage, pathname } = usePagination();

  const tableState = useTableState<
    ConsumerGroupDetails,
    string,
    ConsumerGroupOrdering
  >(
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

  const handleInputChange = (searchText: string) => {
    setConsumerGroupsSearch(searchText);
    history.push(`${pathname}?page=1&perPage=${perPage || PER_PAGE}`);
  };

  return (
    <div>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search by Consumer Group ID"
          value={search}
          handleSearch={handleInputChange}
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
