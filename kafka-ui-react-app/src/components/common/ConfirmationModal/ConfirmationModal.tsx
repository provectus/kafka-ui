import React from 'react';

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
  if (!isOpen) return null;

  const cancelHandler = React.useCallback(() => {
    if (!isConfirming) {
      onCancel();
    }
  }, [isConfirming, onCancel]);

  return (
    <div className="modal is-active">
      <div
        className="modal-background"
        onClick={cancelHandler}
        aria-hidden="true"
      />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{title || 'Confirm the action'}</p>
          <button
            onClick={cancelHandler}
            type="button"
            className="delete"
            aria-label="close"
            disabled={isConfirming}
          />
        </header>
        <section className="modal-card-body">{children}</section>
        <footer className="modal-card-foot is-justify-content-flex-end">
          <button
            onClick={onConfirm}
            type="button"
            className="button is-danger"
            disabled={isConfirming}
          >
            Confirm
          </button>
          <button
            onClick={cancelHandler}
            type="button"
            className="button"
            disabled={isConfirming}
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
