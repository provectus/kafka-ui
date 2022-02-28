import PageLoader from 'components/common/PageLoader/PageLoader';
import { Table } from 'components/common/table/Table/Table.styled';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { SeekDirection, TopicMessage } from 'generated-sources';
import styled from 'styled-components';
import { compact, concat, groupBy, map, maxBy, minBy } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import {
  getTopicMessges,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';

import Message from './Message';
import * as S from './MessageContent/MessageContent.styled';

const MessagesPaginationWrapperStyled = styled.div`
  padding: 16px;
  display: flex;
  justify-content: flex-start;
`;

const MessagesTable: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const searchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location, history]
  );

  const messages = useSelector(getTopicMessges);
  const isFetching = useSelector(getIsTopicMessagesFetching);

  const handleNextClick = React.useCallback(() => {
    const seekTo = searchParams.get('seekTo');

    if (seekTo) {
      const selectedPartitions = seekTo.split(',').map((item) => {
        const [partition] = item.split('::');
        return { offset: 0, partition: parseInt(partition, 10) };
      });

      const messageUniqs = map(groupBy(messages, 'partition'), (v) =>
        searchParams.get('seekDirection') === SeekDirection.BACKWARD
          ? minBy(v, 'offset')
          : maxBy(v, 'offset')
      ).map((message) => ({
        offset: message?.offset || 0,
        partition: message?.partition || 0,
      }));

      const nextSeekTo = compact(
        map(
          groupBy(concat(selectedPartitions, messageUniqs), 'partition'),
          (v) => maxBy(v, 'offset')
        )
      )
        .map(({ offset, partition }) => `${partition}::${offset}`)
        .join(',');

      searchParams.set('seekTo', nextSeekTo);

      history.push({
        search: `?${searchParams.toString()}`,
      });
    }
  }, [searchParams, history, messages]);

  const handlePreviousClick = React.useCallback(() => {
    const seekTo = searchParams.get('seekTo');
    if (seekTo) {
      const selectedPartitions = seekTo.split(',').map((item) => {
        const [partition] = item.split('::');
        return { offset: 0, partition: parseInt(partition, 10) };
      });
      const messageUniqs = map(groupBy(messages, 'partition'), (v) =>
        searchParams.get('seekDirection') === SeekDirection.BACKWARD
          ? minBy(v, 'offset')
          : maxBy(v, 'offset')
      ).map((message) => ({
        offset: message?.offset || 0,
        partition: message?.partition || 0,
      }));
      const previousSeekTo = compact(
        map(
          groupBy(concat(selectedPartitions, messageUniqs), 'partition'),
          (v) => maxBy(v, 'offset')
        )
      )
        .map(({ offset, partition }) => `${partition}::${offset}`)
        .join(',');
      // const previousSeekTo = '0::501';

      searchParams.set('seekTo', previousSeekTo);
      history.push({
        search: `?${searchParams.toString()}`,
      });
    }
  }, [searchParams, history, messages]);

  return (
    <>
      <Table isFullwidth>
        <thead>
          <tr>
            <TableHeaderCell> </TableHeaderCell>
            <TableHeaderCell title="Offset" />
            <TableHeaderCell title="Partition" />
            <TableHeaderCell title="Timestamp" />
            <TableHeaderCell title="Key" previewText="Preview" />
            <TableHeaderCell title="Content" previewText="Preview" />
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
          {isFetching && (
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
      <MessagesPaginationWrapperStyled>
        <S.PaginationButton onClick={handlePreviousClick}>
          Previous
        </S.PaginationButton>
        <S.PaginationButton onClick={handleNextClick}>Next</S.PaginationButton>
      </MessagesPaginationWrapperStyled>
    </>
  );
};

export default MessagesTable;
