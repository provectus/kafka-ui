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
import { Button } from 'components/common/Button/Button';
import { useSearchParams } from 'react-router-dom';
import { MESSAGES_PER_PAGE } from 'lib/constants';
import * as S from 'components/common/NewTable/Table.styled';

import PreviewModal from './PreviewModal';
import Message, { PreviewFilter } from './Message';

const MessagesTable: React.FC = () => {
  const [previewFor, setPreviewFor] = useState<string | null>(null);

  const [keyFilters, setKeyFilters] = useState<PreviewFilter[]>([]);
  const [contentFilters, setContentFilters] = useState<PreviewFilter[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page');
  const { isLive } = useContext(TopicMessagesContext);

  const messages = useAppSelector(getTopicMessges);
  const isFetching = useAppSelector(getIsTopicMessagesFetching);

  const isTailing = isLive && isFetching;

  // Pagination is disabled in live mode, also we don't want to show the button
  // if we are fetching the messages or if we are at the end of the topic
  const isPaginationDisabled = isTailing || isFetching;

  const isNextPageButtonDisabled =
    isPaginationDisabled || messages.length < Number(MESSAGES_PER_PAGE);
  const isPrevPageButtonDisabled =
    isPaginationDisabled || !Number(searchParams.get('page'));

  const handleNextPage = () => {
    searchParams.set('page', String(Number(page || 0) + 1));
    setSearchParams(searchParams);
  };

  const handlePrevPage = () => {
    searchParams.set('page', String(Number(page || 0) - 1));
    setSearchParams(searchParams);
  };

  return (
    <div style={{ position: 'relative' }}>
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
                contentFilters.length
                  ? `(${contentFilters.length} selected)`
                  : ''
              }`}
              onPreview={() => setPreviewFor('content')}
            />
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
      <S.Pagination>
        <S.Pages>
          <Button
            buttonType="secondary"
            buttonSize="L"
            disabled={isPrevPageButtonDisabled}
            onClick={handlePrevPage}
          >
            ← Back
          </Button>
          <Button
            buttonType="secondary"
            buttonSize="L"
            disabled={isNextPageButtonDisabled}
            onClick={handleNextPage}
          >
            Next →
          </Button>
        </S.Pages>
      </S.Pagination>
    </div>
  );
};

export default MessagesTable;
