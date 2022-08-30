import { TopicMessageTimestampTypeEnum, SchemaType } from 'generated-sources';
import React from 'react';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { formatTimestamp } from 'lib/dateTimeHelpers';

import * as S from './MessageContent.styled';

type Tab = 'key' | 'content' | 'headers';

export interface MessageContentProps {
  messageKey?: string;
  messageKeyFormat?: string;
  messageContent?: string;
  messageContentFormat?: string;
  headers?: { [key: string]: string | undefined };
  timestamp?: Date;
  timestampType?: TopicMessageTimestampTypeEnum;
}

const MessageContent: React.FC<MessageContentProps> = ({
  messageKey,
  messageKeyFormat,
  messageContent,
  messageContentFormat,
  headers,
  timestamp,
  timestampType,
}) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('content');
  const activeTabContent = () => {
    switch (activeTab) {
      case 'content':
        return messageContent;
      case 'key':
        return messageKey;
      default:
        return JSON.stringify(headers);
    }
  };
  const handleKeyTabClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('key');
  };
  const handleContentTabClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('content');
  };
  const handleHeadersTabClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab('headers');
  };
  const keySize = new TextEncoder().encode(messageKey).length;
  const contentSize = new TextEncoder().encode(messageContent).length;
  const contentType =
    messageContent && messageContent.trim().startsWith('{')
      ? SchemaType.JSON
      : SchemaType.PROTOBUF;
  return (
    <S.Wrapper>
      <td colSpan={10}>
        <S.Section>
          <S.ContentBox>
            <S.Tabs>
              <S.Tab
                type="button"
                $active={activeTab === 'key'}
                onClick={handleKeyTabClick}
              >
                Key
              </S.Tab>
              <S.Tab
                $active={activeTab === 'content'}
                type="button"
                onClick={handleContentTabClick}
              >
                Content
              </S.Tab>
              <S.Tab
                $active={activeTab === 'headers'}
                type="button"
                onClick={handleHeadersTabClick}
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
            <S.Metadata>
              <S.MetadataLabel>Timestamp</S.MetadataLabel>
              <span>
                <S.MetadataValue>{formatTimestamp(timestamp)}</S.MetadataValue>
                <S.MetadataMeta>Timestamp type: {timestampType}</S.MetadataMeta>
              </span>
            </S.Metadata>

            <S.Metadata>
              <S.MetadataLabel>Content</S.MetadataLabel>
              <span>
                <S.MetadataValue>{messageContentFormat}</S.MetadataValue>
                <S.MetadataMeta>
                  Size: <BytesFormatted value={contentSize} />
                </S.MetadataMeta>
              </span>
            </S.Metadata>

            <S.Metadata>
              <S.MetadataLabel>Key</S.MetadataLabel>
              <span>
                <S.MetadataValue>{messageKeyFormat}</S.MetadataValue>
                <S.MetadataMeta>
                  Size: <BytesFormatted value={keySize} />
                </S.MetadataMeta>
              </span>
            </S.Metadata>
          </S.MetadataWrapper>
        </S.Section>
      </td>
    </S.Wrapper>
  );
};

export default MessageContent;
