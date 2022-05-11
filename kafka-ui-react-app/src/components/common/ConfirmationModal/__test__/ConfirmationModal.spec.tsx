import React from 'react';
import ConfirmationModal, {
  ConfirmationModalProps,
} from 'components/common/ConfirmationModal/ConfirmationModal';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'lib/testHelpers';

const confirmMock = jest.fn();
const cancelMock = jest.fn();
const body = 'Please Confirm the action!';

describe('ConfirmationModal', () => {
  const setupWrapper = (props: Partial<ConfirmationModalProps> = {}) => (
    <ConfirmationModal onCancel={cancelMock} onConfirm={confirmMock} {...props}>
      {body}
    </ConfirmationModal>
  );

  it('renders nothing', () => {
    render(setupWrapper({ isOpen: false }));
    expect(screen.queryByText(body)).not.toBeInTheDocument();
  });

  it('renders modal', () => {
    render(setupWrapper({ isOpen: true }));
    expect(screen.getByRole('dialog')).toHaveTextContent(body);
    expect(screen.getAllByRole('button').length).toEqual(2);
  });
  it('renders modal with default header', () => {
    render(setupWrapper({ isOpen: true }));
    expect(screen.getByText('Confirm the action')).toBeInTheDocument();
  });
  it('renders modal with custom header', () => {
    const title = 'My Custom Header';
    render(setupWrapper({ isOpen: true, title }));
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('Check the text on the submit button default behavior', () => {
    render(setupWrapper({ isOpen: true }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('handles onConfirm when user clicks confirm button', () => {
    render(setupWrapper({ isOpen: true }));
    const confirmBtn = screen.getByRole('button', { name: 'Submit' });
    userEvent.click(confirmBtn);
    expect(cancelMock).toHaveBeenCalledTimes(0);
    expect(confirmMock).toHaveBeenCalledTimes(1);
  });

  it('Check the text on the submit button', () => {
    const submitBtnText = 'Submit btn Text';
    render(setupWrapper({ isOpen: true, submitBtnText }));
    expect(
      screen.getByRole('button', { name: submitBtnText })
    ).toBeInTheDocument();
  });

  describe('cancellation', () => {
    describe('when not confirming', () => {
      beforeEach(() => {
        render(setupWrapper({ isOpen: true }));
      });

      it('handles onCancel when user clicks on modal-background', () => {
        const { container } = render(setupWrapper({ isOpen: true }));
        userEvent.click(container.children[0].children[0]);

        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
      it('handles onCancel when user clicks on Cancel button', () => {
        const cancelBtn = screen.getByRole('button', { name: 'Cancel' });

        userEvent.click(cancelBtn);
        expect(cancelMock).toHaveBeenCalledTimes(1);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('when confirming', () => {
      beforeEach(() => {
        render(setupWrapper({ isOpen: true, isConfirming: true }));
      });
      it('does not call onCancel when user clicks on modal-background', () => {
        userEvent.click(screen.getByRole('dialog'));
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });

      it('does not call onCancel when user clicks on Cancel button', () => {
        const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
        userEvent.click(cancelBtn);
        expect(cancelMock).toHaveBeenCalledTimes(0);
        expect(confirmMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});
