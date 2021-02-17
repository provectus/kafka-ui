import React from 'react';
import { format } from 'date-fns';
import { TopicMessage } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';

export interface MessageItemProp {
  partition: TopicMessage['partition'];
  offset: TopicMessage['offset'];
  timestamp: TopicMessage['timestamp'];
  content?: TopicMessage['content'];
}

const MessageItem: React.FC<MessageItemProp> = ({
  partition,
  offset,
  timestamp,
  content,
}) => (
  <tr>
    <td style={{ width: 200 }}>{format(timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
    <td style={{ width: 150 }}>{offset}</td>
    <td style={{ width: 100 }}>{partition}</td>
    <td style={{ wordBreak: 'break-word' }}>
      {content && <JSONViewer data={content as { [key: string]: string }} />}
    </td>
  </tr>
);

export default MessageItem;
