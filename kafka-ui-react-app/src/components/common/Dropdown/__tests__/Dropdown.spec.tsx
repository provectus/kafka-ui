import React from 'react';
import { mount } from 'enzyme';
import Dropdown, { DropdownProps } from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import DropdownDivider from 'components/common/Dropdown/DropdownDivider';

const dummyLable = 'My Test Label';
const dummyChildren = (
  <>
    <DropdownItem onClick={jest.fn()}>Child 1</DropdownItem>
    <DropdownItem onClick={jest.fn()}>Child 2</DropdownItem>
    <DropdownDivider />
    <DropdownItem onClick={jest.fn()}>Child 3</DropdownItem>
  </>
);

describe('Dropdown', () => {
  const setupWrapper = (
    props: Partial<DropdownProps> = {},
    children: React.ReactNode = undefined
  ) => (
    <Dropdown label={dummyLable} {...props}>
      {children}
    </Dropdown>
  );

  it('renders Dropdown with initial props', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.exists('.dropdown')).toBeTruthy();

    expect(wrapper.exists('.dropdown.is-active')).toBeFalsy();
    expect(wrapper.exists('.dropdown.is-right')).toBeFalsy();
    expect(wrapper.exists('.dropdown.is-up')).toBeFalsy();

    expect(wrapper.exists('.dropdown-trigger')).toBeTruthy();
    expect(wrapper.find('.dropdown-trigger').text()).toEqual(dummyLable);
    expect(wrapper.exists('.dropdown-content')).toBeTruthy();
    expect(wrapper.find('.dropdown-content').text()).toEqual('');
  });

  it('renders custom children', () => {
    const wrapper = mount(setupWrapper({}, dummyChildren));
    expect(wrapper.exists('.dropdown-content')).toBeTruthy();
    expect(wrapper.find('.dropdown-item').length).toEqual(3);
    expect(wrapper.find('.dropdown-divider').length).toEqual(1);
  });

  it('renders dropdown with a right-aligned menu', () => {
    const wrapper = mount(setupWrapper({ right: true }));
    expect(wrapper.exists('.dropdown.is-right')).toBeTruthy();
  });

  it('renders dropdown with a popup menu', () => {
    const wrapper = mount(setupWrapper({ up: true }));
    expect(wrapper.exists('.dropdown.is-up')).toBeTruthy();
  });

  it('handles click', () => {
    const wrapper = mount(setupWrapper());
    expect(wrapper.exists('button')).toBeTruthy();
    expect(wrapper.exists('.dropdown.is-active')).toBeFalsy();

    wrapper.find('button').simulate('click');
    expect(wrapper.exists('.dropdown.is-active')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const wrapper = mount(
      setupWrapper(
        {
          right: true,
          up: true,
        },
        dummyChildren
      )
    );
    expect(wrapper).toMatchSnapshot();
  });
});
