import React from 'react';
import useAppParams from 'lib/hooks/useAppParams';
import { ClusterNameRoute } from 'lib/paths';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { useConnectors } from 'lib/hooks/api/kafkaConnect';
import { useSearchParams } from 'react-router-dom';

import ListItem from './ListItem';

const List: React.FC = () => {
  const { clusterName } = useAppParams<ClusterNameRoute>();
  const [searchParams] = useSearchParams();
  const { data: connectors } = useConnectors(
    clusterName,
    searchParams.get('q') || ''
  );

  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell title="Name" />
          <TableHeaderCell title="Connect" />
          <TableHeaderCell title="Type" />
          <TableHeaderCell title="Plugin" />
          <TableHeaderCell title="Topics" />
          <TableHeaderCell title="Status" />
          <TableHeaderCell title="Running Tasks" />
          <TableHeaderCell> </TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {(!connectors || connectors.length) === 0 && (
          <tr>
            <td colSpan={10}>No connectors found</td>
          </tr>
        )}
        {connectors?.map((connector) => (
          <ListItem
            key={connector.name}
            connector={connector}
            clusterName={clusterName}
          />
        ))}
      </tbody>
    </Table>
  );
};

export default List;
