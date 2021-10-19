import { TopicMessageTimestampTypeEnum } from 'generated-sources';
import React from 'react';
import JSONViewer from 'components/common/JSONViewer/JSONViewer';
import SecondaryTabsStyles from 'components/common/Tabs/SecondaryTabs.styled';
import { isObject } from 'lodash';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';

import { MessageContentWrapper } from './MessageContent.styled';

type Tab = 'key' | 'content' | 'headers';

interface Props {
  messageKey?: string;
  messageContent?: string;
  headers?: { [key: string]: string | undefined };
  timestamp?: Date;
  timestampType?: TopicMessageTimestampTypeEnum;
}

const MessageContent: React.FC<Props> = ({
  messageKey,
  messageContent,
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
      <td colSpan={5}>
        <div className="content-box content-wrapper">
          <SecondaryTabsStyles>
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
          </SecondaryTabsStyles>
          <div className="json-viewer-wrapper">
            <JSONViewer data={activeTabContent() || ''} />
          </div>
        </div>
      </td>
      <td colSpan={2}>
        <div className="content-box metadata-wrapper">
          <span className="metadata">
            <p className="metadata-label">Timestamp</p>
            <span>
              <p className="metadata-value">{timestamp}</p>
              <p className="metadata-meta">Timestamp type: {timestampType}</p>
            </span>
          </span>

          <span className="metadata">
            <p className="metadata-label">Content</p>
            <span>
              <p className="metadata-value">
                {isObject(messageContent && JSON.parse(messageContent))
                  ? 'JSON'
                  : 'Text'}
              </p>
              <p className="metadata-meta">
                Size: <BytesFormatted value={contentSize} />
              </p>
            </span>
          </span>

          <span className="metadata">
            <p className="metadata-label">Key</p>
            <span>
              <p className="metadata-value">
                {isObject(messageKey && JSON.parse(messageKey))
                  ? 'JSON'
                  : 'Text'}
              </p>
              <p className="metadata-meta">
                Size: <BytesFormatted value={keySize} />
              </p>
            </span>
          </span>
        </div>
      </td>
    </MessageContentWrapper>
  );
};

export default MessageContent;
