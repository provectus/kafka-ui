import React from 'react';
import EditorViewer from 'components/common/EditorViewer/EditorViewer';
import BytesFormatted from 'components/common/BytesFormatted/BytesFormatted';
import { SchemaType, TopicMessageTimestampTypeEnum } from 'generated-sources';
import { formatTimestamp } from 'lib/dateTimeHelpers';

import MessageSearch from './MessageSearch';
import useEditorSearch, { SearchableEditor } from './useEditorSearch';
import * as S from './MessageContent.styled';

type Tab = 'key' | 'content' | 'headers';

export interface MessageContentProps {
  messageKey?: string;
  messageContent?: string;
  headers?: { [key: string]: string | undefined };
  timestamp?: Date;
  timestampType?: TopicMessageTimestampTypeEnum;
  keySize?: number;
  contentSize?: number;
  keySerde?: string;
  valueSerde?: string;
}

const isFindShortcut = (event: React.KeyboardEvent) =>
  (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f';

const MessageContent: React.FC<MessageContentProps> = ({
  messageKey,
  messageContent,
  headers,
  timestamp,
  timestampType,
  keySize,
  contentSize,
  keySerde,
  valueSerde,
}) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('content');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [editor, setEditor] = React.useState<SearchableEditor | null>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  const messageSearch = useEditorSearch(editor);
  const { reset: resetSearch } = messageSearch;

  const closeSearch = React.useCallback(() => {
    if (isSearchOpen) {
      // The focused input is about to unmount; hand focus back to the panel so
      // the shortcut still works instead of falling through to the browser.
      panelRef.current?.focus({ preventScroll: true });
    }
    setIsSearchOpen(false);
    resetSearch();
  }, [isSearchOpen, resetSearch]);

  const openSearch = React.useCallback(() => setIsSearchOpen(true), []);

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

  const selectTab = (tab: Tab) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  const handleKeyTabClick = selectTab('key');
  const handleContentTabClick = selectTab('content');
  const handleHeadersTabClick = selectTab('headers');

  // Ace owns a hidden textarea and binds Ctrl-F/Command-F to a built-in `find`
  // command that would otherwise try to load its own search box. Registering a
  // command under the same name replaces it, so the shortcut opens this bar
  // when Ace consumes the key; when it does not, the event bubbles to the
  // panel handler below.
  const handleEditorLoad = React.useCallback(
    (loaded: unknown) => {
      const aceEditor = loaded as SearchableEditor & {
        commands: {
          addCommand(command: {
            name: string;
            bindKey: { win: string; mac: string };
            exec: () => void;
            readOnly: boolean;
          }): void;
        };
      };
      aceEditor.commands.addCommand({
        name: 'find',
        bindKey: { win: 'Ctrl-F', mac: 'Command-F' },
        exec: openSearch,
        // The viewer is read-only; without this Ace refuses to run the command.
        readOnly: true,
      });
      setEditor(aceEditor);
    },
    [openSearch]
  );

  // Covers the "clicked the row, has not clicked into the editor yet" case.
  // Falls through to the browser when there is no editor to search — that is
  // the plain-text fallback EditorViewer renders for unparseable content.
  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (isFindShortcut(event) && editor) {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key === 'Escape' && isSearchOpen) {
      event.preventDefault();
      closeSearch();
    }
  };

  // Each tab is a different document; carrying matches across would highlight
  // positions that no longer mean anything.
  React.useEffect(() => {
    closeSearch();
  }, [activeTab]);

  // Focus the panel as it opens so the shortcut works straight after the click
  // that expanded the row.
  React.useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  const contentType =
    messageContent && messageContent.trim().startsWith('{')
      ? SchemaType.JSON
      : SchemaType.PROTOBUF;

  return (
    <S.Wrapper>
      <td colSpan={10}>
        <S.Section
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={handlePanelKeyDown}
          data-testid="message-panel"
          data-search-active={isSearchOpen}
        >
          <S.ContentBox>
            <S.Toolbar>
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
                  Value
                </S.Tab>
                <S.Tab
                  $active={activeTab === 'headers'}
                  type="button"
                  onClick={handleHeadersTabClick}
                >
                  Headers
                </S.Tab>
              </S.Tabs>
              {isSearchOpen && (
                <MessageSearch
                  term={messageSearch.term}
                  matchCount={messageSearch.matchCount}
                  currentMatch={messageSearch.currentMatch}
                  onChange={messageSearch.search}
                  onNext={messageSearch.findNext}
                  onPrevious={messageSearch.findPrevious}
                  onClose={closeSearch}
                />
              )}
            </S.Toolbar>
            <EditorViewer
              data={activeTabContent() || ''}
              maxLines={28}
              schemaType={contentType}
              onLoad={handleEditorLoad}
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
              <S.MetadataLabel>Key Serde</S.MetadataLabel>
              <span>
                <S.MetadataValue>{keySerde}</S.MetadataValue>
                <S.MetadataMeta>
                  Size: <BytesFormatted value={keySize} />
                </S.MetadataMeta>
              </span>
            </S.Metadata>

            <S.Metadata>
              <S.MetadataLabel>Value Serde</S.MetadataLabel>
              <span>
                <S.MetadataValue>{valueSerde}</S.MetadataValue>
                <S.MetadataMeta>
                  Size: <BytesFormatted value={contentSize} />
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
