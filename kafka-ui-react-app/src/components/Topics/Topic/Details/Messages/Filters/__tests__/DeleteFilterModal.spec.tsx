import React from 'react';
import DeleteFilterModal, {
  Props,
} from 'components/Topics/Topic/Details/Messages/Filters/DeleteFilterModal';
import { screen, waitFor } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';

describe('DeleteFilterModal Component', () => {
  const setUpComponent = (props: Props) => {
    return render(
      <DeleteFilterModal
        isOpen={props.isOpen}
        name={props.name}
        onDelete={props.onDelete}
        onClose={props.onClose}
      />
    );
  };

  describe('Modal Open', () => {
    const onDeleteMock = jest.fn();
    const onCloseMock = jest.fn();
    const nameMock = 'DeleteModalName';

    beforeEach(() => {
      setUpComponent({
        isOpen: true,
        name: nameMock,
        onDelete: onDeleteMock,
        onClose: onCloseMock,
      });
    });

    afterEach(() => {
      onDeleteMock.mockClear();
      onCloseMock.mockClear();
    });

    it('should check the rendering of the component', () => {
      expect(screen.getByRole('deletionModal')).toBeInTheDocument();
    });

    it('should check x icon calls its callback', async () => {
      const iconElement = screen.getByTestId('closeDeletionModalIcon');
      await waitFor(() => userEvent.click(iconElement));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should check cancel button calls its callback', async () => {
      const cancelBtn = screen.getByText(/cancel/i);
      await waitFor(() => userEvent.click(cancelBtn));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should check delete button calls its callback', async () => {
      const deleteBtn = screen.getByRole('button', {
        name: /delete/i,
      });
      await waitFor(() => userEvent.click(deleteBtn));
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Close', () => {
    const onDeleteMock = jest.fn();
    const onCloseMock = jest.fn();
    const nameMock = 'DeleteModalName';

    beforeEach(() => {
      setUpComponent({
        isOpen: false,
        name: nameMock,
        onDelete: onDeleteMock,
        onClose: onCloseMock,
      });
    });

    afterEach(() => {
      onDeleteMock.mockClear();
      onCloseMock.mockClear();
    });

    it('should check the non rendering of the component', () => {
      expect(screen.queryByRole('deletionModal')).not.toBeInTheDocument();
    });
  });
});
