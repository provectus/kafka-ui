import Search from 'components/common/Search/Search';
import React from 'react';
import { render } from 'lib/testHelpers';
import { fireEvent } from '@testing-library/dom';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/theme';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

describe('Search', () => {
  const handleSearch = jest.fn();
  it('calls handleSearch on input', () => {
    const component = render(
      <ThemeProvider theme={theme}>
        <Search
          handleSearch={handleSearch}
          value=""
          placeholder="Search bt the Topic name"
        />
      </ThemeProvider>
    );
    const input = component.baseElement.querySelector('input') as HTMLElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  describe('when placeholder is provided', () => {
    it('matches the snapshot', () => {
      const component = render(
        <Search
          handleSearch={handleSearch}
          value=""
          placeholder="Search bt the Topic name"
        />
      );
      expect(component.baseElement).toMatchSnapshot();
    });
  });

  describe('when placeholder is not provided', () => {
    it('matches the snapshot', () => {
      const component = render(<Search handleSearch={handleSearch} value="" />);
      expect(component.baseElement).toMatchSnapshot();
    });
  });
});
