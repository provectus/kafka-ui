import React from 'react';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';

const onClick = jest.fn();

describe('DropdownItem', () => {
  it('to be in the document', () => {
    render(<DropdownItem onClick={jest.fn()}>Item 1</DropdownItem>);
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('handles Click', () => {
    render(<DropdownItem onClick={onClick}>Item 1</DropdownItem>);
    userEvent.click(screen.getByText('Item 1'));
    expect(onClick).toHaveBeenCalled();
  });
});
