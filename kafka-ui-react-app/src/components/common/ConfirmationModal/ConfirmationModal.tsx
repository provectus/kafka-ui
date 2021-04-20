import React from 'react';

export interface ConfirmationModalProps {
  isOpen?: boolean;
  title?: React.ReactNode;
  onConfirm(): void;
  onCancel(): void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  children,
  title,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onCancel} aria-hidden="true" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">{title || 'Confirm the action'}</p>
          <button
            onClick={onCancel}
            type="button"
            className="delete"
            aria-label="close"
          />
        </header>
        <section className="modal-card-body">{children}</section>
        <footer className="modal-card-foot is-justify-content-flex-end">
          <button
            onClick={onConfirm}
            type="button"
            className="button is-danger"
          >
            Confirm
          </button>
          <button onClick={onCancel} type="button" className="button">
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmationModal;
