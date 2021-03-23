import React from 'react';
import { mount } from 'enzyme';
import DropdownItem from '../DropdownItem';

const onClick = jest.fn();

describe('DropdownItem', () => {
  it('matches snapshot', () => {
    const wrapper = mount(
      <DropdownItem onClick={jest.fn()}>Item 1</DropdownItem>
    );
    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('handles Click', () => {
    const wrapper = mount(
      <DropdownItem onClick={onClick}>Item 1</DropdownItem>
    );
    wrapper.simulate('click');
    expect(onClick).toHaveBeenCalled();
  });
});
