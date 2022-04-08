import React, { FC } from 'react';
import { Button } from 'components/common/Button/Button';

import * as S from './Filters.styled';

export interface Props {
  isOpen: boolean;
  name: string;
  onDelete(): void;
  onClose(): void;
}

const DeleteFilterModal: FC<Props> = ({ isOpen, name, onClose, onDelete }) => {
  return isOpen ? (
    <S.ConfirmDeletionModal>
      <S.ConfirmDeletionModalHeader>
        <S.ConfirmDeletionTitle>Confirm deletion</S.ConfirmDeletionTitle>
        <S.CloseDeletionModalIcon
          data-testid="closeDeletionModalIcon"
          onClick={onClose}
        >
          <i className="fas fa-times-circle" />
        </S.CloseDeletionModalIcon>
      </S.ConfirmDeletionModalHeader>
      <S.ConfirmDeletionText>
        Are you sure want to remove {name}?
      </S.ConfirmDeletionText>
      <S.FilterButtonWrapper>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          buttonSize="M"
          buttonType="primary"
          type="button"
          onClick={onDelete}
        >
          Delete
        </Button>
      </S.FilterButtonWrapper>
    </S.ConfirmDeletionModal>
  ) : null;
};

export default DeleteFilterModal;
