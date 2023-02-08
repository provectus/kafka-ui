import React from 'react';
import styled from 'styled-components';
import useDataSaver from 'lib/hooks/useDataSaver';
import { TopicMessage } from 'generated-sources';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import WarningRedIcon from 'components/common/Icons/WarningRedIcon';
import { JSONPath } from 'jsonpath-plus';

import MessageContent from './MessageContent/MessageContent';
import * as S from './MessageContent/MessageContent.styled';

const StyledDataCell = styled.td`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 350px;
  min-width: 350px;
`;

const ClickableRow = styled.tr`
  cursor: pointer;
`;

export interface PreviewFilter {
  field: string;
  path: string;
}

export interface Props {
  keyFilters: PreviewFilter[];
  contentFilters: PreviewFilter[];
  message: TopicMessage;
}

const Message: React.FC<Props> = ({
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
    valueSerde,
    keySerde,
  },
  keyFilters,
  contentFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const savedMessageJson = {
    Content: content,
    Offset: offset,
    Key: key,
    Partition: partition,
    Headers: headers,
    Timestamp: timestamp,
  };

  const savedMessage = JSON.stringify(savedMessageJson, null, '\t');
  const { copyToClipboard, saveFile } = useDataSaver(
    'topic-message',
    savedMessage || ''
  );

  const toggleIsOpen = () => setIsOpen(!isOpen);

  const [vEllipsisOpen, setVEllipsisOpen] = React.useState(false);

  const getParsedJson = (jsonValue: string) => {
    try {
      return JSON.parse(jsonValue);
    } catch (e) {
      return {};
    }
  };

  const renderFilteredJson = (
    jsonValue?: string,
    filters?: PreviewFilter[]
  ) => {
    if (!filters?.length || !jsonValue) return jsonValue;

    const parsedJson = getParsedJson(jsonValue);

    return (
      <>
        {filters.map((item) => (
          <span key={`${item.path}--${item.field}`}>
            {item.field}:{' '}
            {JSON.stringify(
              JSONPath({ path: item.path, json: parsedJson, wrap: false })
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <>
      <ClickableRow
        onMouseEnter={() => setVEllipsisOpen(true)}
        onMouseLeave={() => setVEllipsisOpen(false)}
        onClick={toggleIsOpen}
      >
        <td>
          <IconButtonWrapper aria-hidden>
            <MessageToggleIcon isOpen={isOpen} />
          </IconButtonWrapper>
        </td>
        <td>{offset}</td>
        <td>{partition}</td>
        <td>
          <div>{formatTimestamp(timestamp)}</div>
        </td>
        <StyledDataCell title={key}>
          <S.Icon>{keySerde === 'Fallback' && <WarningRedIcon />}</S.Icon>
          {renderFilteredJson(key, keyFilters)}
        </StyledDataCell>
        <StyledDataCell title={content}>
          <S.Metadata>
            <S.MetadataValue>
              <S.Icon>{valueSerde === 'Fallback' && <WarningRedIcon />}</S.Icon>
              {renderFilteredJson(content, contentFilters)}
            </S.MetadataValue>
          </S.Metadata>
        </StyledDataCell>
        <td style={{ width: '5%' }}>
          {vEllipsisOpen && (
            <Dropdown>
              <DropdownItem onClick={copyToClipboard}>
                Copy to clipboard
              </DropdownItem>
              <DropdownItem onClick={saveFile}>Save as a file</DropdownItem>
            </Dropdown>
          )}
        </td>
      </ClickableRow>
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
