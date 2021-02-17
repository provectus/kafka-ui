import React from 'react';
import { format } from 'date-fns';
import JSONTree from 'react-json-tree';
import { TopicMessage } from 'generated-sources';

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
      {content && (
        <JSONTree
          data={content}
          hideRoot
          invertTheme={false}
          theme={{
            tree: ({ style }) => ({
              style: {
                ...style,
                backgroundColor: undefined,
                marginLeft: 0,
                marginTop: 0,
              },
            }),
            value: ({ style }) => ({
              style: { ...style, marginLeft: 0 },
            }),
            base0D: '#3273dc',
            base0B: '#363636',
          }}
        />
      )}
    </td>
  </tr>
);

export default MessageItem;
