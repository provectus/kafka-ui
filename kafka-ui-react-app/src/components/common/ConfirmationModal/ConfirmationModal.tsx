import React, { PropsWithChildren } from 'react';
import { Button } from 'components/common/Button/Button';

import { ConfirmationModalWrapper } from './ConfirmationModal.styled';

export interface ConfirmationModalProps {
  isOpen?: boolean;
  title?: React.ReactNode;
  onConfirm(): void;
  onCancel(): void;
  isConfirming?: boolean;
  submitBtnText?: string;
}

const ConfirmationModal: React.FC<
  PropsWithChildren<ConfirmationModalProps>
> = ({
  isOpen,
  children,
  title = 'Confirm the action',
  onCancel,
  onConfirm,
  isConfirming = false,
  submitBtnText = 'Submit',
}) => {
  const cancelHandler = React.useCallback(() => {
    if (!isConfirming) {
      onCancel();
    }
  }, [isConfirming, onCancel]);

  return isOpen ? (
    <ConfirmationModalWrapper>
      <div onClick={cancelHandler} aria-hidden="true" role="button" />
      <div>
        <header>
          <p>{title}</p>
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
            {submitBtnText}
          </Button>
        </footer>
      </div>
    </ConfirmationModalWrapper>
  ) : null;
};

export default ConfirmationModal;
