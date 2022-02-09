import React from 'react';
import Dropdown, { DropdownProps } from 'components/common/Dropdown/Dropdown';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import DropdownDivider from 'components/common/Dropdown/DropdownDivider';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';
import { screen } from '@testing-library/react';

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
    const wrapper = render(setupWrapper()).baseElement;
    expect(wrapper.querySelector('.dropdown')).toBeTruthy();

    expect(wrapper.querySelector('.dropdown.is-active')).toBeFalsy();
    expect(wrapper.querySelector('.dropdown.is-right')).toBeFalsy();
    expect(wrapper.querySelector('.dropdown.is-up')).toBeFalsy();

    expect(wrapper.querySelector('.dropdown-content')).toBeTruthy();
    expect(wrapper.querySelector('.dropdown-content')).toHaveTextContent('');
  });

  it('renders custom children', () => {
    const wrapper = render(setupWrapper({}, dummyChildren)).baseElement;
    expect(wrapper.querySelector('.dropdown-content')).toBeTruthy();
    expect(wrapper.querySelectorAll('.dropdown-item').length).toEqual(3);
    expect(wrapper.querySelectorAll('.dropdown-divider').length).toEqual(1);
  });

  it('renders dropdown with a right-aligned menu', () => {
    const wrapper = render(setupWrapper({ right: true })).baseElement;
    expect(wrapper.querySelector('.dropdown.is-right')).toBeTruthy();
  });

  it('renders dropdown with a popup menu', () => {
    const wrapper = render(setupWrapper({ up: true })).baseElement;
    expect(wrapper.querySelector('.dropdown.is-up')).toBeTruthy();
  });

  it('handles click', () => {
    const wrapper = render(setupWrapper()).baseElement;
    const button = screen.getByText('My Test Label');

    expect(button).toBeInTheDocument();
    expect(wrapper.querySelector('.dropdown.is-active')).toBeFalsy();

    userEvent.click(button);
    expect(wrapper.querySelector('.dropdown.is-active')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { baseElement } = render(
      setupWrapper(
        {
          right: true,
          up: true,
        },
        dummyChildren
      )
    );
    expect(baseElement).toMatchSnapshot();
  });
});
