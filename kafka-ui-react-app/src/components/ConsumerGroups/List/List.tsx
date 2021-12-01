import React from 'react';
import { ClusterName } from 'redux/interfaces';
import { ConsumerGroup } from 'generated-sources';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import PageHeading from 'components/common/PageHeading/PageHeading';
import Search from 'components/common/Search/Search';
import { ControlPanelWrapper } from 'components/common/ControlPanel/ControlPanel.styled';

import ListItem from './ListItem';

export interface ListProps {
  clusterName: ClusterName;
  consumerGroups: ConsumerGroup[];
}

const List: React.FC<ListProps> = ({ consumerGroups }) => {
  const [searchText, setSearchText] = React.useState<string>('');

  const handleInputChange = (search: string) => {
    setSearchText(search);
  };

  return (
    <div>
      <PageHeading text="Consumers" />
      <ControlPanelWrapper hasInput>
        <Search
          placeholder="Search"
          value={searchText}
          handleSearch={handleInputChange}
        />
      </ControlPanelWrapper>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell title="Consumer group ID" />
            <TableHeaderCell title="Num of members" />
            <TableHeaderCell title="Num of topics" />
            <TableHeaderCell title="Messages behind" />
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
