import React from 'react';
import { Button } from 'components/common/Button/Button';

import { ConfirmationModalWrapper } from './ConfirmationModal.styled';

export interface ConfirmationModalProps {
  isOpen?: boolean;
  title?: React.ReactNode;
  onConfirm(): void;
  onCancel(): void;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  children,
  title,
  onCancel,
  onConfirm,
  isConfirming = false,
}) => {
  const cancelHandler = React.useCallback(() => {
    if (!isConfirming) {
      onCancel();
    }
  }, [isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <ConfirmationModalWrapper>
      <div onClick={cancelHandler} aria-hidden="true" />
      <div>
        <header>
          <p>{title || 'Confirm the action'}</p>
        </header>
        <section>{children}</section>
        <footer>
          <Button
            buttonType="secondary"
            buttonSize="M"
            onClick={cancelHandler}
            type="button"
            disabled={isConfirming}
          >
            Cancel
          </Button>

          <Button
            buttonType="primary"
            buttonSize="M"
            onClick={onConfirm}
            type="button"
            disabled={isConfirming}
          >
            Submit
          </Button>
        </footer>
      </div>
    </ConfirmationModalWrapper>
  );
};

export default ConfirmationModal;
