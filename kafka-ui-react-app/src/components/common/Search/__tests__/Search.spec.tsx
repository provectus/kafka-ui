import { shallow } from 'enzyme';
import Search from 'components/common/Search/Search';
import React from 'react';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

describe('Search', () => {
  const handleSearch = jest.fn();
  const component = shallow(
    <Search
      handleSearch={handleSearch}
      value=""
      placeholder="Search bt the Topic name"
    />
  );
  it('matches the snapshot', () => {
    expect(component).toMatchSnapshot();
  });

  it('calls handleSearch on input', () => {
    component.find('input').simulate('change', { target: { value: 'test' } });
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
