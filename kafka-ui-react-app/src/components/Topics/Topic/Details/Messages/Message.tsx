import * as React from 'react';
import dayjs from 'dayjs';
import { TopicMessage } from 'generated-sources';
import Dropdown from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import useDataSaver from 'lib/hooks/useDataSaver';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import styled from 'styled-components';
import { alertAdded, alertDissmissed } from 'redux/reducers/alerts/alertsSlice';
import { useAppDispatch } from 'lib/hooks/redux';

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
    valueFormat,
    keyFormat,
    headers,
  },
}) => {
  const AUTO_DISSMIS_TIME = 2000;
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = React.useState(false);
  const { copyToClipboard, saveFile } = useDataSaver(
    'topic-message',
    content || ''
  );

  const test = () => {
    copyToClipboard();
    dispatch(
      alertAdded({
        id: 'topic-message',
        type: 'success',
        title: '',
        message: 'Copied successfully!',
        createdAt: Date.now(),
      })
    );
    setTimeout(
      () => dispatch(alertDissmissed('topic-message')),
      AUTO_DISSMIS_TIME
    );
  };

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
              <DropdownItem onClick={test}>Copy to clipboard</DropdownItem>
              <DropdownItem onClick={saveFile}>Save as a file</DropdownItem>
            </Dropdown>
          )}
        </td>
      </tr>
      {isOpen && (
        <MessageContent
          messageKey={key}
          messageKeyFormat={keyFormat}
          messageContent={content}
          messageContentFormat={valueFormat}
          headers={headers}
          timestamp={timestamp}
          timestampType={timestampType}
        />
      )}
    </>
  );
};

export default Message;
