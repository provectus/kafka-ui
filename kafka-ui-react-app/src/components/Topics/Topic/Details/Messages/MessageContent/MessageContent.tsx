import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import React from 'react';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';
import { SecondaryTabs } from 'components/common/Tabs/SecondaryTabs.styled';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

import {
  ContentBox,
  StyledSection,
  MessageContentWrapper,
  Metadata,
  MetadataLabel,
  MetadataMeta,
  MetadataValue,
  MetadataWrapper,
} from './MessageContent.styled';

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

  return (
    <MessageContentWrapper>
      <td colSpan={10}>
        <StyledSection>
          <ContentBox>
            <SecondaryTabs>
              <button
                type="button"
                className={activeTab === 'key' ? 'is-active' : ''}
                onClick={handleKeyTabClick}
              >
                Key
              </button>
              <button
                className={activeTab === 'content' ? 'is-active' : ''}
                type="button"
                onClick={handleContentTabClick}
              >
                Content
              </button>
              <button
                className={activeTab === 'headers' ? 'is-active' : ''}
                type="button"
                onClick={handleHeadersTabClick}
              >
                Headers
              </button>
            </SecondaryTabs>
            <JSONViewer data={activeTabContent() || ''} />
          </ContentBox>
          <MetadataWrapper>
            <Metadata>
              <MetadataLabel>Timestamp</MetadataLabel>
              <span>
                <MetadataValue>{timestamp?.toLocaleString()}</MetadataValue>
                <MetadataMeta>Timestamp type: {timestampType}</MetadataMeta>
              </span>
            </Metadata>

            <Metadata>
              <MetadataLabel>Content</MetadataLabel>
              <span>
                <MetadataValue>{messageContentFormat}</MetadataValue>
                <MetadataMeta>
                  Size: <BytesFormatted value={contentSize} />
                </MetadataMeta>
              </span>
            </Metadata>

            <Metadata>
              <MetadataLabel>Key</MetadataLabel>
              <span>
                <MetadataValue>{messageKeyFormat}</MetadataValue>
                <MetadataMeta>
                  Size: <BytesFormatted value={keySize} />
                </MetadataMeta>
              </span>
            </Metadata>
          </MetadataWrapper>
        </StyledSection>
      </td>
    </MessageContentWrapper>
  );
};

export default MessageContent;
