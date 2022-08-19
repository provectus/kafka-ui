import React from 'react';
import { useConnectorTasks } from 'lib/hooks/api/kafkaConnect';
import useAppParams from 'lib/hooks/useAppParams';
import { RouterParamsClusterConnectConnector } from 'lib/paths';
import { ColumnDef, Row } from '@tanstack/react-table';
import { Task } from 'generated-sources';
import Table, { TagCell } from 'components/common/NewTable';

import ActionsCellTasks from './ActionsCellTasks';

const ExpandedTaskRow: React.FC<{ row: Row<Task> }> = ({ row }) => {
  return <div>{row.original.status.trace}</div>;
};

const MAX_LENGTH = 100;

const Tasks: React.FC = () => {
  const routerProps = useAppParams<RouterParamsClusterConnectConnector>();
  const { data = [] } = useConnectorTasks(routerProps);

  const columns = React.useMemo<ColumnDef<Task>[]>(
    () => [
      { header: 'ID', accessorKey: 'status.id' },
      { header: 'Worker', accessorKey: 'status.workerId' },
      { header: 'State', accessorKey: 'status.state', cell: TagCell },
      {
        header: 'Trace',
        accessorKey: 'status.trace',
        enableSorting: false,
        cell: ({ getValue }) => {
          const trace = getValue<string>() || '';
          return trace.toString().length > MAX_LENGTH
            ? `${trace.toString().substring(0, MAX_LENGTH - 3)}...`
            : trace;
        },
        meta: { width: '70%' },
      },
      {
        id: 'actions',
        header: '',
        cell: ActionsCellTasks,
      },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={data}
      emptyMessage="No tasks found"
      enableSorting
      getRowCanExpand={(row) => row.original.status.trace?.length > 0}
      renderSubComponent={ExpandedTaskRow}
    />
  );
};

export default Tasks;
