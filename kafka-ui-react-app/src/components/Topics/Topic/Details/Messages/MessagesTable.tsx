import PageLoader from 'components/common/PageLoader/PageLoader';
import CustomParamButton from 'components/Topics/shared/Form/CustomParams/CustomParamButton';
import {
  Partition,
  SeekDirection,
  TopicMessage,
  TopicMessageConsuming,
} from 'generated-sources';
import { compact, concat, groupBy, map, maxBy, minBy } from 'lodash';
import React from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { ClusterName, TopicName } from 'redux/interfaces';
import {
  getTopicMessges,
  getIsTopicMessagesFetching,
} from 'redux/reducers/topicMessages/selectors';

import Message from './Message';

export interface MessagesProps {
  clusterName: ClusterName;
  topicName: TopicName;
  messages: TopicMessage[];
  phaseMessage?: string;
  partitions: Partition[];
  meta: TopicMessageConsuming;
  addMessage(message: TopicMessage): void;
  resetMessages(): void;
  updatePhase(phase: string): void;
  updateMeta(meta: TopicMessageConsuming): void;
}

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

  return (
    <>
      <table className="table is-fullwidth">
        <thead>
          <tr>
            <th style={{ width: 40 }}> </th>
            <th style={{ width: 70 }}>Offset</th>
            <th style={{ width: 90 }}>Partition</th>
            <th>Key</th>
            <th style={{ width: 170 }}>Timestamp</th>
            <th>Content</th>
            <th> </th>
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
      </table>
      <div className="columns">
        <div className="column is-full">
          <CustomParamButton
            className="is-link is-pulled-right"
            type="fa-chevron-right"
            onClick={handleNextClick}
            btnText="Next"
          />
        </div>
      </div>
    </>
  );
};

export default MessagesTable;
