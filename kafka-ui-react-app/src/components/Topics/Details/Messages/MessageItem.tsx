import React from 'react';
import { format } from 'date-fns';
import JSONTree from 'react-json-tree';
import { TopicMessage } from 'generated-sources';

interface MessageItemProp {
  partition: TopicMessage['partition'];
  offset: TopicMessage['offset'];
  timestamp: TopicMessage['timestamp'];
  content: Record<string, unknown>;
}

const MessageItem: React.FC<MessageItemProp> = ({
  partition,
  offset,
  timestamp,
  content,
}) => {
  const getFormattedDate = (date: Date) => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const getMessageContentBody = (messageContent: Record<string, unknown>) => {
    try {
      const contentObj =
        typeof messageContent !== 'object'
          ? JSON.parse(messageContent)
          : messageContent;
      return (
        <JSONTree
          data={contentObj}
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
      );
    } catch (e) {
      return messageContent;
    }
  };

  return (
    <tr key={`${timestamp}${Math.random()}`}>
      <td style={{ width: 200 }}>{getFormattedDate(timestamp)}</td>
      <td style={{ width: 150 }}>{offset}</td>
      <td style={{ width: 100 }}>{partition}</td>
      <td key={Math.random()} style={{ wordBreak: 'break-word' }}>
        {content && getMessageContentBody(content as Record<string, unknown>)}
      </td>
    </tr>
  );
};

export default MessageItem;
