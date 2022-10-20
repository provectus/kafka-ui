import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { TopicMessage } from 'generated-sources';
import React, { useContext, useState } from 'react';
import {
  getTopicMessges,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';
import TopicMessagesContext from 'components/contexts/TopicMessagesContext';
import { useAppSelector } from 'lib/hooks/redux';

import PreviewModal from './PreviewModal';
import Message, { PreviewFilter } from './Message';

const MessagesTable: React.FC = () => {
  const [previewFor, setPreviewFor] = useState<string | null>(null);

  const [keyFilters, setKeyFilters] = useState<PreviewFilter[]>([]);
  const [contentFilters, setContentFilters] = useState<PreviewFilter[]>([]);

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
          <TableHeaderCell
            title="Key"
            previewText={`Preview ${
              keyFilters.length ? `(${keyFilters.length} selected)` : ''
            }`}
            onPreview={() => setPreviewFor('key')}
          />
          <TableHeaderCell
            title="Value"
            previewText={`Preview ${
              contentFilters.length ? `(${contentFilters.length} selected)` : ''
            }`}
            onPreview={() => setPreviewFor('content')}
          />
          <TableHeaderCell> </TableHeaderCell>

          {previewFor !== null && (
            <PreviewModal
              values={previewFor === 'key' ? keyFilters : contentFilters}
              toggleIsOpen={() => setPreviewFor(null)}
              setFilters={(payload: PreviewFilter[]) =>
                previewFor === 'key'
                  ? setKeyFilters(payload)
                  : setContentFilters(payload)
              }
            />
          )}
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
            keyFilters={keyFilters}
            contentFilters={contentFilters}
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
