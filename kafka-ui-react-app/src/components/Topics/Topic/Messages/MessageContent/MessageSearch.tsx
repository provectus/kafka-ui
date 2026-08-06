import React from 'react';

import { MIN_SEARCH_TERM_LENGTH } from './useEditorSearch';
import * as S from './MessageSearch.styled';

export interface MessageSearchProps {
  term: string;
  matchCount: number;
  currentMatch: number;
  onChange: (term: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

// Inline rather than from components/common/Icons so they can inherit
// currentColor: the shared ChevronDownIcon hard-codes a single fill in
// baseTheme, which leaves it invisible against the light theme.
const ChevronIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden>
    <path d="M2.5 4.5 6 8l3.5-3.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 12 12" aria-hidden>
    <path d="M3 3l6 6M9 3l-6 6" />
  </svg>
);

/**
 * Find bar for the expanded message panel. Purely presentational — all search
 * state comes from `useEditorSearch`.
 */
const MessageSearch: React.FC<MessageSearchProps> = ({
  term,
  matchCount,
  currentMatch,
  onChange,
  onNext,
  onPrevious,
  onClose,
}) => {
  const hasMatches = matchCount > 0;

  // Below the minimum length nothing has been searched yet, so reporting
  // "No results" would be a lie — say why instead.
  const statusLabel = () => {
    if (term.length === 0) return '';
    if (term.length < MIN_SEARCH_TERM_LENGTH) {
      return `${MIN_SEARCH_TERM_LENGTH}+ chars`;
    }
    return hasMatches ? `${currentMatch} / ${matchCount}` : 'No results';
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (event.shiftKey) {
        onPrevious();
      } else {
        onNext();
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <S.Bar role="search">
      <S.SearchIcon>
        <circle cx="7" cy="7" r="4.5" />
        <path d="M10.5 10.5 14 14" />
      </S.SearchIcon>
      <S.Input
        type="text"
        placeholder="Find in message"
        aria-label="Find in message"
        value={term}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        // The bar is only mounted in response to the shortcut, so taking focus
        // is what the user asked for.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <S.Count role="status">{statusLabel()}</S.Count>
      <S.Divider />
      <S.Actions>
        <S.PreviousButton
          onClick={onPrevious}
          disabled={!hasMatches}
          aria-label="Previous match"
          title="Previous match (Shift+Enter)"
        >
          <ChevronIcon />
        </S.PreviousButton>
        <S.IconButton
          onClick={onNext}
          disabled={!hasMatches}
          aria-label="Next match"
          title="Next match (Enter)"
        >
          <ChevronIcon />
        </S.IconButton>
        <S.IconButton
          onClick={onClose}
          aria-label="Close search"
          title="Close search (Esc)"
        >
          <CloseIcon />
        </S.IconButton>
      </S.Actions>
    </S.Bar>
  );
};

export default MessageSearch;
