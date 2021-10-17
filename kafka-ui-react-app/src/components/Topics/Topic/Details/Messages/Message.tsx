import * as React from 'react';
import dayjs from 'dayjs';
import { TopicMessage } from 'generated-sources';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import useDataSaver from 'lib/hooks/useDataSaver';
import VerticalElipsisIcon from 'components/Topics/List/VerticalElipsisIcon';

import MessageToggleIcon from './MessageToggleIcon';
import MessageContent from './MessageContent/MessageContent';

const Message: React.FC<{ message: TopicMessage }> = ({
  message: {
    timestamp,
    timestampType,
    offset,
    key,
    partition,
    content,
    headers,
  },
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { copyToClipboard, saveFile } = useDataSaver(
    'topic-message',
    content || ''
  );

  const toggleIsOpen = () => setIsOpen(!isOpen);

  const [vEllipsisOpen, setVEllipsisOpen] = React.useState(false);

  return (
    <>
      <tr
        onMouseEnter={() => setVEllipsisOpen(true)}
        onMouseLeave={() => setVEllipsisOpen(false)}
      >
        <td>
          <span className="is-clickable" onClick={toggleIsOpen} aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </span>
        </td>
        <td>{offset}</td>
        <td>{partition}</td>
        <td>
          <div className="tag">
            {dayjs(timestamp).format('MM.DD.YYYY HH:mm:ss')}
          </div>
        </td>
        <td
          style={{ maxWidth: 350, minWidth: 350 }}
          className="has-text-overflow-ellipsis is-family-code"
          title={key}
        >
          {key}
        </td>
        <td
          style={{ maxWidth: 350, minWidth: 350 }}
          className="has-text-overflow-ellipsis is-family-code"
        >
          {content}
        </td>
        <td style={{ maxWidth: 40, minWidth: 40 }} className="has-text-right">
          {vEllipsisOpen && (
            <Dropdown label={<VerticalElipsisIcon />} right>
              <DropdownItem onClick={copyToClipboard}>
                Copy to clipboard
              </DropdownItem>
              <DropdownItem onClick={saveFile}>Save as a file</DropdownItem>
            </Dropdown>
          )}
        </td>
      </tr>
      {isOpen && (
        <MessageContent
          messageKey={key}
          messageContent={content}
          headers={headers}
          timestamp={timestamp}
          timestampType={timestampType}
        />
      )}
    </>
  );
};

export default Message;
