import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Table, { TimestampCell } from 'components/common/NewTable';
import { TopicMessage } from 'generated-sources';
import TruncatedTextCell from 'components/common/NewTable/TimestampCell copy';

import MessageContent from './MessageContent/MessageContent';
import ActionsCell from './ActionsCell';

const MessagesTable: React.FC<{
  messages: TopicMessage[];
  isLive: boolean;
}> = ({ messages, isLive }) => {
  const columns = React.useMemo<ColumnDef<TopicMessage>[]>(
    () => [
      { header: 'Offset', accessorKey: 'offset' },
      { header: 'Partition', accessorKey: 'partition' },
      { header: 'Timestamp', accessorKey: 'timestamp', cell: TimestampCell },
      { header: 'Key', accessorKey: 'key', cell: TruncatedTextCell },
      { header: 'Content', accessorKey: 'content', cell: TruncatedTextCell },
      { header: '', id: 'action', cell: ActionsCell },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      data={messages}
      serverSideProcessing
      pageCount={1}
      emptyMessage={isLive ? 'Consuming messages...' : 'No messages to display'}
      getRowCanExpand={() => true}
      enableRowSelection={false}
      enableSorting={false}
      renderSubComponent={MessageContent}
    />
  );
};

export default MessagesTable;
