import React from 'react';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import { render } from 'lib/testHelpers';
import { fireEvent } from '@testing-library/dom';

const onClick = jest.fn();

describe('DropdownItem', () => {
  it('matches snapshot', () => {
    const wrapper = render(
      <DropdownItem onClick={jest.fn()}>Item 1</DropdownItem>
    );
    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper.baseElement).toMatchSnapshot();
  });

  it('handles Click', () => {
    const wrapper = render(
      <DropdownItem onClick={onClick}>Item 1</DropdownItem>
    );

    const dropDown = wrapper.getByText('Item 1');

    fireEvent.click(dropDown);
    expect(onClick).toHaveBeenCalled();
  });
});
