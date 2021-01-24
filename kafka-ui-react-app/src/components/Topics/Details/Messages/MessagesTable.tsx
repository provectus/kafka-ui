import React from 'react';
import { format } from 'date-fns';
import JSONTree from 'react-json-tree';
import { TopicMessage } from '../../../../generated-sources';

interface MessageProp {
  messages: TopicMessage[];
}

const MessagesTable = ({ messages }: MessageProp) => {
  const getFormattedDate = (date: Date) => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const getMessageContentBody = (content: Record<string, unknown>) => {
    try {
      const contentObj =
        typeof content !== 'object' ? JSON.parse(content) : content;
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
      return content;
    }
  };

  return (
    <table className="table is-striped is-fullwidth">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Offset</th>
          <th>Partition</th>
          <th>Content</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((message) => (
          <tr key={`${message.timestamp}${Math.random()}`}>
            <td style={{ width: 200 }}>
              {getFormattedDate(message.timestamp)}
            </td>
            <td style={{ width: 150 }}>{message.offset}</td>
            <td style={{ width: 100 }}>{message.partition}</td>
            <td key={Math.random()} style={{ wordBreak: 'break-word' }}>
              {getMessageContentBody(
                message.content as Record<string, unknown>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MessagesTable;
