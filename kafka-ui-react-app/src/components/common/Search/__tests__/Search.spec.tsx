import Search from 'components/common/Search/Search';
import React from 'react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

describe('Search', () => {
  const handleSearch = jest.fn();
  it('calls handleSearch on input', () => {
    render(
      <Search
        handleSearch={handleSearch}
        value=""
        placeholder="Search bt the Topic name"
      />
    );
    const input = screen.getByPlaceholderText('Search bt the Topic name');
    userEvent.click(input);
    userEvent.keyboard('value');
    expect(handleSearch).toHaveBeenCalledTimes(5);
  });

  it('when placeholder is provided', () => {
    render(
      <Search
        handleSearch={handleSearch}
        value=""
        placeholder="Search bt the Topic name"
      />
    );
    expect(
      screen.getByPlaceholderText('Search bt the Topic name')
    ).toBeInTheDocument();
  });

  it('when placeholder is not provided', () => {
    render(<Search handleSearch={handleSearch} value="" />);
    expect(screen.queryByPlaceholderText('Search')).toBeInTheDocument();
  });
});
