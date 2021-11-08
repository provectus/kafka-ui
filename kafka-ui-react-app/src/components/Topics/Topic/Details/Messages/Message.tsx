import * as React from 'react';
import dayjs from 'dayjs';
import { TopicMessage } from 'generated-sources';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import useDataSaver from 'lib/hooks/useDataSaver';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { styled } from 'lib/themedStyles';

import MessageContent from './MessageContent/MessageContent';

const StyledDataCell = styled.td`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 350px;
  min-width: 350px;
`;

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
          <IconButtonWrapper onClick={toggleIsOpen} aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </td>
        <td>{offset}</td>
        <td>{partition}</td>
        <td>
          <div>{dayjs(timestamp).format('MM.DD.YYYY HH:mm:ss')}</div>
        </td>
        <StyledDataCell title={key}>{key}</StyledDataCell>
        <StyledDataCell>{content}</StyledDataCell>
        <td style={{ width: '5%' }}>
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
