import React from 'react';
import SavedFilters, {
  Props,
} from 'components/Topics/Topic/Messages/Filters/SavedFilters';
import { MessageFilters } from 'components/Topics/Topic/Messages/Filters/Filters';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

jest.mock('components/common/Icons/DeleteIcon', () => () => 'mock-DeleteIcon');

describe('SavedFilter Component', () => {
  const mockFilters: MessageFilters[] = [
    { name: 'My Filter', code: 'code' },
    { name: 'One More Filter', code: 'code1' },
  ];

  const setUpComponent = (props: Partial<Props> = {}) => {
    return render(
      <SavedFilters
        filters={props.filters || mockFilters}
        onEdit={props.onEdit || jest.fn()}
        closeModal={props.closeModal || jest.fn()}
        onGoBack={props.onGoBack || jest.fn()}
        activeFilterHandler={props.activeFilterHandler || jest.fn()}
        deleteFilter={props.deleteFilter || jest.fn()}
      />
    );
  };

  const getSavedFilters = () => screen.getAllByRole('savedFilter');

  it('should check the Cancel button click', () => {
    const cancelMock = jest.fn();
    setUpComponent({ closeModal: cancelMock });
    userEvent.click(screen.getByText(/cancel/i));
    expect(cancelMock).toHaveBeenCalled();
  });

  it('should check on go back button click', () => {
    const onGoBackMock = jest.fn();
    setUpComponent({ onGoBack: onGoBackMock });
    userEvent.click(screen.getByText(/back to create filters/i));
    expect(onGoBackMock).toHaveBeenCalled();
  });

  describe('Empty Filters Rendering', () => {
    beforeEach(() => {
      setUpComponent({ filters: [] });
    });
    it('should check the rendering of the empty filter', () => {
      expect(screen.getByText(/no saved filter/i)).toBeInTheDocument();
      expect(screen.queryByRole('savedFilter')).not.toBeInTheDocument();
    });
  });

  describe('Saved Filters Deleting Editing', () => {
    const onEditMock = jest.fn();
    const activeFilterMock = jest.fn();
    const cancelMock = jest.fn();

    beforeEach(() => {
      setUpComponent({
        onEdit: onEditMock,
        activeFilterHandler: activeFilterMock,
        closeModal: cancelMock,
      });
    });

    afterEach(() => {
      onEditMock.mockClear();
      activeFilterMock.mockClear();
      cancelMock.mockClear();
    });

    it('should check the normal data rendering', () => {
      expect(getSavedFilters()).toHaveLength(mockFilters.length);
      expect(screen.getByText(mockFilters[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockFilters[1].name)).toBeInTheDocument();
    });

    it('should check the Filter edit Button works', () => {
      const savedFilters = getSavedFilters();
      userEvent.hover(savedFilters[0]);
      userEvent.click(within(savedFilters[0]).getByText(/edit/i));
      expect(onEditMock).toHaveBeenCalled();

      userEvent.hover(savedFilters[1]);
      userEvent.click(within(savedFilters[1]).getByText(/edit/i));
      expect(onEditMock).toHaveBeenCalledTimes(2);
    });

    it('should check the select filter', () => {
      const selectFilterButton = screen.getByText(/Select filter/i);

      userEvent.click(selectFilterButton);
      expect(activeFilterMock).not.toHaveBeenCalled();

      const savedFilterElement = getSavedFilters();
      userEvent.click(savedFilterElement[0]);
      userEvent.click(selectFilterButton);

      expect(activeFilterMock).toHaveBeenCalled();
      expect(cancelMock).toHaveBeenCalled();
    });
  });

  describe('Saved Filters Deletion', () => {
    const deleteMock = jest.fn();

    beforeEach(() => {
      setUpComponent({ deleteFilter: deleteMock });
    });

    afterEach(() => {
      deleteMock.mockClear();
    });

    it('Open Confirmation for the deletion modal', () => {
      setUpComponent({ deleteFilter: deleteMock });
      const savedFilters = getSavedFilters();
      const deleteIcons = screen.getAllByText('mock-DeleteIcon');
      userEvent.hover(savedFilters[0]);
      userEvent.click(deleteIcons[0]);
      const modelDialog = screen.getByRole('dialog');
      expect(modelDialog).toBeInTheDocument();
      expect(
        within(modelDialog).getByText('Are you sure want to remove My Filter?')
      ).toBeInTheDocument();
    });

    it('Close Confirmations deletion modal with button', async () => {
      setUpComponent({ deleteFilter: deleteMock });
      const savedFilters = getSavedFilters();
      const deleteIcons = screen.getAllByText('mock-DeleteIcon');

      userEvent.hover(savedFilters[0]);
      userEvent.click(deleteIcons[0]);

      const modelDialog = screen.getByRole('dialog');
      expect(modelDialog).toBeInTheDocument();
      const cancelButton = within(modelDialog).getByRole('button', {
        name: /Cancel/i,
      });
      await waitFor(() => userEvent.click(cancelButton));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Delete the saved filter', async () => {
      setUpComponent({ deleteFilter: deleteMock });
      const savedFilters = getSavedFilters();
      const deleteIcons = screen.getAllByText('mock-DeleteIcon');

      userEvent.hover(savedFilters[0]);
      userEvent.click(deleteIcons[0]);

      await waitFor(() =>
        userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
      );
      expect(deleteMock).toHaveBeenCalledTimes(1);
      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
    });
  });
});
