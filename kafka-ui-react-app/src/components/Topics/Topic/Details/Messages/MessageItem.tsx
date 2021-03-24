import React from 'react';
import { format } from 'date-fns';
import { TopicMessage } from 'generated-sources';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';
import { isObject } from 'lodash';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import useDataSaver from 'lib/hooks/useDataSaver';

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
}) => {
  const { copyToClipboard, saveFile } = useDataSaver(
    'topic-message',
    (content as Record<string, string>) || ''
  );

  return (
    <tr>
      <td style={{ width: 200 }}>{format(timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
      <td style={{ width: 150 }}>{offset}</td>
      <td style={{ width: 100 }}>{partition}</td>
      <td style={{ wordBreak: 'break-word' }}>
        {isObject(content) ? (
          <JSONViewer data={content as Record<string, string>} />
        ) : (
          content
        )}
      </td>
      <td className="has-text-right">
        <Dropdown
          label={
            <span className="icon">
              <i className="fas fa-cog" />
            </span>
          }
          right
        >
          <DropdownItem onClick={copyToClipboard}>
            Copy to clipboard
          </DropdownItem>
          <DropdownItem onClick={saveFile}>Save as a file</DropdownItem>
        </Dropdown>
      </td>
    </tr>
  );
};

export default MessageItem;
