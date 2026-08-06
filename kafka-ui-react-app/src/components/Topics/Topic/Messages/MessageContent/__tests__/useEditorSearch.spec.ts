import { act, renderHook } from '@testing-library/react';
import useEditorSearch, {
  SEARCH_DEBOUNCE_MS,
  SearchableEditor,
} from 'components/Topics/Topic/Messages/MessageContent/useEditorSearch';

interface FakeEditor extends SearchableEditor {
  session: {
    highlight: jest.Mock;
  };
  $search: {
    $options: { re?: RegExp | RegExp[] | false };
    findAll: jest.Mock;
  };
  find: jest.Mock;
  findNext: jest.Mock;
  findPrevious: jest.Mock;
  clearSelection: jest.Mock;
}

const range = (row: number, column = 0) => ({ start: { row, column } });

const createEditor = (
  matches: ReturnType<typeof range>[] = [range(0), range(4), range(9)]
): FakeEditor => ({
  session: { highlight: jest.fn() },
  $search: {
    $options: { re: /needle/gi },
    findAll: jest.fn().mockReturnValue(matches),
  },
  // Default to landing on the first match, as Ace does from a fresh cursor.
  find: jest.fn().mockReturnValue(matches[0]),
  findNext: jest.fn(),
  findPrevious: jest.fn(),
  clearSelection: jest.fn(),
});

describe('useEditorSearch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Tests that deliberately leave a scan pending would otherwise flush it
    // outside of act() and warn.
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  const setup = (editor: SearchableEditor | null) =>
    renderHook(() => useEditorSearch(editor));

  const typeTerm = (
    result: ReturnType<typeof setup>['result'],
    term: string
  ) => {
    act(() => {
      result.current.search(term);
    });
  };

  const flushDebounce = () => {
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
  };

  it('exposes the term immediately, before the debounce elapses', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');

    expect(result.current.term).toBe('needle');
    expect(editor.find).not.toHaveBeenCalled();
  });

  it('runs the search once the debounce elapses', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    expect(editor.find).toHaveBeenCalledTimes(1);
    expect(editor.find).toHaveBeenCalledWith(
      'needle',
      expect.objectContaining({ caseSensitive: false, regExp: false })
    );
    expect(editor.session.highlight).toHaveBeenCalledWith(/needle/gi);
    expect(result.current.matchCount).toBe(3);
    expect(result.current.currentMatch).toBe(1);
  });

  it('scans only once for a burst of keystrokes', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    'needle'.split('').forEach((_, index) => {
      typeTerm(result, 'needle'.slice(0, index + 1));
      act(() => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS / 10);
      });
    });
    flushDebounce();

    expect(editor.find).toHaveBeenCalledTimes(1);
    expect(editor.find).toHaveBeenCalledWith('needle', expect.anything());
  });

  it('does not scan for a term below the minimum length', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'n');
    flushDebounce();

    expect(editor.find).not.toHaveBeenCalled();
    expect(editor.$search.findAll).not.toHaveBeenCalled();
    expect(result.current.matchCount).toBe(0);
  });

  it('clears highlighting when the term shrinks below the minimum length', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();
    expect(result.current.matchCount).toBe(3);

    typeTerm(result, 'n');
    flushDebounce();

    expect(editor.session.highlight).toHaveBeenLastCalledWith(null);
    expect(result.current.matchCount).toBe(0);
    expect(result.current.currentMatch).toBe(0);
  });

  it('reports zero matches when nothing is found', () => {
    const editor = createEditor([]);
    editor.find.mockReturnValue(undefined);
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    expect(result.current.matchCount).toBe(0);
    expect(result.current.currentMatch).toBe(0);
  });

  it('reports the position of the match Ace actually landed on', () => {
    const matches = [range(0), range(4), range(9)];
    const editor = createEditor(matches);
    // Ace searches from the cursor, so it can land in the middle of the list.
    editor.find.mockReturnValue(matches[1]);
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    expect(result.current.currentMatch).toBe(2);
  });

  it('falls back to the first position when the match is not in the list', () => {
    const editor = createEditor();
    // Defensive: Ace landing somewhere the scan did not report should not leave
    // the counter blank.
    editor.find.mockReturnValue(range(99, 3));
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    expect(result.current.matchCount).toBe(3);
    expect(result.current.currentMatch).toBe(1);
  });

  it('clears the highlight when Ace produces no expression', () => {
    const editor = createEditor();
    editor.$search.$options.re = undefined;
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    expect(editor.session.highlight).toHaveBeenCalledWith(null);
  });

  it('steps forward through matches and wraps around', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    act(() => result.current.findNext());
    expect(result.current.currentMatch).toBe(2);

    act(() => result.current.findNext());
    expect(result.current.currentMatch).toBe(3);

    act(() => result.current.findNext());
    expect(result.current.currentMatch).toBe(1);

    expect(editor.findNext).toHaveBeenCalledTimes(3);
    // Stepping must not trigger another full scan.
    expect(editor.$search.findAll).toHaveBeenCalledTimes(1);
  });

  it('steps backward through matches and wraps around', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    act(() => result.current.findPrevious());
    expect(result.current.currentMatch).toBe(3);

    act(() => result.current.findPrevious());
    expect(result.current.currentMatch).toBe(2);

    expect(editor.findPrevious).toHaveBeenCalledTimes(2);
  });

  it('ignores stepping when there are no matches', () => {
    const editor = createEditor([]);
    editor.find.mockReturnValue(undefined);
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    act(() => result.current.findNext());

    expect(editor.findNext).not.toHaveBeenCalled();
    expect(result.current.currentMatch).toBe(0);
  });

  it('reset clears the term, the highlight and any pending scan', () => {
    const editor = createEditor();
    const { result } = setup(editor);

    typeTerm(result, 'needle');
    flushDebounce();

    typeTerm(result, 'other');
    act(() => result.current.reset());
    flushDebounce();

    expect(result.current.term).toBe('');
    expect(result.current.matchCount).toBe(0);
    expect(editor.session.highlight).toHaveBeenLastCalledWith(null);
    expect(editor.clearSelection).toHaveBeenCalled();
    // The cancelled 'other' scan must never reach the editor.
    expect(editor.find).toHaveBeenCalledTimes(1);
    expect(editor.find).not.toHaveBeenCalledWith('other', expect.anything());
  });

  it('drops a pending scan on unmount', () => {
    const editor = createEditor();
    const { result, unmount } = setup(editor);

    typeTerm(result, 'needle');
    unmount();
    act(() => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });

    expect(editor.find).not.toHaveBeenCalled();
  });

  it('is inert while the editor has not loaded', () => {
    const { result } = setup(null);

    typeTerm(result, 'needle');
    flushDebounce();
    act(() => result.current.findNext());

    expect(result.current.term).toBe('needle');
    expect(result.current.matchCount).toBe(0);
  });
});
