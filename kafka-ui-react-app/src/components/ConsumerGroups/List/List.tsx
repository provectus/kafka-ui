import React from 'react';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';
import {
  ConsumerGroupDetails,
  ConsumerGroupOrdering,
  SortOrder,
} from 'generated-sources';
import ListItem from 'components/ConsumerGroups/List/ListItem';

export interface Props {
  consumerGroups: ConsumerGroupDetails[];
  orderBy: ConsumerGroupOrdering | null;
  sortOrder: SortOrder;
  setConsumerGroupsOrder(orderBy: ConsumerGroupOrdering | null): void;
  setConsumerSortOrder(obj: {
    sortOrder: SortOrder;
    orderBy: ConsumerGroupOrdering | null;
  }): void;
}

const List: React.FC<Props> = ({ consumerGroups }) => {
  const [searchText, setSearchText] = React.useState<string>('');

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
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Consumer Group ID" />
            <TableHeaderCell title="Num Of Members" />
            <TableHeaderCell title="Num Of Topics" />
            <TableHeaderCell title="Messages Behind" />
            <TableHeaderCell title="Coordinator" />
            <TableHeaderCell title="State" />
          </tr>
        </thead>
        <tbody>
          {consumerGroups
            .filter(
              (consumerGroup) =>
                !searchText || consumerGroup?.groupId?.indexOf(searchText) >= 0
            )
            .map((consumerGroup) => (
              <ListItem
                key={consumerGroup.groupId}
                consumerGroup={consumerGroup}
              />
            ))}
          {consumerGroups.length === 0 && (
            <tr>
              <td colSpan={10}>No active consumer groups</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default List;
