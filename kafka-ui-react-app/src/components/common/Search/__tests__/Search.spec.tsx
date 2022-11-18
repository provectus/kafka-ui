import Search from 'components/common/Search/Search';
import React from 'react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

const setSearchParamsMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useSearchParams: jest.fn(),
}));

const placeholder = 'I am a search placeholder';

describe('Search', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockImplementation(() => [
      new URLSearchParams(),
      setSearchParamsMock,
    ]);
  });
  it('calls handleSearch on input', async () => {
    render(<Search placeholder={placeholder} />);
    const input = screen.getByPlaceholderText(placeholder);
    await userEvent.click(input);
    await userEvent.keyboard('value');
    expect(setSearchParamsMock).toHaveBeenCalledTimes(5);
  });

  it('when placeholder is provided', () => {
    render(<Search placeholder={placeholder} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('when placeholder is not provided', () => {
    render(<Search />);
    expect(screen.queryByPlaceholderText('Search')).toBeInTheDocument();
  });
});
