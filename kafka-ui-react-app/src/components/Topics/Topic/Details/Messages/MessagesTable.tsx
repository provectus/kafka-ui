import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TopicMessage } from 'generated-sources';
import React, { useContext } from 'react';
import {
  getTopicMessges,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { useAppSelector } from 'lib/hooks/redux';

import Message from './Message';

const MessagesTable: React.FC = () => {
  const { isLive } = useContext(TopicMessagesContext);

  const messages = useAppSelector(getTopicMessges);
  const isFetching = useAppSelector(getIsTopicMessagesFetching);

  return (
    <Table isFullwidth>
      <thead>
        <tr>
          <TableHeaderCell> </TableHeaderCell>
          <TableHeaderCell title="Offset" />
          <TableHeaderCell title="Partition" />
          <TableHeaderCell title="Timestamp" />
          <TableHeaderCell title="Key" />
          <TableHeaderCell title="Content" />
          <TableHeaderCell> </TableHeaderCell>
        </tr>
      </thead>
      <tbody>
        {messages.map((message: TopicMessage) => (
          <Message
            key={[
              message.offset,
              message.timestamp,
              message.key,
              message.partition,
            ].join('-')}
            message={message}
          />
        ))}
        {isFetching && isLive && !messages.length && (
          <tr>
            <td colSpan={10}>
              <PageLoader />
            </td>
          </tr>
        )}
        {messages.length === 0 && !isFetching && (
          <tr>
            <td colSpan={10}>No messages found</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default MessagesTable;
