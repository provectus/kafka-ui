import React, { useMemo } from 'react';
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

export interface Props {
  consumerGroups: ConsumerGroupDetails[];
  orderBy: ConsumerGroupOrdering | null;
  sortOrder: SortOrder;
  totalPages: number;
  setConsumerGroupsSortOrderBy(orderBy: ConsumerGroupOrdering | null): void;
}

const List: React.FC<Props> = ({
  consumerGroups,
  sortOrder,
  orderBy,
  totalPages,
  setConsumerGroupsSortOrderBy,
}) => {
  const [searchText, setSearchText] = React.useState<string>('');

  const tableData = useMemo(() => {
    return consumerGroups.filter(
      (consumerGroup) =>
        !searchText || consumerGroup?.groupId?.indexOf(searchText) >= 0
    );
  }, [searchText, consumerGroups]);

  const tableState = useTableState<
    ConsumerGroupDetails,
    string,
    ConsumerGroupOrdering
  >(
    tableData,
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

  const handleInputChange = (search: string) => {
    setSearchText(search);
  };

  return (
    <div>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search by Consumer Group ID"
          value={searchText}
          handleSearch={handleInputChange}
        />
      </ControlPanelWrapper>
      <SmartTable
        tableState={tableState}
        isFullwidth
        placeholder="No active consumer groups"
        hoverable
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
