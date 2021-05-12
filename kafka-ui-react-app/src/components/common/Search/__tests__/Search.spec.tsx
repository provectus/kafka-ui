import { shallow } from 'enzyme';
import Search from 'components/common/Search/Search';
import React from 'react';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

describe('Search', () => {
  const handleSearch = jest.fn();
  let component = shallow(
    <Search
      handleSearch={handleSearch}
      value=""
      placeholder="Search bt the Topic name"
    />
  );
  it('calls handleSearch on input', () => {
    component.find('input').simulate('change', { target: { value: 'test' } });
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  describe('when placeholder is provided', () => {
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });

  describe('when placeholder is not provided', () => {
    component = shallow(<Search handleSearch={handleSearch} value="" />);
    it('matches the snapshot', () => {
      expect(component).toMatchSnapshot();
    });
  });
});
