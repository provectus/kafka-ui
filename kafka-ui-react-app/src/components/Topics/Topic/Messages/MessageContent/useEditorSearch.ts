import React from 'react';
import { useDebouncedCallback } from 'use-debounce';

// Scanning the whole document is O(document), so typing must not trigger it on
// every keystroke: messages can be megabytes of JSON.
export const SEARCH_DEBOUNCE_MS = 300;
// A single character matches almost everywhere in a large payload, which is
// both useless and the most expensive scan we could run. Wait for a second one.
export const MIN_SEARCH_TERM_LENGTH = 2;

interface SearchRange {
  start: { row: number; column: number };
}

/**
 * The slice of the Ace editor API this hook drives.
 *
 * Declared structurally instead of using `Ace.Editor` for two reasons: `$search`
 * is not part of Ace's public typings, and a plain object is enough to exercise
 * the hook in tests without standing up a real editor.
 */
export interface SearchableEditor {
  session: {
    highlight(re: RegExp | RegExp[] | null): void;
  };
  $search: {
    $options: { re?: RegExp | RegExp[] | false };
    findAll(session: unknown): SearchRange[];
  };
  find(
    needle: string,
    options: {
      caseSensitive: boolean;
      regExp: boolean;
      wrap: boolean;
      skipCurrent: boolean;
      backwards: boolean;
    }
  ): SearchRange | undefined;
  findNext(): void;
  findPrevious(): void;
  clearSelection(): void;
}

const FIND_OPTIONS = {
  caseSensitive: false,
  regExp: false,
  // Wrapping keeps Ace's cursor in step with the match counter below.
  wrap: true,
  // Keep the current match selected while the term grows, so typing does not
  // jump the viewport around.
  skipCurrent: false,
  backwards: false,
};

export interface EditorSearch {
  term: string;
  matchCount: number;
  /** 1-based position of the highlighted match; 0 when there is none. */
  currentMatch: number;
  search: (term: string) => void;
  findNext: () => void;
  findPrevious: () => void;
  reset: () => void;
}

/**
 * Debounced find-in-editor state for a read-only Ace viewer.
 *
 * `editor` is null until Ace has loaded (and stays null when EditorViewer falls
 * back to plain text), in which case every operation is a no-op.
 */
const useEditorSearch = (editor: SearchableEditor | null): EditorSearch => {
  const [term, setTerm] = React.useState('');
  const [matchCount, setMatchCount] = React.useState(0);
  const [currentMatch, setCurrentMatch] = React.useState(0);

  const clearHighlight = React.useCallback(() => {
    setMatchCount(0);
    setCurrentMatch(0);
    if (!editor) return;
    editor.session.highlight(null);
    editor.clearSelection();
  }, [editor]);

  const runSearch = useDebouncedCallback((needle: string) => {
    if (!editor) return;

    if (needle.length < MIN_SEARCH_TERM_LENGTH) {
      clearHighlight();
      return;
    }

    const found = editor.find(needle, FIND_OPTIONS);
    // `find` compiles the needle into a RegExp on `$search.$options`; reusing it
    // highlights every match without assembling a second expression.
    editor.session.highlight(editor.$search.$options.re || null);

    const ranges = editor.$search.findAll(editor.session);
    setMatchCount(ranges.length);

    if (!found || ranges.length === 0) {
      setCurrentMatch(0);
      return;
    }

    // `find` starts from the cursor rather than the top of the document, so the
    // match it lands on is not necessarily the first one.
    const index = ranges.findIndex(
      (range) =>
        range.start.row === found.start.row &&
        range.start.column === found.start.column
    );
    setCurrentMatch(index === -1 ? 1 : index + 1);
  }, SEARCH_DEBOUNCE_MS);

  const search = React.useCallback(
    (nextTerm: string) => {
      setTerm(nextTerm);
      runSearch(nextTerm);
    },
    [runSearch]
  );

  // Stepping is cheap — Ace searches from the cursor — so it is not debounced.
  // The counter moves with it instead of rescanning the document.
  const step = React.useCallback(
    (direction: 1 | -1) => {
      if (!editor || matchCount === 0) return;
      if (direction === 1) {
        editor.findNext();
      } else {
        editor.findPrevious();
      }
      setCurrentMatch(
        (prev) => ((prev - 1 + direction + matchCount) % matchCount) + 1
      );
    },
    [editor, matchCount]
  );

  const findNext = React.useCallback(() => step(1), [step]);
  const findPrevious = React.useCallback(() => step(-1), [step]);

  const reset = React.useCallback(() => {
    runSearch.cancel();
    setTerm('');
    clearHighlight();
  }, [runSearch, clearHighlight]);

  // A pending scan must never land on a document that has already been swapped
  // out (tab change) or unmounted (row collapsed).
  React.useEffect(() => () => runSearch.cancel(), [runSearch]);

  return {
    term,
    matchCount,
    currentMatch,
    search,
    findNext,
    findPrevious,
    reset,
  };
};

export default useEditorSearch;
