import { SchemaType, TopicMessage } from 'generated-sources';
import React from 'react';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { formatTimestamp } from 'lib/dateTimeHelpers';
import { Row } from '@tanstack/react-table';
import {
  Label,
  List,
  SubText,
} from 'components/common/PropertiesList/PropertiesList.styled';

import * as S from './MessageContent.styled';

type Tab = 'key' | 'content' | 'headers';

const MessageContent: React.FC<{ row: Row<TopicMessage> }> = ({ row }) => {
  const {
    content,
    valueFormat,
    key,
    keyFormat,
    headers,
    timestamp,
    timestampType,
  } = row.original;

  const [activeTab, setActiveTab] = React.useState<Tab>('content');
  const activeTabContent = () => {
    switch (activeTab) {
      case 'content':
        return content;
      case 'key':
        return key;
      default:
        return JSON.stringify(headers || {});
    }
  };

  const encoder = new TextEncoder();
  const keySize = encoder.encode(key).length;
  const contentSize = encoder.encode(content).length;
  const contentType =
    content && content.trim().startsWith('{')
      ? SchemaType.JSON
      : SchemaType.PROTOBUF;
  return (
    <S.Section>
      <S.ContentBox>
        <S.Tabs>
          <S.Tab
            type="button"
            $active={activeTab === 'key'}
            onClick={() => setActiveTab('key')}
          >
            Key
          </S.Tab>
          <S.Tab
            $active={activeTab === 'content'}
            type="button"
            onClick={() => setActiveTab('content')}
          >
            Content
          </S.Tab>
          <S.Tab
            $active={activeTab === 'headers'}
            type="button"
            onClick={() => setActiveTab('headers')}
          >
            Headers
          </S.Tab>
        </S.Tabs>
        <EditorViewer
          data={activeTabContent() || ''}
          maxLines={28}
          schemaType={contentType}
        />
      </S.ContentBox>
      <S.MetadataWrapper>
        <List>
          <Label>Timestamp</Label>
          <span>
            {formatTimestamp(timestamp)}
            <SubText>Timestamp type: {timestampType}</SubText>
          </span>
          <Label>Content</Label>
          <span>
            {valueFormat}
            <SubText>
              Size: <BytesFormatted value={contentSize} />
            </SubText>
          </span>
          <Label>Key</Label>
          <span>
            {keyFormat}
            <SubText>
              Size: <BytesFormatted value={keySize} />
            </SubText>
          </span>
        </List>
      </S.MetadataWrapper>
    </S.Section>
  );
};

export default MessageContent;
