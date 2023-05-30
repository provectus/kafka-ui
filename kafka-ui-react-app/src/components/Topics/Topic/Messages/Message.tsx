import React from 'react';
import useDataSaver from 'lib/hooks/useDataSaver';
import { TopicMessage } from 'generated-sources';
import MessageToggleIcon from 'components/common/Icons/MessageToggleIcon';
import IconButtonWrapper from 'components/common/Icons/IconButtonWrapper';
import { Dropdown, DropdownItem } from 'components/common/Dropdown';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { JSONPath } from 'jsonpath-plus';
import Ellipsis from 'components/common/Ellipsis/Ellipsis';
import WarningRedIcon from 'components/common/Icons/WarningRedIcon';
import Tooltip from 'components/common/Tooltip/Tooltip';

import MessageContent from './MessageContent/MessageContent';
import * as S from './MessageContent/MessageContent.styled';

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
    keySize,
    partition,
    content,
    valueSize,
    headers,
    valueSerde,
    keySerde,
  },
  keyFilters,
  contentFilters,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const savedMessageJson = {
    Value: content,
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
        {filters.map((item) => {
          return (
            <div key={`${item.path}--${item.field}`}>
              {item.field}:{' '}
              {JSON.stringify(
                JSONPath({ path: item.path, json: parsedJson, wrap: false })
              )}
            </div>
          );
        })}
      </>
    );
  };

  return (
    <>
      <S.ClickableRow
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
        <S.DataCell title={key}>
          <Ellipsis text={renderFilteredJson(key, keyFilters)}>
            {keySerde === 'Fallback' && (
              <Tooltip
                value={<WarningRedIcon />}
                content="Fallback serde was used"
                placement="left"
              />
            )}
          </Ellipsis>
        </S.DataCell>
        <S.DataCell title={content}>
          <S.Metadata>
            <S.MetadataValue>
              <Ellipsis text={renderFilteredJson(content, contentFilters)}>
                {valueSerde === 'Fallback' && (
                  <Tooltip
                    value={<WarningRedIcon />}
                    content="Fallback serde was used"
                    placement="left"
                  />
                )}
              </Ellipsis>
            </S.MetadataValue>
          </S.Metadata>
        </S.DataCell>
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
      </S.ClickableRow>
      {isOpen && (
        <MessageContent
          messageKey={key}
          messageContent={content}
          headers={headers}
          timestamp={timestamp}
          timestampType={timestampType}
          keySize={keySize}
          contentSize={valueSize}
          keySerde={keySerde}
          valueSerde={valueSerde}
        />
      )}
    </>
  );
};

export default Message;
