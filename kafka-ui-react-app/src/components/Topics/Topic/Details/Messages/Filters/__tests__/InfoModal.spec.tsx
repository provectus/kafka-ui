import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import AddFilter, {
  FilterModalProps,
} from 'components/Topics/Topic/Details/Messages/Filters/AddFilter';
import { render } from 'lib/testHelpers';
import React from 'react';

const editFilterMock = jest.fn();

const setupComponent = (props: Partial<FilterModalProps> = {}) =>
  render(
    <AddFilter
      toggleIsOpen={jest.fn()}
      addFilter={jest.fn()}
      deleteFilter={jest.fn()}
      activeFilterHandler={jest.fn()}
      toggleEditModal={jest.fn()}
      editFilter={editFilterMock}
      filters={[]}
      {...props}
    />
  );

const getOkButton = () => screen.getByRole('button', { name: 'Ok' });

describe('InfoModal component', () => {
  it('renders InfoModal', () => {
    setupComponent();
    userEvent.click(screen.getByRole('button', { name: 'info' }));
    expect(getOkButton()).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'info-list' })).toBeInTheDocument();
  });

  it('renders InfoModal', () => {
    setupComponent();
    userEvent.click(screen.getByRole('button', { name: 'info' }));
    userEvent.click(getOkButton());
    expect(
      screen.queryByRole('button', { name: 'Ok' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'info-list' })
    ).not.toBeInTheDocument();
  });
});
