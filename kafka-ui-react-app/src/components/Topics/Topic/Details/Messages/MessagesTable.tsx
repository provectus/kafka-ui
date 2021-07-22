import React from 'react';
import { TopicMessage } from 'generated-sources';
import CustomParamButton from 'components/Topics/shared/Form/CustomParams/CustomParamButton';

import MessageItem from './MessageItem';

export interface MessagesTableProp {
  messages: TopicMessage[];
  onNext(event: React.MouseEvent<HTMLButtonElement>): void;
}

const MessagesTable: React.FC<MessagesTableProp> = ({ messages, onNext }) => (
  <>
    <table className="table is-fullwidth is-narrow">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Key</th>
          <th>Offset</th>
          <th>Partition</th>
          <th>Content</th>
          <th> </th>
        </tr>
      </thead>
      <tbody>
        {messages.map(
          ({ partition, offset, timestamp, content, key }: TopicMessage) => (
            <MessageItem
              key={`message-${timestamp.getTime()}-${offset}`}
              partition={partition}
              offset={offset}
              timestamp={timestamp}
              content={content}
              messageKey={key}
            />
          )
        )}
        {messages.length === 0 && (
          <tr>
            <td colSpan={10}>No messages at selected topic</td>
          </tr>
        )}
      </tbody>
    </table>
    <div className="columns">
      <div className="column is-full">
        <CustomParamButton
          className="is-link is-pulled-right"
          type="fa-chevron-right"
          onClick={onNext}
          btnText="Next"
        />
      </div>
    </div>
  </>
);

export default MessagesTable;
