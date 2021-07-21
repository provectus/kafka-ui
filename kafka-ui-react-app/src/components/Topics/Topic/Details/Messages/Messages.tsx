import {
  Partition,
  TopicMessage,
  TopicMessageConsuming,
  TopicMessageEvent,
  TopicMessageEventTypeEnum,
} from 'generated-sources';
import React, { useMemo, useEffect } from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';

import Filters, { Query } from './Filters';
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

const Messages: React.FC<MessagesProps> = ({
  clusterName,
  topicName,
  messages,
  partitions,
  phaseMessage,
  meta,
  addMessage,
  resetMessages,
  updatePhase,
  updateMeta,
}) => {
  const [query, setQuery] = React.useState<Query>({});
  const [isFetching, setIsFetching] = React.useState<boolean | undefined>();

  const url = useMemo(() => {
    const qs = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');

    return `/api/clusters/${clusterName}/topics/${topicName}/messages?${qs}`;
  }, [clusterName, topicName, query]);

  useEffect(() => {
    const sse = new EventSource(url);

    sse.onopen = () => {
      setIsFetching(true);
      resetMessages();
    };
    sse.onmessage = ({ data }) => {
      const { type, message, phase, consuming }: TopicMessageEvent =
        JSON.parse(data);

      switch (type) {
        case TopicMessageEventTypeEnum.MESSAGE:
          if (message) addMessage(message);
          break;
        case TopicMessageEventTypeEnum.PHASE:
          if (phase?.name) updatePhase(phase.name);
          break;
        case TopicMessageEventTypeEnum.CONSUMING:
          if (consuming) updateMeta(consuming);
          break;
        default:
      }
    };

    sse.onerror = () => {
      setIsFetching(false);
      sse.close();
    };

    return () => {
      setIsFetching(false);
      sse.close();
    };
  }, [url]);

  return (
    <div className="box">
      <Filters
        partitions={partitions}
        phase={phaseMessage}
        meta={meta}
        onSubmit={setQuery}
        isFetching={!!isFetching}
      />
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
              key={`${message.offset}-${message.timestamp}-${message.key}`}
              message={message}
            />
          ))}
          {isFetching === false && messages.length === 0 && (
            <tr>
              <td colSpan={10}>No messages found</td>
            </tr>
          )}
          {isFetching === undefined && messages.length === 0 && (
            <tr>
              <td colSpan={10}>{phaseMessage}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Messages;
